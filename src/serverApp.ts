import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

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

const BUNDLED_DATA_DIR = path.join(process.cwd(), 'data');

const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const SCHEMA_FILE = path.join(DATA_DIR, 'schema.json');

// In-memory cache to guarantee persistence even if filesystem encounters issues
let inMemorySubmissions: StoredSubmission[] = [];
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

  // If in Vercel serverless and file does not exist in /tmp, seed from bundled project data
  if (isVercel) {
    try {
      const bundledSubmissions = path.join(BUNDLED_DATA_DIR, 'submissions.json');
      if (fs.existsSync(bundledSubmissions) && !fs.existsSync(SUBMISSIONS_FILE)) {
        const content = fs.readFileSync(bundledSubmissions, 'utf-8');
        fs.writeFileSync(SUBMISSIONS_FILE, content, 'utf-8');
        inMemorySubmissions = JSON.parse(content || '[]');
      }
    } catch {
      // ignore
    }
  }

  // Pre-load submissions into memory
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const content = fs.readFileSync(SUBMISSIONS_FILE, 'utf-8');
      inMemorySubmissions = JSON.parse(content || '[]');
    }
  } catch (err) {
    console.warn('Could not read submissions file:', err);
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
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Localway Onboarding API',
    environment: isVercel ? 'vercel-serverless' : 'node-server',
    timestamp: new Date().toISOString(),
  });
});

// API: Submit onboarding to Database & Google Sheets
app.post('/api/submit-onboarding', async (req: Request, res: Response) => {
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
app.get('/api/submissions', (req: Request, res: Response) => {
  try {
    const list = readLocalSubmissions();
    return res.json({ success: true, submissions: list });
  } catch (err) {
    console.error('Failed to read submissions:', err);
    return res.status(500).json({ success: false, error: 'Falha ao ler submissões' });
  }
});

// API: Delete submission by index or code
app.delete('/api/submissions/:index', (req: Request, res: Response) => {
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
app.put('/api/submissions/:index', (req: Request, res: Response) => {
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
app.post('/api/admin/generate-questions', async (req: Request, res: Response) => {
  try {
    const { segmentName, instructions, count = 5, existingQuestions = [] } = req.body;

    if (!segmentName || !instructions) {
      return res.status(400).json({
        success: false,
        error: 'Informe o segmento e a descrição do que deseja coletar.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Chave GEMINI_API_KEY não configurada no servidor. Configure-a no painel de configurações.',
      });
    }

    const prompt = `Você é um especialista sênior em onboarding de clientes e presença digital da agência Localway.
Crie exatamente ${count} perguntas estratégicas e objetivas para o segmento "${segmentName}".
Instrução do usuário: "${instructions}".

Perguntas que JÁ EXISTEM neste segmento (NÃO repita nem crie perguntas parecidas com estas):
${Array.isArray(existingQuestions) && existingQuestions.length > 0 ? existingQuestions.map((q: string) => `- ${q}`).join('\n') : '- Nenhuma pergunta cadastrada ainda'}

Regras obrigatórias:
1. As perguntas devem ser extremamente relevantes para captar necessidades do negócio, portfólio, diferenciais, canais ou processos.
2. Cada pergunta deve ter um 'type' adequado: 'checkbox' (múltipla escolha), 'radio' (escolha única), 'select' (lista suspensa), 'text' (resposta curta) ou 'textarea' (resposta longa detalhada).
3. Para tipos com opções ('checkbox', 'radio', 'select'), forneça de 3 a 6 opções realistas do mercado brasileiro.
4. Para perguntas com opções, SEMPRE inclua a opção "Outro" com variação natural no final (ex: "Outro tipo", "Outro serviço", "Outro formato") no campo otherLabel, e adicione essa mesma opção na lista de options.
5. Defina um helper explicativo curto e profissional para orientar o cliente.`;

    let generatedList: any[] = [];

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout na API Gemini')), 12000)
      );

      const aiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
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
      });

      const response: any = await Promise.race([aiPromise, timeoutPromise]);
      const responseText = response?.text || '[]';
      generatedList = JSON.parse(responseText);
    } catch (geminiErr) {
      console.warn('Gemini fallback activated:', geminiErr);
      generatedList = [
        {
          label: `Quais são as principais especialidades ou serviços que você oferece em ${segmentName}?`,
          category: 'Especialidades & Serviços',
          type: 'checkbox',
          options: ['Atendimento corporativo e B2B', 'Atendimento direto ao consumidor (B2C)', 'Projetos personalizados sob demanda', 'Planos recorrentes / assinaturas', 'Outro tipo de serviço'],
          otherLabel: 'Outro tipo de serviço',
          otherPlaceholder: 'Qual outro serviço você oferece?',
          helper: 'Selecione todas as modalidades em que sua empresa atua.',
        },
        {
          label: `Como funciona o atendimento e agendamento dos seus serviços?`,
          category: 'Atendimento & Operação',
          type: 'radio',
          options: ['Exclusivamente com agendamento prévio / hora marcada', 'Por ordem de chegada / pronto atendimento', 'Modelo híbrido (agendado e espontâneo)', 'Outro formato de atendimento'],
          otherLabel: 'Outro formato de atendimento',
          otherPlaceholder: 'Qual outro formato de atendimento?',
          helper: 'Informe como os clientes costumam ser atendidos.',
        },
        {
          label: `Quais equipamentos, marcas ou tecnologias você utiliza no seu trabalho?`,
          category: 'Equipamentos & Ferramentas',
          type: 'textarea',
          placeholder: 'Ex: Câmeras, equipamentos especializados, sistemas...',
          helper: 'Cite equipamentos e marcas relevantes para demonstrar autoridade.',
        },
      ].slice(0, count);
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
        otherLabel: q.otherLabel || (q.options?.length ? 'Outro' : undefined),
        otherPlaceholder: q.otherPlaceholder || (q.options?.length ? 'Qual?' : undefined),
      };
    });

    return res.json({ success: true, questions: formatted });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Falha ao gerar perguntas com IA',
    });
  }
});

// API: Admin Settings
app.get('/api/admin/settings', (req: Request, res: Response) => {
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

app.post('/api/admin/settings', (req: Request, res: Response) => {
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
app.get('/api/admin/schema', (req: Request, res: Response) => {
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

app.post('/api/admin/schema', (req: Request, res: Response) => {
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
app.post('/api/admin/sync-submission', async (req: Request, res: Response) => {
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
app.post('/api/admin/test-sheets-integration', async (req: Request, res: Response) => {
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
