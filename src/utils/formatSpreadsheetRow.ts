import { OnboardingData, DaySchedule, SharedCatalogItem } from '../types';
import { SERVICES_LIST } from '../constants/services';
import { SEGMENTS_CONFIG } from '../constants/segments';
import { OnboardingFieldConfig } from '../constants/formSchema';

function formatDaySchedule(s: DaySchedule): string {
  if (!s || s.status === 'fechado') return 'Fechado';
  let txt = `${s.abertura1 || '08:00'} às ${s.fechamento1 || '18:00'}`;
  if (s.temIntervalo && s.abertura2 && s.fechamento2) {
    txt += ` e ${s.abertura2} às ${s.fechamento2}`;
  }
  return txt;
}

function resolveCatalogItems(ids?: string[], catalog?: SharedCatalogItem[]): string {
  if (!ids || ids.length === 0 || !catalog || catalog.length === 0) return '';
  return ids
    .map((id) => catalog.find((c) => c.id === id))
    .filter(Boolean)
    .map((item) => {
      const varTxt = item!.variacoes ? ` [${item!.variacoes}]` : '';
      return `${item!.nome}${item!.preco ? ` (${item!.preco})` : ''}${varTxt}`;
    })
    .join('; ');
}

export function formatSpreadsheetPayload(
  data: OnboardingData,
  customSegmentsConfig?: Record<string, any>,
  customServicesConfig?: Record<string, any>,
  customOnboardingFields?: OnboardingFieldConfig[]
) {
  const now = new Date();
  const dataHora = now.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  const h = data.horarios;
  const segTxt = formatDaySchedule(h.segunda);
  const terTxt = formatDaySchedule(h.terca);
  const quaTxt = formatDaySchedule(h.quarta);
  const quiTxt = formatDaySchedule(h.quinta);
  const sexTxt = formatDaySchedule(h.sexta);
  const sabTxt = formatDaySchedule(h.sabado);
  const domTxt = formatDaySchedule(h.domingo);

  const horarioSegSex =
    segTxt === terTxt && terTxt === quaTxt && quaTxt === quiTxt && quiTxt === sexTxt
      ? segTxt
      : `Seg: ${segTxt} | Ter: ${terTxt} | Qua: ${quaTxt} | Qui: ${quiTxt} | Sex: ${sexTxt}`;

  // Nomes dos serviços contratados (usando título customizado pelo admin se existir)
  const servicosContratadosNomes = data.servicosContratados
    .map((id) => customServicesConfig?.[id]?.title || SERVICES_LIST.find((s) => s.id === id)?.title || id)
    .join(', ');

  const catalog = data.catalogoCompartilhado || [];
  const catalogoStr = catalog
    .map((item, idx) => {
      const varTxt = item.variacoes ? ` | Variações: ${item.variacoes}` : '';
      return `${idx + 1}. [${item.tipo === 'produto' ? 'Produto' : 'Serviço'}] ${item.nome}${item.preco ? ` — ${item.preco}` : ''}${item.descricao ? `: ${item.descricao}` : ''}${varTxt}`;
    })
    .join('\n');

  // Detalhes compilados dos serviços
  const servicosDetalhesArray: string[] = [];

  if (data.servicosContratados.includes('google')) {
    const destaques =
      resolveCatalogItems(data.googleItensDestaqueIds, catalog) ||
      data.googlePrincipaisServicos ||
      'Nenhum destaque específico selecionado';
    servicosDetalhesArray.push(
      `[PERFIL DA EMPRESA NO GOOGLE]:\n` +
        `- Situação do Perfil: ${data.googleJaPossuiPerfil || 'Não informado'}\n` +
        `- Link do Perfil: ${data.googleLinkPerfil || 'N/A'}\n` +
        `- Forma de Atendimento: ${data.formaAtendimento || 'Não informado'}\n` +
        `- Área / Região de Atendimento: ${data.googleAreaAtendimento || 'Atendimento no estabelecimento'}\n` +
        `- Produtos/Serviços em Destaque (até 3): ${destaques}\n` +
        `- Informações Complementares: ${data.googleInfoAdicionais || data.googleCorrecoesPerfil || 'Nenhuma'}`
    );
  }

  if (data.servicosContratados.includes('site')) {
    const siteServicosStr =
      resolveCatalogItems(data.siteServicosSelecionadosIds, catalog) || 'Conforme cadastro geral';
    const siteProdutosStr =
      data.siteComercializaProdutos === 'Sim'
        ? resolveCatalogItems(data.siteProdutosSelecionadosIds, catalog) || 'A definir'
        : 'Não comercializa produtos';
    const equipeStr = (data.siteEquipePessoas || [])
      .map((p) => `${p.nome}${p.funcao ? ` (${p.funcao})` : ''}`)
      .filter(Boolean)
      .join(', ');

    servicosDetalhesArray.push(
      `[SITE INSTITUCIONAL]:\n` +
        `- História da Empresa: ${data.siteHistoria || 'Não informada'}\n` +
        `- Apresentar Responsável no Site: ${data.siteApresentarResponsavel || 'Não informado'}\n` +
        `- Diferenciais: ${(data.siteDiferenciais || []).join(', ')}${data.siteDiferenciaisOutro ? ` (${data.siteDiferenciaisOutro})` : ''}\n` +
        `- Público-Alvo: ${(data.sitePublicoAlvo || []).join(', ')}${data.sitePublicoAlvoOutro ? ` (${data.sitePublicoAlvoOutro})` : ''}\n` +
        `- Serviços Oferecidos: ${siteServicosStr}\n` +
        `- Comercializa Produtos: ${data.siteComercializaProdutos || 'Não informado'}\n` +
        `- Produtos no Site: ${siteProdutosStr}\n` +
        `- Processo de Atendimento/Contratação: ${(data.siteProcessoAtendimento || []).join(', ')}${data.siteProcessoAtendimentoOutro ? ` (${data.siteProcessoAtendimentoOutro})` : ''}\n` +
        `- Orientações Pré-Contratação: ${data.siteOrientacaoPreContratacao || 'Nenhuma'}\n` +
        `- Apresentação de Pessoas/Equipe: ${data.siteApresentarEquipeTipo || 'Não informado'}${equipeStr ? ` — ${equipeStr}` : ''}\n` +
        `- Vídeos para o Site: ${data.sitePossuiVideos || 'Não informado'}${data.siteVideosLink ? ` (${data.siteVideosLink})` : ''}\n` +
        `- Seções Adicionais: ${(data.siteSecoesAdicionais || data.sitePaginasNecessarias || []).join(', ')}${data.siteSecoesAdicionaisOutro ? ` (${data.siteSecoesAdicionaisOutro})` : ''}\n` +
        `- Dúvidas Frequentes: ${data.siteDuvidasFrequentes || 'Nenhuma'}\n` +
        `- Objetivo Principal do Site: ${data.siteObjetivoPrincipal || (data.siteObjetivos || []).join(', ') || 'Não informado'}`
    );
  }

  if (data.servicosContratados.includes('minisite')) {
    const destaquesMini = resolveCatalogItems(data.minisiteItensDestaqueIds, catalog) || 'Nenhum destaque selecionado';
    const extras = data.minisiteRecursosAdicionais || [];
    const extraDetails: string[] = [];
    if (extras.length > 0) extraDetails.push(extras.join(', '));
    if (data.minisiteWifiRede) extraDetails.push(`Wi-Fi: ${data.minisiteWifiRede}${data.minisiteWifiSenha ? ` / Senha: ${data.minisiteWifiSenha}` : ''}`);
    if (data.minisitePixChave) extraDetails.push(`Pix: ${data.minisitePixChave}${data.minisitePixTitular ? ` (${data.minisitePixTitular})` : ''}`);

    servicosDetalhesArray.push(
      `[MINI SITE]:\n` +
        `- Links e Botões: ${(data.minisiteInformacoes || []).join(', ')} ${data.minisiteOutraInfo ? `(${data.minisiteOutraInfo})` : ''}\n` +
        `- Apresentação da Empresa: ${data.minisiteApresentacao || 'Usar descrição geral'}\n` +
        `- Principais Produtos/Serviços (até 3): ${destaquesMini}\n` +
        `- Possui Catálogo/Cardápio Digital: ${data.minisiteCatalogoPossui || 'Não informado'}${data.minisiteCatalogoLink ? ` (${data.minisiteCatalogoLink})` : ''}${data.minisiteCatalogoArquivo ? ` [Arquivo: ${data.minisiteCatalogoArquivo}]` : ''}\n` +
        `- Cores Desejadas: ${data.minisiteCoresDesejadas || 'Livre / Padrão'} | Evitar: ${data.minisiteCoresEvitar || 'Nenhuma'}\n` +
        `- Referência Visual: ${data.minisiteReferenciaVisual || 'Nenhuma'}\n` +
        `- Recursos Adicionais: ${extraDetails.join(' | ') || 'Nenhum'}\n` +
        `- WhatsApp: ${data.minisiteWhatsapp || data.whatsapp || '-'} | Instagram: ${data.minisiteInstagram || data.instagram || '-'} | Site: ${data.minisiteSite || data.site || '-'}`
    );
  }

  if (data.servicosContratados.includes('ecommerce')) {
    servicosDetalhesArray.push(
      `[LOJA VIRTUAL / E-COMMERCE]:\n- Produtos: ${data.ecommerceProdutosVendidos}\n- Qtd estimada: ${data.ecommerceQuantidadeProdutos}\n- Fotos: ${data.ecommercePossuiFotos}\n- Cadastro: ${data.ecommercePossuiCadastro}\n- Formas Pagamento: ${data.ecommerceFormasPagamento.join(', ')}\n- Entrega: ${data.ecommerceEntrega}\n- Regiões: ${data.ecommerceRegioesAtendidas}\n- Domínio: ${data.ecommercePossuiDominio}\n- Gateway: ${data.ecommercePossuiSistemaPagamento}\n- Referência: ${data.ecommerceReferencia || 'Nenhuma'}`
    );
  }

  if (data.servicosContratados.includes('trafego')) {
    servicosDetalhesArray.push(
      `[TRÁFEGO PAGO]:\n- Objetivo principal: ${data.trafegoObjetivo} ${data.trafegoOutroObjetivo ? `(${data.trafegoOutroObjetivo})` : ''}\n- Produto/Serviço inicial: ${data.trafegoProdutoServicoPrimeiro}\n- Região: Cidade ${data.trafegoCidade}, Bairros: ${data.trafegoBairrosRegioes}\n- Público-alvo: ${data.trafegoPublicoAlvo}\n- Já anuncia: ${data.trafegoJaAnuncia}\n- Plataformas: ${data.trafegoPlataformas.join(', ')} ${data.trafegoOutraPlataforma ? `(${data.trafegoOutraPlataforma})` : ''}\n- Campanhas ativas: ${data.trafegoCampanhasAtuais || 'Nenhuma'}\n- WhatsApp para contatos: ${data.trafegoWhatsappContatos}\n- Promoções/Período: ${data.trafegoPeriodoPromocao || 'Nenhum'}`
    );
  }

  if (data.servicosContratados.includes('identidade')) {
    servicosDetalhesArray.push(
      `[IDENTIDADE VISUAL]:\n- Já possui: ${data.identidadeJaPossui}\n- Elementos a manter: ${data.identidadeElementosManter || 'Nenhum'}\n- Possui logo em alta: ${data.identidadePossuiLogoAlta}\n- Cores desejadas: ${data.identidadeCoresDesejadas}\n- Cores a evitar: ${data.identidadeCoresNaoDesejadas || 'Nenhuma'}\n- Marcas referência: ${data.identidadeMarcasReferencia || 'Nenhuma'}\n- Percepção desejada: ${data.identidadePercepcao.join(', ')} ${data.identidadeOutraPercepcao ? `(${data.identidadeOutraPercepcao})` : ''}`
    );
  }

  if (data.servicosContratados.includes('seo')) {
    servicosDetalhesArray.push(
      `[SEO & BUSCA ORGÂNICA]:\n- Produtos/Serviços vitais: ${data.seoProdutosServicosImportantes}\n- Cidades/Regiões: ${data.seoCidadesRegioes}\n- Bairros: ${data.seoBairros}\n- Termos de pesquisa: ${data.seoTermosPesquisa}\n- Concorrentes: ${data.seoPrincipaisConcorrentes}\n- Sites/perfis concorrentes: ${data.seoSitesPerfisConcorrentes || 'Nenhum'}`
    );
  }

  if (data.servicosContratados.includes('automacoes')) {
    servicosDetalhesArray.push(
      `[SISTEMAS E AUTOMAÇÕES]:\n- Processo a automatizar: ${data.autoProcessoAutomatizar}\n- Como funciona hoje: ${data.autoComoFunciona}\n- Problema a resolver: ${data.autoProblemaResolver}\n- Quem utilizará: ${data.autoQuemUtilizara}\n- Informações a armazenar: ${data.autoInformacoesArmazenar}\n- Ações automáticas: ${data.autoAcoesExecutar}\n- Sistemas a integrar: ${data.autoSistemaIntegrar || 'Nenhum'}\n- Exemplo/Referência: ${data.autoExemploReferencia || 'Nenhum'}`
    );
  }

  if (data.servicosContratados.includes('whatsapp')) {
    const catalogoTxt =
      data.whatsDesejaCatalogo === 'Sim' && data.whatsCatalogoItens?.length
        ? `\n- Itens do Catálogo:\n${data.whatsCatalogoItens
            .map(
              (item, idx) =>
                `  ${idx + 1}. ${item.nome}${item.preco ? ` (Preço: ${item.preco})` : ''}: ${item.descricao}`
            )
            .join('\n')}`
        : `\n- Catálogo: ${data.whatsDesejaCatalogo || 'Não'}`;

    const linksTxt = (data.whatsLinks || []).length
      ? `\n- Links no perfil: ${data.whatsLinks.join(', ')}${
          data.whatsLinkSite ? ` | Site: ${data.whatsLinkSite}` : ''
        }${data.whatsLinkInstagram ? ` | Insta: ${data.whatsLinkInstagram}` : ''}${
          data.whatsLinkFacebook ? ` | FB: ${data.whatsLinkFacebook}` : ''
        }${data.whatsLinkOutro ? ` | Outro: ${data.whatsLinkOutro}` : ''}`
      : '';

    servicosDetalhesArray.push(
      `[WHATSAPP BUSINESS]:\n- Número: ${data.whatsNumero || data.whatsapp}\n- Já possui WhatsApp Business: ${data.whatsJaPossuiBusiness}\n- Nome comercial no perfil: ${data.whatsNomeComercial}\n- Nome de usuário (@): ${data.whatsUsuarioDesejado || 'Não informado'}\n- Descrição do perfil: ${data.whatsDescricaoPerfil}\n- Exibir endereço físico: ${data.whatsPossuiEnderecoFisico}${data.whatsObsLocalizacao ? ` (Obs: ${data.whatsObsLocalizacao})` : ''}${linksTxt}${catalogoTxt}`
    );
  }

  if (data.servicosContratados.includes('email')) {
    const contasTxt = data.emailContas?.length
      ? data.emailContas.map((c) => c.endereco).filter(Boolean).join(', ')
      : 'Nenhuma conta listada';
    servicosDetalhesArray.push(
      `[E-MAIL PROFISSIONAL]:\n- Domínio para os e-mails: ${data.emailDominio}\n- Contas a criar: ${contasTxt}`
    );
  }

  if (data.servicosContratados.includes('assinatura_email')) {
    const pessoasTxt = data.assinaturaPessoas?.length
      ? data.assinaturaPessoas
          .map(
            (p, idx) =>
              `  ${idx + 1}. ${p.nome} (${p.cargo}) - E-mail: ${p.email}${p.telefone ? ` | Tel: ${p.telefone}` : ''}`
          )
          .join('\n')
      : 'Nenhuma pessoa/setor informado';
    servicosDetalhesArray.push(
      `[ASSINATURA DE E-MAIL]:\n- Colaboradores / Setores para assinatura:\n${pessoasTxt}`
    );
  }

  if (data.servicosContratados.includes('registro_dominio')) {
    const extTxt =
      data.dominioExtensao === 'Outra'
        ? data.dominioOutraExtensao || 'Outra'
        : data.dominioExtensao;
    servicosDetalhesArray.push(
      `[REGISTRO DE DOMÍNIO]:\n- Já possui domínio: ${data.dominioJaPossui}\n- Domínio atual: ${data.dominioAtual || 'N/A'}\n- Domínio desejado: ${data.dominioDesejado || 'N/A'}\n- Extensão de interesse: ${extTxt || 'N/A'}`
    );
  }

  if (data.servicosContratados.includes('plaquinha')) {
    servicosDetalhesArray.push(
      `[PLAQUINHA INTELIGENTE]:\n- Destino do QR/NFC: ${data.plaquinhaDestino || 'N/A'}\n- Quantidade de plaquinhas: ${data.plaquinhaQuantidade || '1'}\n- Local de instalação: ${data.plaquinhaLocalInstalacao || 'N/A'}\n- Observações: ${data.plaquinhaObservacoes || 'N/A'}`
    );
  }

  if (data.servicosContratados.includes('catalogo')) {
    servicosDetalhesArray.push(
      `[CATÁLOGO DIGITAL]:\n- Tipo de itens: ${data.catalogoTipoItens || 'N/A'}\n- Quantidade estimada de itens: ${data.catalogoQuantidadeItens || 'N/A'}\n- Possui preços definidos: ${data.catalogoPossuiPrecos || 'N/A'}`
    );
  }

  const detalhesServicosStr = servicosDetalhesArray.join('\n\n');

  const activeSegmentsMap = customSegmentsConfig || SEGMENTS_CONFIG;
  const segConfig = data.segmento ? activeSegmentsMap[data.segmento] : null;
  const detalhesSegmentoArray: string[] = [];
  const individualSegmentQuestions: Record<string, string> = {};
  const handledQuestions = new Set<string>();

  if (segConfig && Array.isArray(segConfig.questions)) {
    segConfig.questions.forEach((q: any) => {
      handledQuestions.add(q.id);
      const resp = data.segmentoRespostas?.[q.id];
      const outroText = data.segmentoRespostas?.[`${q.id}_outro`];
      if (resp && (!Array.isArray(resp) || resp.length > 0)) {
        let formattedResp = '';
        if (Array.isArray(resp)) {
          formattedResp = resp
            .map((item: string) => {
              if (q.otherLabel && item === q.otherLabel && outroText?.trim()) {
                return `${item}: "${outroText.trim()}"`;
              }
              return item;
            })
            .join(', ');
        } else if (typeof resp === 'string') {
          if (q.otherLabel && resp === q.otherLabel && outroText?.trim()) {
            formattedResp = `${resp}: "${outroText.trim()}"`;
          } else {
            formattedResp = resp;
          }
        } else {
          formattedResp = String(resp);
        }
        detalhesSegmentoArray.push(`${q.label}: ${formattedResp}`);
        individualSegmentQuestions[`[Segmento] ${q.label}`] = formattedResp;
      }
    });
  }

  if (data.segmentoRespostas && typeof data.segmentoRespostas === 'object') {
    Object.entries(data.segmentoRespostas).forEach(([key, val]) => {
      if (handledQuestions.has(key) || key.endsWith('_outro')) return;
      if (val && (!Array.isArray(val) || val.length > 0)) {
        const outroVal = data.segmentoRespostas[`${key}_outro`];
        const displayVal = Array.isArray(val)
          ? val.join(', ') + (outroVal ? ` (${outroVal})` : '')
          : String(val) + (outroVal ? ` (${outroVal})` : '');
        detalhesSegmentoArray.push(`${key}: ${displayVal}`);
        individualSegmentQuestions[`[Segmento] ${key}`] = displayVal;
      }
    });
  }

  const detalhesSegmentoStr =
    detalhesSegmentoArray.length > 0
      ? detalhesSegmentoArray.join('\n')
      : 'Nenhum detalhe específico preenchido';

  // Custom / admin-created fields inside respostasPersonalizadas
  const customAnswersMap: Record<string, string> = {};
  if (data.respostasPersonalizadas && typeof data.respostasPersonalizadas === 'object') {
    Object.entries(data.respostasPersonalizadas).forEach(([key, val]) => {
      if (val === undefined || val === null) return;
      if (Array.isArray(val) && val.length === 0) return;
      const strVal = Array.isArray(val) ? val.join(', ') : String(val);
      if (!strVal.trim()) return;

      let label = key;
      const genField = customOnboardingFields?.find((f) => f.id === key || f.key === key);
      if (genField) {
        label = genField.label;
      } else if (customServicesConfig) {
        for (const svc of Object.values(customServicesConfig)) {
          const sq = (svc as any)?.questions?.find((q: any) => q.id === key || q.storageKey === key);
          if (sq) {
            label = sq.label;
            break;
          }
        }
      }
      customAnswersMap[`[Extra] ${label}`] = strVal;
    });
  }

  // Objeto com as colunas completas da planilha (preservando chaves históricas intactas)
  const rowData: Record<string, string> = {
    'Código do cliente': (data as any).codigoCliente || '',
    'Data e hora': dataHora,
    'Status do Onboarding': 'Finalizado',
    'Data de finalização': dataHora,
    'Nome fantasia': data.nomeFantasia || '',
    'Razão social': data.razaoSocial || '',
    'CNPJ': data.cnpj || '',
    'Segmento': data.segmento === 'Outro' && data.outroSegmento ? `Outro (${data.outroSegmento})` : (data.segmento || ''),
    'Outro segmento': data.outroSegmento || '',
    'Descrição da empresa': data.descricaoEmpresa || '',
    'Data de abertura': data.dataAbertura || '',
    'Telefone': data.telefone || '',
    'WhatsApp': data.whatsapp || '',
    'E-mail': data.email || '',
    'Site': data.site || '',
    'Instagram': data.instagram || '',
    'Facebook / outras redes': data.facebookOutras || '',
    'Sem local físico fixo': data.enderecoSemLocalFisico ? 'Sim' : 'Não',
    'CEP': data.cep || '',
    'Rua / Avenida': data.enderecoSemLocalFisico ? 'Atendimento sem local físico fixo' : (data.ruaAvenida || ''),
    'Número': data.numero || '',
    'Complemento': data.complemento || '',
    'Bairro': data.bairro || '',
    'Cidade': data.cidade || '',
    'Estado': data.estado || '',
    'Horário segunda a sexta': horarioSegSex,
    'Segunda': segTxt,
    'Terça': terTxt,
    'Quarta': quaTxt,
    'Quinta': quiTxt,
    'Sexta': sexTxt,
    'Sábado': sabTxt,
    'Domingo': domTxt,
    'Trabalha com agendamento': data.trabalhaAgendamento || '',
    'Formas de agendamento':
      (data.formasAgendamento || []).join(', ') +
      (data.outroAgendamento ? ` (${data.outroAgendamento})` : ''),
    'Possui link de agendamento': data.possuiLinkAgendamento || '',
    'Contato / link de agendamento': data.contatoLinkAgendamento || '',
    'Tipo de estabelecimento': data.tipoEstabelecimento || '',
    'Forma de atendimento': data.formaAtendimento || '',
    'Estacionamento': data.estacionamento || '',
    'Outro estacionamento': data.outroEstacionamento || '',
    'Idiomas': (data.idiomas || []).join(', '),
    'Formas de pagamento':
      (data.formasPagamento || []).join(', ') +
      (data.bandeirasCartao && data.bandeirasCartao.length > 0
        ? ` [Bandeiras: ${data.bandeirasCartao.join(', ')}]`
        : '') +
      (data.outroPagamento ? ` (${data.outroPagamento})` : ''),
    'Outro pagamento': data.outroPagamento || '',
    'Responsável': data.responsavelNome || '',
    'WhatsApp responsável': data.responsavelWhatsapp || '',
    'E-mail responsável': data.responsavelEmail || '',
    'Cargo / função': data.responsavelCargo || '',
    'Serviços contratados': servicosContratadosNomes,
    'Cadastro compartilhado (Produtos e Serviços)': catalogoStr,
    'Detalhes dos serviços': detalhesServicosStr,
    'Detalhes específicos do segmento': detalhesSegmentoStr,
    ...individualSegmentQuestions,
    ...customAnswersMap,
    'Possui materiais': data.possuiMateriais || '',
    'Tipos de materiais': (data.tiposMateriais || []).join(', '),
    'Link TransferNow': (data.linkTransferNow || '') + (data.linksMateriais ? ` | Links: ${data.linksMateriais}` : ''),
    'Observações dos materiais': data.observacoesMateriais || '',
    'Observações finais': data.observacoesFinais || '',
  };

  return {
    rowData,
    raw: data,
    dataHora,
  };
}
