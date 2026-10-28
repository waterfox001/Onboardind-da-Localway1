import { OnboardingData } from '../types';

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  // 1. Dados da Empresa
  nomeFantasia: '',
  razaoSocial: '',
  cnpj: '',
  segmento: '',
  outroSegmento: '',
  descricaoEmpresa: '',
  dataAbertura: '',
  telefone: '',
  whatsapp: '',
  email: '',
  site: '',
  instagram: '',
  facebookOutras: '',

  // 2. Endereço
  ruaAvenida: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',

  // 3. Horário de Funcionamento
  horarios: {
    segunda: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    terca: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    quarta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    quinta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    sexta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    sabado: { status: 'aberto', abertura1: '08:00', fechamento1: '12:00', temIntervalo: false, abertura2: '', fechamento2: '' },
    domingo: { status: 'fechado', abertura1: '', fechamento1: '', temIntervalo: false, abertura2: '', fechamento2: '' },
  },
  trabalhaAgendamento: '',
  formasAgendamento: [],
  outroAgendamento: '',
  contatoLinkAgendamento: '',

  // 4. Estrutura da Empresa
  estacionamento: '',
  outroEstacionamento: '',
  idiomas: ['Português'],
  formasPagamento: [],
  outroPagamento: '',
  bandeirasCartao: [],
  outraBandeiraCartao: '',

  // 5. Responsável pelo Projeto
  responsavelNome: '',
  responsavelWhatsapp: '',
  responsavelEmail: '',
  responsavelCargo: '',

  // 6. Serviços Contratados
  servicosContratados: [],

  // Módulo: Google Perfil
  googleNomeComercial: '',
  googleCategoriaPrincipal: '',
  googleCategoriasSecundarias: '',
  googlePrincipaisServicos: '',
  googleDescricaoServicos: '',
  googleAreaAtendimento: '',
  googleEndereco: '',
  googleHorarios: '',
  googleTelefone: '',
  googleWhatsapp: '',
  googleSite: '',
  googleInstagram: '',
  googlePrincipaisProdutosServicos: '',
  googleInfoAdicionais: '',
  googleJaPossuiPerfil: '',
  googleLinkPerfil: '',
  googleCorrecoesPerfil: '',

  // Módulo: Site Profissional
  siteJaPossui: '',
  siteLinkAtual: '',
  siteManterAtual: '',
  siteMudarAtual: '',
  siteObjetivos: [],
  siteOutroObjetivo: '',
  sitePaginasNecessarias: ['Início', 'Sobre', 'Serviços', 'Contato'],
  siteOutraPagina: '',
  siteReferencia: '',
  siteInfoObrigatoria: '',

  // Módulo: Loja Virtual
  ecommerceProdutosVendidos: '',
  ecommerceQuantidadeProdutos: '',
  ecommercePossuiFotos: '',
  ecommercePossuiCadastro: '',
  ecommerceFormasPagamento: [],
  ecommerceEntrega: '',
  ecommerceRegioesAtendidas: '',
  ecommercePossuiDominio: '',
  ecommercePossuiSistemaPagamento: '',
  ecommerceReferencia: '',

  // Módulo: Tráfego Pago
  trafegoObjetivo: '',
  trafegoOutroObjetivo: '',
  trafegoProdutoServicoPrimeiro: '',
  trafegoCidade: '',
  trafegoBairrosRegioes: '',
  trafegoPublicoAlvo: '',
  trafegoJaAnuncia: '',
  trafegoPlataformas: [],
  trafegoOutraPlataforma: '',
  trafegoCampanhasAtuais: '',
  trafegoWhatsappContatos: '',
  trafegoPeriodoPromocao: '',

  // Módulo: Identidade Visual
  identidadeJaPossui: '',
  identidadeElementosManter: '',
  identidadePossuiLogoAlta: '',
  identidadeCoresDesejadas: '',
  identidadeCoresNaoDesejadas: '',
  identidadeMarcasReferencia: '',
  identidadePercepcao: [],
  identidadeOutraPercepcao: '',

  // Módulo: Mini Site
  minisiteInformacoes: ['WhatsApp', 'Instagram', 'Endereço'],
  minisiteOutraInfo: '',
  minisiteWhatsapp: '',
  minisiteInstagram: '',
  minisiteSite: '',
  minisiteEndereco: '',
  minisiteInfoAdicional: '',

  // Módulo: SEO
  seoProdutosServicosImportantes: '',
  seoCidadesRegioes: '',
  seoBairros: '',
  seoTermosPesquisa: '',
  seoPrincipaisConcorrentes: '',
  seoSitesPerfisConcorrentes: '',

  // Módulo: Sistemas e Automações
  autoProcessoAutomatizar: '',
  autoComoFunciona: '',
  autoProblemaResolver: '',
  autoQuemUtilizara: '',
  autoInformacoesArmazenar: '',
  autoAcoesExecutar: '',
  autoSistemaIntegrar: '',
  autoExemploReferencia: '',

  // Módulo: WhatsApp Business (Refatorado)
  whatsJaPossuiBusiness: '',
  whatsNumero: '',
  whatsNomeComercial: '',
  whatsDescricaoPerfil: '',
  whatsPossuiEnderecoFisico: '',
  whatsObsLocalizacao: '',
  whatsLinks: [],
  whatsLinkSite: '',
  whatsLinkInstagram: '',
  whatsLinkFacebook: '',
  whatsLinkOutro: '',
  whatsUsuarioDesejado: '',
  whatsDesejaCatalogo: '',
  whatsCatalogoItens: [],

  // Módulo: E-mail Profissional
  emailDominio: '',
  emailContas: [],

  // Módulo: Assinatura de E-mail Profissional
  assinaturaPessoas: [],

  // Módulo: Registro de Domínio
  dominioJaPossui: '',
  dominioAtual: '',
  dominioDesejado: '',
  dominioExtensao: '',
  dominioOutraExtensao: '',

  // Módulo: Registro de Marca
  marcaJaPossuiRegistro: '',
  marcaNomeRegistrar: '',
  marcaVariacoesNome: '',

  // 22. Detalhes Específicos do Segmento
  segmentoRespostas: {},

  // 23. Materiais
  possuiMateriais: '',
  tiposMateriais: [],
  linksMateriais: '',
  linkTransferNow: '',
  observacoesMateriais: '',

  // 24. Observações Finais
  observacoesFinais: '',
};
