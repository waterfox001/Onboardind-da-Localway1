import { OnboardingData, DaySchedule } from '../types';
import { SERVICES_LIST } from '../constants/services';
import { SEGMENTS_CONFIG } from '../constants/segments';

function formatDaySchedule(s: DaySchedule): string {
  if (s.status === 'fechado') return 'Fechado';
  let txt = `${s.abertura1 || '08:00'} às ${s.fechamento1 || '18:00'}`;
  if (s.temIntervalo && s.abertura2 && s.fechamento2) {
    txt += ` e ${s.abertura2} às ${s.fechamento2}`;
  }
  return txt;
}

export function formatSpreadsheetPayload(data: OnboardingData) {
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

  // Nomes dos serviços contratados
  const servicosContratadosNomes = data.servicosContratados
    .map((id) => SERVICES_LIST.find((s) => s.id === id)?.title || id)
    .join(', ');

  // Detalhes compilados dos serviços
  const servicosDetalhesArray: string[] = [];

  if (data.servicosContratados.includes('google')) {
    servicosDetalhesArray.push(
      `[GOOGLE MEU NEGÓCIO]:\n- Nome Comercial: ${data.googleNomeComercial || 'Igual ao nome fantasia'}\n- Categoria Principal: ${data.googleCategoriaPrincipal}\n- Categorias Secundárias: ${data.googleCategoriasSecundarias || 'Nenhuma'}\n- Principais Serviços: ${data.googlePrincipaisServicos}\n- Descrição: ${data.googleDescricaoServicos}\n- Área de Atendimento: ${data.googleAreaAtendimento}\n- Horários/Endereço: ${data.googleEndereco || 'Conforme endereço cadastrado'}\n- Já possui perfil: ${data.googleJaPossuiPerfil} ${data.googleLinkPerfil ? `(${data.googleLinkPerfil})` : ''}\n- Correções necessárias: ${data.googleCorrecoesPerfil || 'Nenhuma'}`
    );
  }

  if (data.servicosContratados.includes('site')) {
    servicosDetalhesArray.push(
      `[SITE PROFISSIONAL]:\n- Já possui site: ${data.siteJaPossui} ${data.siteLinkAtual ? `(${data.siteLinkAtual})` : ''}\n- O que manter: ${data.siteManterAtual || 'Nenhum'}\n- O que mudar: ${data.siteMudarAtual || 'Tudo'}\n- Objetivos: ${data.siteObjetivos.join(', ')} ${data.siteOutroObjetivo ? `(${data.siteOutroObjetivo})` : ''}\n- Páginas: ${data.sitePaginasNecessarias.join(', ')} ${data.siteOutraPagina ? `(${data.siteOutraPagina})` : ''}\n- Referência: ${data.siteReferencia || 'Nenhuma informada'}\n- Informação obrigatória: ${data.siteInfoObrigatoria || 'Nenhuma'}`
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

  if (data.servicosContratados.includes('minisite')) {
    servicosDetalhesArray.push(
      `[MINI SITE]:\n- Informações a exibir: ${data.minisiteInformacoes.join(', ')} ${data.minisiteOutraInfo ? `(${data.minisiteOutraInfo})` : ''}\n- WhatsApp: ${data.minisiteWhatsapp}\n- Instagram: ${data.minisiteInstagram}\n- Site: ${data.minisiteSite}\n- Endereço: ${data.minisiteEndereco}\n- Informações adicionais: ${data.minisiteInfoAdicional || 'Nenhuma'}`
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

  if (data.servicosContratados.includes('registro_marca')) {
    servicosDetalhesArray.push(
      `[REGISTRO DE MARCA]:\n- Possui registro no INPI: ${data.marcaJaPossuiRegistro}\n- Nome exato a registrar: ${data.marcaNomeRegistrar}\n- Variações ou expressões: ${data.marcaVariacoesNome || 'Nenhuma'}`
    );
  }

  const detalhesServicosStr = servicosDetalhesArray.join('\n\n');

  // Detalhes específicos do segmento
  const segConfig = SEGMENTS_CONFIG[data.segmento] || SEGMENTS_CONFIG['Fotografia'];
  const detalhesSegmentoArray: string[] = [];
  if (segConfig) {
    segConfig.questions.forEach((q) => {
      const resp = data.segmentoRespostas[q.id];
      const outroText = data.segmentoRespostas[`${q.id}_outro`];
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
      }
    });
  }
  const detalhesSegmentoStr = detalhesSegmentoArray.join('\n') || 'Nenhum detalhe específico preenchido';

  // Objeto com as colunas completas da planilha
  const rowData: Record<string, string> = {
    'Código do cliente': (data as any).codigoCliente || '',
    'Data e hora': dataHora,
    'Nome fantasia': data.nomeFantasia,
    'Razão social': data.razaoSocial,
    'CNPJ': data.cnpj,
    'Segmento': data.segmento,
    'Outro segmento': data.outroSegmento,
    'Descrição da empresa': data.descricaoEmpresa,
    'Data de abertura': data.dataAbertura,
    'Telefone': data.telefone,
    'WhatsApp': data.whatsapp,
    'E-mail': data.email,
    'Site': data.site,
    'Instagram': data.instagram,
    'Facebook / outras redes': data.facebookOutras,
    'Rua / Avenida': data.ruaAvenida,
    'Número': data.numero,
    'Complemento': data.complemento,
    'Bairro': data.bairro,
    'Cidade': data.cidade,
    'Estado': data.estado,
    'Horário segunda a sexta': horarioSegSex,
    'Segunda': segTxt,
    'Terça': terTxt,
    'Quarta': quaTxt,
    'Quinta': quiTxt,
    'Sexta': sexTxt,
    'Sábado': sabTxt,
    'Domingo': domTxt,
    'Trabalha com agendamento': data.trabalhaAgendamento,
    'Formas de agendamento': data.formasAgendamento.join(', ') + (data.outroAgendamento ? ` (${data.outroAgendamento})` : ''),
    'Contato / link de agendamento': data.contatoLinkAgendamento,
    'Estacionamento': data.estacionamento,
    'Outro estacionamento': data.outroEstacionamento,
    'Idiomas': data.idiomas.join(', '),
    'Formas de pagamento':
      data.formasPagamento.join(', ') +
      (data.bandeirasCartao && data.bandeirasCartao.length > 0
        ? ` [Bandeiras: ${data.bandeirasCartao.join(', ')}]`
        : '') +
      (data.outroPagamento ? ` (${data.outroPagamento})` : ''),
    'Outro pagamento': data.outroPagamento,
    'Responsável': data.responsavelNome,
    'WhatsApp responsável': data.responsavelWhatsapp,
    'E-mail responsável': data.responsavelEmail,
    'Cargo / função': data.responsavelCargo,
    'Serviços contratados': servicosContratadosNomes,
    'Detalhes dos serviços': detalhesServicosStr,
    'Detalhes específicos do segmento': detalhesSegmentoStr,
    'Possui materiais': data.possuiMateriais,
    'Tipos de materiais': data.tiposMateriais.join(', '),
    'Link TransferNow': data.linkTransferNow + (data.linksMateriais ? ` | Links: ${data.linksMateriais}` : ''),
    'Observações dos materiais': data.observacoesMateriais,
    'Observações finais': data.observacoesFinais,
  };

  return {
    rowData,
    raw: data,
    dataHora,
  };
}
