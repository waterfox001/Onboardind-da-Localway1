import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import seedSubmissions from '../data/submissions.json';

dotenv.config();

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec';

// Serverless-safe directory: on Vercel / AWS Lambda, process.cwd() is read-only.
// /tmp is the only writable directory on Vercel serverless functions.
const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel
  ? path.join('/tmp', 'localway_data')
  : path.join(process.cwd(), 'data');

const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SCHEMA_FILE = path.join(DATA_DIR, 'schema.json');

// In-memory cache pre-seeded with bundled submissions to guarantee persistence across cold starts
let inMemorySubmissions: StoredSubmission[] = Array.isArray(seedSubmissions)
  ? ((seedSubmissions as unknown) as StoredSubmission[])
  : [];
let inMemorySettings: any = null;
let inMemorySchema: any = null;

// Initialize Gemini API client on the server (never exposed to browser)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface StoredSubmission {
  timestamp: string;
  codigoCliente?: string;
  lastModified?: string;
  finalized?: boolean;
  status?: 'Rascunho' | 'Finalizado';
  sheetSyncStatus?: 'synced' | 'pending' | 'error';
  sheetSyncError?: string;
  finalizedAt?: string;
  payload: {
    rowData: Record<string, string>;
    raw?: unknown;
    dataHora?: string;
  };
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not create data dir:', err);
  }
}

function initStorage() {
  ensureDataDir();

  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (Array.isArray(list) && list.length >= inMemorySubmissions.length) {
        inMemorySubmissions = list;
      }
    } else {
      ensureDataDir();
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(inMemorySubmissions, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Storage init fallback:', err);
  }
}

initStorage();

function readLocalSubmissions(): StoredSubmission[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      const list = JSON.parse(content || '[]');
      if (Array.isArray(list) && list.length >= inMemorySubmissions.length) {
        inMemorySubmissions = list;
      }
    }
  } catch (err) {
    console.warn('Reading from memory fallback:', err);
  }
  return inMemorySubmissions;
}

function writeLocalSubmissions(list: StoredSubmission[]) {
  inMemorySubmissions = list;
  try {
    ensureDataDir();
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write bypassed (serverless read-only), saved in memory:', err);
  }
}

/**
 * Associates new responses to an existing client if matching CNPJ, WhatsApp, Name,
 * or if Código do cliente is ALREADY provided (prevents duplicate codes).
 */
function getOrCreateClientCode(rowData: Record<string, string>): {
  clientCode: string;
  isExistingClient: boolean;
  existingIndex: number;
} {
  const list = readLocalSubmissions();

  // 1. Explicit reuse if client already has a code (e.g. LW-03)
  const existingCode = (rowData['Código do cliente'] || (rowData as any).codigoCliente || '').trim();
  if (existingCode && /^LW-\d+$/i.test(existingCode)) {
    const formattedCode = existingCode.toUpperCase();
    const idx = list.findIndex(
      (s) =>
        s.codigoCliente === formattedCode ||
        s.payload?.rowData?.['Código do cliente'] === formattedCode
    );
    return {
      clientCode: formattedCode,
      isExistingClient: idx >= 0,
      existingIndex: idx,
    };
  }

  const cnpj = (rowData['CNPJ'] || '').trim().replace(/\D/g, '');
  const whats = (rowData['WhatsApp'] || '').trim().replace(/\D/g, '');
  const nome = (rowData['Nome fantasia'] || '').trim().toLowerCase();

  // 2. Search existing submission by CNPJ, WhatsApp or Name to prevent duplication
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const existingRow = item.payload?.rowData || {};
    const eCnpj = (existingRow['CNPJ'] || '').trim().replace(/\D/g, '');
    const eWhats = (existingRow['WhatsApp'] || '').trim().replace(/\D/g, '');
    const eNome = (existingRow['Nome fantasia'] || '').trim().toLowerCase();

    const matchesCnpj = cnpj.length >= 8 && eCnpj.length >= 8 && cnpj === eCnpj;
    const matchesWhats = whats.length >= 8 && eWhats.length >= 8 && whats === eWhats;
    const matchesNome = nome.length > 2 && eNome.length > 2 && nome === eNome;

    if (matchesCnpj || matchesWhats || (matchesNome && whats.slice(-4) === eWhats.slice(-4))) {
      const code = item.codigoCliente || existingRow['Código do cliente'] || `LW-${String(i + 1).padStart(2, '0')}`;
      return { clientCode: code, isExistingClient: true, existingIndex: i };
    }
  }

  // 3. Calculate next sequential code LW-01, LW-02, ...
  const usedNumbers = new Set<number>();
  for (const item of list) {
    const code = item.codigoCliente || item.payload?.rowData?.['Código do cliente'];
    if (code && typeof code === 'string') {
      const match = code.match(/LW-(\d+)/i);
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }
  }

  let nextNum = 1;
  while (usedNumbers.has(nextNum)) {
    nextNum++;
  }

  return {
    clientCode: `LW-${String(nextNum).padStart(2, '0')}`,
    isExistingClient: false,
    existingIndex: -1,
  };
}

// Create Express app
const app = express();

// Parse JSON payloads up to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS headers for production and Vercel environments
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


// API: Health check
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Localway Onboarding API',
    environment: isVercel ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString(),
  });
});

// API: Localway Admin Authentication
app.post(['/api/admin/login', '/admin/login'], (req: Request, res: Response) => {
  const { username, email, password } = req.body || {};
  const inputUser = String(username || email || '').trim().toLowerCase();
  const inputPass = String(password || '').trim();

  const validUsers = ['localway', 'localway01@gmail.com', 'admin'];
  const validPassword = process.env.ADMIN_PASSWORD || '1706300710';

  if (validUsers.includes(inputUser) && inputPass === validPassword) {
    return res.json({
      success: true,
      message: 'Acesso administrativo autorizado.',
      username: 'Localway',
      authenticatedAt: new Date().toISOString(),
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Usuário ou senha incorretos. Verifique suas credenciais de administrador Localway.',
  });
});

// API: Submit onboarding to Database & Google Sheets
app.post(['/api/submit-onboarding', '/submit-onboarding'], async (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload || !payload.rowData) {
    return res.status(400).json({
      success: false,
      error: 'Dados do onboarding inválidos.',
    });
  }

  const now = new Date().toISOString();

  // 1. Determine unique client code with strict deduplication
  const { clientCode, isExistingClient, existingIndex } = getOrCreateClientCode(payload.rowData);
  payload.rowData['Código do cliente'] = clientCode;
  payload.rowData['Status do Onboarding'] = 'Finalizado';
  payload.rowData['Data de finalização'] = new Date().toLocaleString('pt-BR');

  // 2. Save local persistent backup FIRST (Requirement 2 & 6: Data Protection)
  const list = readLocalSubmissions();
  const newRecord: StoredSubmission = {
    timestamp: (isExistingClient && existingIndex >= 0 && list[existingIndex]?.timestamp) || now,
    codigoCliente: clientCode,
    lastModified: now,
    finalized: true,
    status: 'Finalizado',
    finalizedAt: now,
    sheetSyncStatus: 'pending',
    payload,
  };

  if (isExistingClient && existingIndex >= 0) {
    list[existingIndex] = newRecord;
  } else {
    list.push(newRecord);
  }
  writeLocalSubmissions(list);

  // 3. Dispatch to Google Apps Script Web App
  let targetScriptUrl = GOOGLE_SCRIPT_URL;

  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      if (cfg.googleScriptUrl) targetScriptUrl = cfg.googleScriptUrl;
    } catch {
      // ignore
    }
  } else if (inMemorySettings?.googleScriptUrl) {
    targetScriptUrl = inMemorySettings.googleScriptUrl;
  }

  // Comprehensive payload supporting both format conventions:
  // - 'respostas': required by the active Google Apps Script
  // - root keys spread: required by alternative sheets scripts
  const postBody = {
    respostas: payload.rowData,
    dados: payload.rowData,
    ...payload.rowData,
    'Código do cliente': clientCode,
    codigoCliente: clientCode,
    'Status do Onboarding': 'Finalizado',
    status: 'Finalizado',
    finalizado: true,
    timestamp: newRecord.timestamp,
  };

  try {
    console.log(`Forwarding onboarding [${clientCode}] to Google Sheets: ${targetScriptUrl}`);

    const response = await fetch(targetScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(postBody),
      redirect: 'follow',
    });

    const responseText = await response.text();
    let responseJson: any = null;

    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText.slice(0, 500) };
    }

    console.log('Google Apps Script response:', response.status, responseText.slice(0, 200));

    const isSheetsSuccess = response.ok && (
      responseJson?.sucesso === true ||
      responseJson?.success === true ||
      (typeof responseJson?.mensagem === 'string' && responseJson.mensagem.toLowerCase().includes('sucesso')) ||
      (typeof responseJson?.message === 'string' && responseJson.message.toLowerCase().includes('sucesso')) ||
      (typeof responseText === 'string' && responseText.toLowerCase().includes('sucesso'))
    );

    // Update stored record in database with sync status
    const updatedList = readLocalSubmissions();
    const recIdx = updatedList.findIndex((s) => s.codigoCliente === clientCode);
    if (recIdx >= 0) {
      updatedList[recIdx].sheetSyncStatus = isSheetsSuccess ? 'synced' : 'error';
      updatedList[recIdx].sheetSyncError = isSheetsSuccess
        ? undefined
        : (responseJson?.mensagem || responseJson?.error || `HTTP ${response.status}`);
      writeLocalSubmissions(updatedList);
    }

    if (isSheetsSuccess) {
      return res.json({
        success: true,
        dbSaved: true,
        sheetSyncSuccess: true,
        clientCode,
        status: 'Finalizado',
        sheetSyncStatus: 'synced',
        message: 'Informações recebidas com sucesso!',
        scriptResponse: responseJson,
      });
    } else {
      return res.json({
        success: true,
        dbSaved: true,
        sheetSyncSuccess: false,
        clientCode,
        status: 'Finalizado',
        sheetSyncStatus: 'error',
        warning: 'Salvo com segurança no sistema. A sincronização com o Google Sheets retornou uma pendência.',
        error: responseJson?.mensagem || responseJson?.error || `HTTP ${response.status}`,
        scriptResponse: responseJson,
      });
    }
  } catch (err: unknown) {
    console.error('Error forwarding to Google Apps Script:', err);
    const updatedList = readLocalSubmissions();
    const recIdx = updatedList.findIndex((s) => s.codigoCliente === clientCode);
    if (recIdx >= 0) {
      updatedList[recIdx].sheetSyncStatus = 'error';
      updatedList[recIdx].sheetSyncError = err instanceof Error ? err.message : String(err);
      writeLocalSubmissions(updatedList);
    }

    return res.json({
      success: true,
      dbSaved: true,
      sheetSyncSuccess: false,
      clientCode,
      status: 'Finalizado',
      sheetSyncStatus: 'error',
      warning: 'Salvo em banco de dados seguro. A sincronização com a planilha do Google encontrou uma oscilação.',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// API: Get all submissions for Admin Panel
app.get(['/api/submissions', '/submissions'], (req: Request, res: Response) => {
  try {
    const list = readLocalSubmissions();
    return res.json({ success: true, submissions: list });
  } catch (err) {
    console.error('Failed to read submissions:', err);
    return res.status(500).json({ success: false, error: 'Falha ao ler submissões' });
  }
});

// API: Delete submission by index or code
app.delete(['/api/submissions/:index', '/submissions/:index'], (req: Request, res: Response) => {
  try {
    const param = req.params.index;
    const list = readLocalSubmissions();
    let idx = -1;

    idx = list.findIndex(
      (s) => s.codigoCliente === param || s.payload?.rowData?.['Código do cliente'] === param
    );

    if (idx === -1) {
      const num = parseInt(param, 10);
      if (!isNaN(num) && num >= 0 && num < list.length) {
        idx = num;
      }
    }

    if (idx >= 0 && idx < list.length) {
      list.splice(idx, 1);
      writeLocalSubmissions(list);
      return res.json({ success: true, message: 'Submissão excluída com sucesso' });
    }
    return res.status(404).json({ success: false, error: 'Submissão não encontrada' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// API: Update submission by index or client code
app.put(['/api/submissions/:index', '/submissions/:index'], (req: Request, res: Response) => {
  try {
    const param = req.params.index;
    const updatedData = req.body;
    if (!updatedData) {
      return res.status(400).json({ success: false, error: 'Dados ausentes para atualização' });
    }

    const list = readLocalSubmissions();
    let idx = -1;

    idx = list.findIndex(
      (s) => s.codigoCliente === param || s.payload?.rowData?.['Código do cliente'] === param
    );

    if (idx === -1) {
      const num = parseInt(param, 10);
      if (!isNaN(num) && num >= 0 && num < list.length) {
        idx = num;
      }
    }

    if (idx >= 0 && idx < list.length) {
      list[idx] = {
        ...list[idx],
        ...updatedData,
        lastModified: new Date().toISOString(),
      };
      writeLocalSubmissions(list);
      return res.json({
        success: true,
        message: 'Dados da empresa atualizados com sucesso',
        submission: list[idx],
      });
    }
    return res.status(404).json({ success: false, error: 'Submissão não encontrada' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// API: AI Question Generator (Server-Side Gemini Integration)
app.post(['/api/admin/generate-questions', '/admin/generate-questions'], async (req: Request, res: Response) => {
  try {
    const { segmentName, instructions, command, count = 10, existingQuestions = [] } = req.body || {};
    const userInput = String(command || instructions || '').trim();

    if (!userInput && !segmentName) {
      return res.status(400).json({
        success: false,
        error: 'Informe uma instrução ou comando (ex: "Crie 10 perguntas para lojas de móveis e eletrodomésticos...").',
      });
    }

    const questionCount = Math.max(3, Math.min(Number(count) || 10, 20));

    const prompt = `Você é o assistente oficial de inteligência artificial da agência Localway, especialista sênior em onboarding de clientes, arquitetura de formulários e presença digital (Google Meu Negócio, SEO Local, Sites, E-commerce, Tráfego Pago).

SOLICITAÇÃO DO ADMINISTRADOR LOCALWAY:
"${userInput || `Crie ${questionCount} perguntas estratégicas para o segmento: ${segmentName}`}"
${segmentName ? `SEGMENTO ALVO INFORMADO: "${segmentName}"` : ''}

PERGUNTAS QUE JÁ EXISTEM NO SEGMENTO (NÃO repita e NÃO gere perguntas parecidas):
${Array.isArray(existingQuestions) && existingQuestions.length > 0 ? existingQuestions.map((q: string) => `- ${q}`).join('\n') : '- Nenhuma pergunta cadastrada ainda'}

CAMPOS GERAIS DA EMPRESA JÁ COLETADOS NO ONBOARDING (NUNCA pergunte sobre estas informações, pois já são coletadas em outras etapas):
- Razão Social, Nome Fantasia, CNPJ, Data de Abertura da Empresa, Descrição Geral
- Endereço Completo, Rua, Número, Bairro, Cidade, Estado, CEP
- WhatsApp Principal, Telefone Fixo, E-mail Corporativo, Site Atual, Redes Sociais
- Horário de Funcionamento semanal, Agendamento prévio
- Estacionamento, Idiomas para Atendimento, Formas de Pagamento e Bandeiras de Cartão
- Nome, Cargo, WhatsApp e E-mail do Responsável pelo Projeto
- Envio de Materiais, Logotipo, Fotos e Observações Finais

DIRETRIZES E REGRAS INEGOCIÁVEIS:
1. IDENTIFICAÇÃO DO SEGMENTO: Extraia o nome claro do segmento comercial (ex: "Móveis e Eletrodomésticos", "Clínica Médica", "Restaurante", "Oficina Mecânica").
2. REGRA FUNDAMENTAL SOBRE AS PERGUNTAS: As perguntas devem ser GENÉRICAS PARA O SEGMENTO COMERCIAL COMO UM TODO, e NUNCA restritas a um nicho exclusivo.
   - Exemplo: em "Loja de Roupas", as perguntas devem servir tanto para moda infantil, masculina, feminina, plus size ou lingerie. Não crie perguntas como "Quais roupas infantis mais vendem?", e sim "Quais são as principais categorias ou linhas de produtos comercializadas?".
3. QUANTIDADE: Gere exatamente ${questionCount} perguntas estratégicas e objetivas.
4. TIPO DE RESPOSTA ADEQUADO:
   - 'checkbox': quando puder marcar mais de uma opção (ex: especialidades, serviços oferecidos).
   - 'radio': quando for escolha única obrigatória (ex: modelo de operação principal).
   - 'select': lista suspensa.
   - 'text': resposta curta objetiva (ex: prazo médio de entrega).
   - 'textarea': resposta detalhada (ex: diferenciais competitivos, marcas com que trabalha).
5. OPÇÕES REALISTAS: Para tipos com opções ('checkbox', 'radio', 'select'), forneça de 3 a 6 opções contextualizadas à realidade do mercado brasileiro, e SEMPRE inclua a opção "Outro (especificar)" no final.
6. TEXTO DE AJUDA: Crie um helper curto e profissional orientando o cliente sobre o que preencher.`;

    let generatedList: any[] = [];
    let detectedSegment = segmentName || 'Geral';

    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na API Gemini')), 18000)
        );

        const aiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedSegment: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      category: { type: Type.STRING },
                      type: { type: Type.STRING },
                      helper: { type: Type.STRING },
                      placeholder: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      otherLabel: { type: Type.STRING },
                      otherPlaceholder: { type: Type.STRING },
                    },
                    required: ['label', 'type'],
                  },
                },
              },
              required: ['questions'],
            },
          },
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const responseText = response?.text || '{}';
        const parsed = JSON.parse(responseText);

        if (parsed.detectedSegment) {
          detectedSegment = parsed.detectedSegment;
        }

        if (Array.isArray(parsed.questions)) {
          generatedList = parsed.questions;
        }
      } catch (geminiErr) {
        console.warn('Gemini call failed or timed out, executing intelligent fallback:', geminiErr);
      }
    }

    // Intelligent fallback if Gemini API is offline or without key
    if (!generatedList || generatedList.length === 0) {
      const seg = segmentName || 'Empresa';
      detectedSegment = seg;
      generatedList = [
        {
          label: `Quais são as principais categorias de produtos ou serviços que sua empresa comercializa?`,
          category: 'Produtos & Serviços',
          type: 'checkbox',
          options: [
            'Linha premium / alto padrão',
            'Produtos de alta rotatividade e uso diário',
            'Projetos e soluções sob medida',
            'Atendimento no atacado / B2B',
            'Linha de entrada / custo-benefício',
            'Outra categoria (especificar)',
          ],
          helper: 'Selecione todas as principais categorias para destacarmos nos canais digitais.',
        },
        {
          label: `Qual é o raio principal de atuação ou entrega do seu negócio?`,
          category: 'Área de Atuação',
          type: 'radio',
          options: [
            'Apenas no bairro e proximidades',
            'Toda a cidade e região metropolitana',
            'Todo o estado',
            'Nacional (atendimento em todo o Brasil)',
            'Outro formato de cobertura',
          ],
          helper: 'Importante para configurarmos as regiões de anúncios e SEO Local.',
        },
        {
          label: `Quais são as principais marcas, fabricantes ou parceiros com que você trabalha?`,
          category: 'Marcas & Fornecedores',
          type: 'textarea',
          placeholder: 'Ex: Marcas consolidadas, fornecedores certificados, marcas próprias...',
          helper: 'Citar marcas conhecidas aumenta a autoridade no Google e no site.',
        },
        {
          label: `Como funciona a política de garantia e assistência dos seus produtos ou serviços?`,
          category: 'Garantia & Suporte',
          type: 'radio',
          options: [
            'Garantia oficial do fabricante com suporte local',
            'Garantia própria estendida pela loja',
            'Garantia padrão de 90 dias conforme CDC',
            'Outra modalidade de garantia',
          ],
          helper: 'Transmita segurança aos novos clientes que buscarem sua empresa.',
        },
        {
          label: `Sua empresa oferece serviços de montagem, instalação ou pós-venda especializado?`,
          category: 'Pós-Venda & Serviços',
          type: 'checkbox',
          options: [
            'Montagem / instalação própria inclusa',
            'Indicação de técnicos e parceiros homologados',
            'Suporte e manutenção periódica',
            'Atendimento sob consulta',
            'Não oferece montagem/instalação',
            'Outro formato de serviço',
          ],
          helper: 'Diferenciais como montagem e suporte convertem mais clientes na internet.',
        },
        {
          label: `Quais são os prazos médios de entrega ou disponibilidade dos seus itens?`,
          category: 'Prazos & Logística',
          type: 'radio',
          options: [
            'Pronta entrega imediata (retirada ou envio no mesmo dia)',
            'Entrega rápida em até 48 horas',
            'Prazo padrão de 5 a 10 dias úteis',
            'Sob encomenda com prazo personalizado',
            'Outro prazo de entrega',
          ],
          helper: 'Informe como funciona o fluxo logístico do seu estabelecimento.',
        },
        {
          label: `Quais são os 3 principais diferenciais da sua empresa em relação aos concorrentes?`,
          category: 'Diferenciais Competitivos',
          type: 'textarea',
          placeholder: 'Ex: Atendimento consultivo, pronta entrega de itens raros, melhores condições de parcelamento...',
          helper: 'Destaques que utilizaremos nos textos de anúncio e na página institucional.',
        },
        {
          label: `Você trabalha com condições especiais para profissionais parceiros ou compras em volume?`,
          category: 'Comercial & Parcerias',
          type: 'radio',
          options: [
            'Sim, tabela diferenciada para profissionais e arquitetos/parceiros',
            'Sim, descontos progressivos para compras em quantidade',
            'Tabela única para todos os clientes',
            'Outro tipo de condição comercial',
          ],
          helper: 'Mapeamento para criação de campanhas voltadas para parcerias.',
        },
        {
          label: `Quais são os itens ou serviços mais procurados que não podem faltar em destaque nos canais digitais?`,
          category: 'Produtos Carro-Chefe',
          type: 'textarea',
          placeholder: 'Ex: Os itens mais vendidos e que atraem mais público para a sua loja...',
          helper: 'Serão os primeiros destaques no Perfil do Google e nas páginas do site.',
        },
        {
          label: `Existe alguma certificação, prêmio ou selo de qualidade que sua empresa possui?`,
          category: 'Autoridade & Credibilidade',
          type: 'text',
          placeholder: 'Ex: Empresa certificada ISO, selo RA1000 Reclame Aqui, premiação local...',
          helper: 'Selos de confiança geram forte impacto visual no site e nas redes.',
        },
      ].slice(0, questionCount);
    }

    const formatted = generatedList.map((q: any, idx: number) => {
      const idSlug = (q.label || `pergunta_${idx}`)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 30);
      return {
        id: `ai_${idSlug}_${Date.now()}_${idx}`,
        label: q.label,
        category: q.category || 'Especificações do Segmento',
        type: ['checkbox', 'radio', 'select', 'text', 'textarea'].includes(q.type) ? q.type : 'text',
        helper: q.helper || '',
        placeholder: q.placeholder || '',
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : undefined,
        otherLabel: q.otherLabel || (q.options?.length ? 'Outro (especificar)' : undefined),
        otherPlaceholder: q.otherPlaceholder || (q.options?.length ? 'Qual?' : undefined),
      };
    });

    return res.json({
      success: true,
      detectedSegment,
      questions: formatted,
      count: formatted.length,
    });
  } catch (err: any) {
    console.error('Error generating AI questions:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao processar solicitação com o assistente Gemini.',
    });
  }
});

// API: Local AI - Assistente Inteligente para Administração do Onboarding
app.post(['/api/admin/local-ai', '/admin/local-ai'], async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentContext } = req.body || {};
    const userPrompt = String(message || '').trim();

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem vazia. Envie um comando para o assistente Local AI.',
      });
    }

    const systemInstruction = `Você é o "Local AI", assistente oficial de administração e configuração do sistema de Onboarding da Localway.
Seu objetivo é ajudar a equipe interna da Localway a gerenciar serviços, perguntas e regras de preenchimento.

SERVIÇOS OFICIAIS DISPONÍVEIS NA LOCALWAY (ID exato : Nome):
- google : Perfil da Empresa no Google (Google Meu Negócio)
- site : Site Profissional (Site Institucional)
- ecommerce : Loja Virtual / E-commerce
- trafego : Tráfego Pago
- identidade : Identidade Visual
- minisite : Mini Site
- seo : SEO Local
- automacoes : Sistemas e Automações
- whatsapp : WhatsApp Business
- email : E-mail Profissional
- assinatura_email : Assinatura de E-mail Profissional
- registro_marca : Registro de Marca
- registro_dominio : Registro de Domínio
- plaquinha : Plaquinha Inteligente QR Code / NFC
- catalogo : Catálogo de Produtos e Serviços

TIPOS DE PERGUNTAS VÁLIDOS (UniversalQuestionType):
'text' (Texto Curto), 'textarea' (Texto Longo / Parágrafo), 'number' (Número), 'radio' (Resposta Única), 'checkbox' (Múltipla Seleção), 'yes_no' (Sim ou Não), 'date' (Data), 'file' (Upload de Arquivo), 'select' (Lista suspensa).

SUA MISSÃO:
1. Analise o que o administrador pediu.
2. Formule uma resposta profissional, direta e prestativa em português ("reply").
3. Se o pedido envolver criar uma pergunta, alterar um serviço (ativar/desativar/editar) ou adicionar um segmento, configure "hasAction": true e preencha "action" com os campos detalhados.
4. Se for apenas uma dúvida ou conversa explicativa, defina "hasAction": false e actionType: "none".
5. IMPORTANTÍSSIMO: Nunca aplique alterações sem fornecer um "previewSummary" claro para o cartão de confirmação.`;

    const fullPrompt = `${systemInstruction}

CONTEXTO ATUAL DO SISTEMA:
${currentContext ? JSON.stringify(currentContext).slice(0, 1000) : 'Configurações padrão ativas.'}

HISTÓRICO RECENTE:
${Array.isArray(history) && history.length > 0 ? history.slice(-4).map((h: any) => `${h.role}: ${h.content}`).join('\n') : 'Início da conversa'}

COMANDO DO ADMINISTRADOR LOCALWAY:
"${userPrompt}"`;

    let aiResult: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout de 30 segundos na API Gemini')), 30000)
        );

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
          config: {
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                hasAction: { type: Type.BOOLEAN },
                action: {
                  type: Type.OBJECT,
                  properties: {
                    actionType: { type: Type.STRING },
                    target: { type: Type.STRING },
                    serviceId: { type: Type.STRING },
                    segmentKey: { type: Type.STRING },
                    questionLabel: { type: Type.STRING },
                    questionType: { type: Type.STRING },
                    questionHelper: { type: Type.STRING },
                    questionPlaceholder: { type: Type.STRING },
                    questionRequired: { type: Type.BOOLEAN },
                    questionOptions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    serviceTitle: { type: Type.STRING },
                    serviceTagline: { type: Type.STRING },
                    serviceEnabled: { type: Type.BOOLEAN },
                    previewSummary: { type: Type.STRING },
                  },
                },
              },
              required: ['reply', 'hasAction'],
            },
          },
        });

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const responseText = response?.text || '{}';
        aiResult = JSON.parse(responseText);
      } catch (geminiErr) {
        console.warn('Gemini 3.8 Flash call failed or timed out, activating intelligent fallback:', geminiErr);
      }
    }

    // Intelligent heuristic fallback if Gemini API is unreachable or returned empty
    if (!aiResult || !aiResult.reply) {
      const lower = userPrompt.toLowerCase();

      // Heuristic 1: Toggle service active/inactive
      const serviceMatches: Record<string, string> = {
        google: 'google',
        maps: 'google',
        site: 'site',
        ecommerce: 'ecommerce',
        loja: 'ecommerce',
        trafego: 'trafego',
        anuncio: 'trafego',
        identidade: 'identidade',
        logo: 'identidade',
        minisite: 'minisite',
        seo: 'seo',
        automacao: 'automacoes',
        whatsapp: 'whatsapp',
        email: 'email',
        assinatura: 'assinatura_email',
        marca: 'registro_marca',
        dominio: 'registro_dominio',
        plaquinha: 'plaquinha',
        catalogo: 'catalogo',
      };

      let matchedServiceId = '';
      for (const [key, svcId] of Object.entries(serviceMatches)) {
        if (lower.includes(key)) {
          matchedServiceId = svcId;
          break;
        }
      }

      if (matchedServiceId && (lower.includes('desativ') || lower.includes('ocult') || lower.includes('deslig'))) {
        aiResult = {
          reply: `Preparei a desativação do serviço **${matchedServiceId.toUpperCase()}**. Ao desativar, ele não aparecerá na etapa de seleção pública para novos clientes, mantendo 100% preservadas as respostas e perguntas anteriores.`,
          hasAction: true,
          action: {
            actionType: 'toggle_service',
            target: 'service',
            serviceId: matchedServiceId,
            serviceEnabled: false,
            previewSummary: `Desativar o serviço "${matchedServiceId}" no formulário público`,
          },
        };
      } else if (matchedServiceId && (lower.includes('ativ') || lower.includes('exib') || lower.includes('ligar'))) {
        aiResult = {
          reply: `Preparei a ativação do serviço **${matchedServiceId.toUpperCase()}**. Ele voltará a ficar disponível para seleção pelos clientes no onboarding.`,
          hasAction: true,
          action: {
            actionType: 'toggle_service',
            target: 'service',
            serviceId: matchedServiceId,
            serviceEnabled: true,
            previewSummary: `Ativar o serviço "${matchedServiceId}" no formulário público`,
          },
        };
      } else if (lower.includes('pergunta') || lower.includes('campo') || lower.includes('criar') || lower.includes('adicionar')) {
        const targetService = matchedServiceId || 'site';
        let questionType = 'text';
        if (lower.includes('sim') || lower.includes('nao') || lower.includes('não')) questionType = 'yes_no';
        else if (lower.includes('data') || lower.includes('prazo')) questionType = 'date';
        else if (lower.includes('arquivo') || lower.includes('foto') || lower.includes('anexo')) questionType = 'file';
        else if (lower.includes('numero') || lower.includes('número') || lower.includes('quantidade')) questionType = 'number';
        else if (lower.includes('opcao') || lower.includes('opção') || lower.includes('multipla') || lower.includes('múltipla')) questionType = 'checkbox';
        else if (lower.includes('longo') || lower.includes('detalhe') || lower.includes('descreva')) questionType = 'textarea';

        const labelClean = userPrompt
          .replace(/^(crie|adicione|adicionar|coloque|inclua)\s+(uma\s+)?(pergunta|campo)\s*(sobre|para|de)?/i, '')
          .trim();

        aiResult = {
          reply: `Criei uma proposta de pergunta para o serviço **${targetService.toUpperCase()}**: "${labelClean || 'Informação complementar do serviço'}". Revise a prévia abaixo e clique em 'Aplicar Alteração' para adicionar ao sistema.`,
          hasAction: true,
          action: {
            actionType: 'add_question',
            target: 'service',
            serviceId: targetService,
            questionLabel: labelClean.length > 5 ? labelClean : 'Qual é a principal prioridade deste serviço para sua empresa?',
            questionType,
            questionHelper: 'Campo sugerido automaticamente pelo Local AI.',
            questionRequired: true,
            questionOptions: questionType === 'checkbox' ? ['Opção Principal', 'Opção Secundária', 'Outro'] : undefined,
            previewSummary: `Adicionar nova pergunta no serviço "${targetService}" (${questionType})`,
          },
        };
      } else {
        aiResult = {
          reply: `Olá! Sou o **Local AI**, assistente inteligente de onboarding da Localway. Posso ajudar você a:\n- Adicionar ou editar perguntas em qualquer um dos 13 serviços.\n- Ativar ou desativar serviços na seleção pública.\n- Sugerir perguntas estratégicas para qualquer segmento.\n\nComo posso ajudar você agora?`,
          hasAction: false,
          action: {
            actionType: 'none',
            target: 'system',
            previewSummary: '',
          },
        };
      }
    }

    return res.json({
      success: true,
      reply: aiResult.reply,
      hasAction: Boolean(aiResult.hasAction),
      action: aiResult.action || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error in /api/admin/local-ai:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro ao processar consulta com o Local AI.',
    });
  }
});

// API: Admin Settings
app.get(['/api/admin/settings', '/admin/settings'], (req: Request, res: Response) => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      inMemorySettings = JSON.parse(content || '{}');
      return res.json({ success: true, settings: inMemorySettings });
    }
    if (inMemorySettings) {
      return res.json({ success: true, settings: inMemorySettings });
    }
    return res.json({
      success: true,
      settings: {
        googleScriptUrl: GOOGLE_SCRIPT_URL,
        transferNowUrl: 'https://www.transfernow.net',
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post(['/api/admin/settings', '/admin/settings'], (req: Request, res: Response) => {
  try {
    const settings = req.body;
    inMemorySettings = settings;
    try {
      ensureDataDir();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    } catch {
      // ignore
    }
    return res.json({ success: true, message: 'Configurações salvas com sucesso' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// API: Admin Schema
app.get(['/api/admin/schema', '/admin/schema'], (req: Request, res: Response) => {
  try {
    if (fs.existsSync(SCHEMA_FILE)) {
      const content = fs.readFileSync(SCHEMA_FILE, 'utf-8');
      inMemorySchema = JSON.parse(content || '{}');
      return res.json({ success: true, schema: inMemorySchema });
    }
    if (inMemorySchema) {
      return res.json({ success: true, schema: inMemorySchema });
    }
    return res.json({ success: true, schema: null });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

app.post(['/api/admin/schema', '/admin/schema'], (req: Request, res: Response) => {
  try {
    const schema = req.body;
    inMemorySchema = schema;
    try {
      ensureDataDir();
      fs.writeFileSync(SCHEMA_FILE, JSON.stringify(schema, null, 2), 'utf-8');
    } catch {
      // ignore
    }
    return res.json({ success: true, message: 'Esquema de formulário salvo com sucesso' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// API: Resync single submission to Google Sheets
app.post(['/api/admin/sync-submission', '/admin/sync-submission'], async (req: Request, res: Response) => {
  try {
    const { rowData } = req.body;
    if (!rowData) {
      return res.status(400).json({ success: false, error: 'Dados ausentes para sincronização' });
    }
    let targetScriptUrl = GOOGLE_SCRIPT_URL;
    if (fs.existsSync(SETTINGS_FILE)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
        if (cfg.googleScriptUrl) targetScriptUrl = cfg.googleScriptUrl;
      } catch {
        // ignore
      }
    } else if (inMemorySettings?.googleScriptUrl) {
      targetScriptUrl = inMemorySettings.googleScriptUrl;
    }

    const clientCode = rowData['Código do cliente'] || 'LW-01';
    const postBody = {
      respostas: rowData,
      dados: rowData,
      ...rowData,
      'Código do cliente': clientCode,
      codigoCliente: clientCode,
      'Status do Onboarding': 'Finalizado',
      status: 'Finalizado',
      finalizado: true,
    };

    const response = await fetch(targetScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(postBody),
      redirect: 'follow',
    });

    const responseText = await response.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText.slice(0, 500) };
    }

    const isSheetsSuccess = response.ok && (
      responseJson?.sucesso === true ||
      responseJson?.success === true ||
      (typeof responseJson?.mensagem === 'string' && responseJson.mensagem.toLowerCase().includes('sucesso')) ||
      (typeof responseJson?.message === 'string' && responseJson.message.toLowerCase().includes('sucesso')) ||
      (typeof responseText === 'string' && responseText.toLowerCase().includes('sucesso'))
    );

    // Update database status
    const list = readLocalSubmissions();
    const idx = list.findIndex(
      (s) => s.codigoCliente === clientCode || s.payload?.rowData?.['Código do cliente'] === clientCode
    );
    if (idx >= 0) {
      list[idx].sheetSyncStatus = isSheetsSuccess ? 'synced' : 'error';
      list[idx].sheetSyncError = isSheetsSuccess
        ? undefined
        : (responseJson?.mensagem || responseJson?.error || `HTTP ${response.status}`);
      list[idx].lastModified = new Date().toISOString();
      writeLocalSubmissions(list);
    }

    return res.json({
      success: isSheetsSuccess,
      sheetSyncSuccess: isSheetsSuccess,
      status: response.status,
      scriptResponse: responseJson || responseText,
      message: isSheetsSuccess ? 'Sincronizado com sucesso!' : 'Falha ao sincronizar com a planilha.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// API: Test Google Sheets integration with sample rowData
app.post(['/api/admin/test-sheets-integration', '/admin/test-sheets-integration'], async (req: Request, res: Response) => {
  try {
    let targetScriptUrl = req.body?.googleScriptUrl || GOOGLE_SCRIPT_URL;
    if (!req.body?.googleScriptUrl && fs.existsSync(SETTINGS_FILE)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
        if (cfg.googleScriptUrl) targetScriptUrl = cfg.googleScriptUrl;
      } catch {
        // ignore
      }
    } else if (!req.body?.googleScriptUrl && inMemorySettings?.googleScriptUrl) {
      targetScriptUrl = inMemorySettings.googleScriptUrl;
    }

    if (!targetScriptUrl || !targetScriptUrl.startsWith('http')) {
      return res.status(400).json({
        success: false,
        error: 'URL do Google Apps Script não configurada ou inválida.',
      });
    }

    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const sampleRowData: Record<string, string> = {
      'Código do cliente': 'LW-01',
      'Data e hora': dataHora,
      'Status do Onboarding': 'Finalizado',
      'Data de finalização': dataHora,
      'Nome fantasia': 'Empresa Exemplo Localway',
      'Razão social': 'Empresa Exemplo Ltda',
      'CNPJ': '12.345.678/0001-90',
      'Segmento': 'Fotografia',
      'Outro segmento': '',
      'Descrição da empresa': 'Estúdio de fotografia especializado em casamentos e eventos corporativos.',
      'Data de abertura': '2019-05-10',
      'Telefone': '(11) 3333-4444',
      'WhatsApp': '(11) 99999-8888',
      'E-mail': 'contato@empresaexemplo.com.br',
      'Site': 'https://www.empresaexemplo.com.br',
      'Instagram': '@empresaexemplo',
      'Facebook / outras redes': 'facebook.com/empresaexemplo',
      'Rua / Avenida': 'Av. Paulista',
      'Número': '1000',
      'Complemento': 'Sala 502',
      'Bairro': 'Bela Vista',
      'Cidade': 'São Paulo',
      'Estado': 'SP',
      'Horário segunda a sexta': '08:00 às 18:00',
      'Segunda': '08:00 às 18:00',
      'Terça': '08:00 às 18:00',
      'Quarta': '08:00 às 18:00',
      'Quinta': '08:00 às 18:00',
      'Sexta': '08:00 às 18:00',
      'Sábado': '08:00 às 12:00',
      'Domingo': 'Fechado',
      'Trabalha com agendamento': 'Sim',
      'Formas de agendamento': 'WhatsApp, Telefone, Site',
      'Contato / link de agendamento': 'https://wa.me/5511999998888',
      'Estacionamento': 'Estacionamento próprio gratuito para clientes',
      'Outro estacionamento': '',
      'Idiomas': 'Português, Inglês',
      'Formas de pagamento': 'Cartão de Crédito, Pix, Dinheiro',
      'Outro pagamento': '',
      'Responsável': 'Carlos Alberto da Silva',
      'Cargo / função': 'Proprietário & Diretor',
      'WhatsApp responsável': '(11) 98888-1111',
      'E-mail responsável': 'carlos@empresaexemplo.com.br',
      'Serviços contratados': 'Google Meu Negócio, Mini Site, Tráfego Pago',
      'Detalhes dos serviços': '[GOOGLE MEU NEGÓCIO]: Otimização completa de perfil, fotos em alta resolução.\n\n[MINI SITE]: Mini site rápido.\n\n[TRÁFEGO PAGO]: Campanhas em SP.',
      'Detalhes específicos do segmento': 'Quais tipos de ensaios: Casamentos | Prazo de entrega: 10 dias úteis.',
      'Possui materiais': 'Sim',
      'Tipos de materiais': 'Logotipo em vetor, Fotos em alta resolução',
      'Link TransferNow': 'https://www.transfernow.net/exemplo-localway',
      'Observações dos materiais': 'Arquivos organizados por pastas.',
      'Observações finais': 'Teste de integração realizado com sucesso.',
    };

    const postBody = {
      respostas: sampleRowData,
      dados: sampleRowData,
      ...sampleRowData,
      'Código do cliente': 'LW-01',
      codigoCliente: 'LW-01',
      'Status do Onboarding': 'Finalizado',
      status: 'Finalizado',
      finalizado: true,
    };

    console.log('Sending test payload to Google Apps Script:', targetScriptUrl);
    const response = await fetch(targetScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(postBody),
      redirect: 'follow',
    });

    const responseText = await response.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText.slice(0, 300) };
    }

    const isSuccess = response.ok && (
      responseJson?.sucesso === true ||
      responseJson?.success === true ||
      (typeof responseJson?.mensagem === 'string' && responseJson.mensagem.toLowerCase().includes('sucesso')) ||
      (typeof responseText === 'string' && responseText.toLowerCase().includes('sucesso'))
    );

    return res.json({
      success: isSuccess,
      status: response.status,
      scriptResponse: responseJson,
      message: isSuccess
        ? 'Teste enviado com sucesso para a planilha do Google!'
        : `O Google Apps Script retornou status HTTP ${response.status}.`,
    });
  } catch (err: any) {
    console.error('Error testing Google Sheets integration:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

export default app;
