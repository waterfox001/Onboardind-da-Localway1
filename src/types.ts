export type ServiceId =
  | 'google'
  | 'site'
  | 'ecommerce'
  | 'trafego'
  | 'identidade'
  | 'minisite'
  | 'seo'
  | 'automacoes'
  | 'whatsapp'
  | 'email'
  | 'assinatura_email'
  | 'registro_marca'
  | 'registro_dominio';

export interface ServiceOption {
  id: ServiceId;
  title: string;
  shortTitle: string;
  tagline: string;
  iconName: string;
  themeColor: string; // Hex color
  bgLight: string; // Tailwind class
  borderLight: string; // Tailwind class
  textColor: string; // Tailwind class
  ringColor: string; // Tailwind class
}

export type DayOfWeek =
  | 'segunda'
  | 'terca'
  | 'quarta'
  | 'quinta'
  | 'sexta'
  | 'sabado'
  | 'domingo';

export interface DaySchedule {
  status: 'aberto' | 'fechado';
  abertura1: string;
  fechamento1: string;
  temIntervalo?: boolean;
  abertura2?: string;
  fechamento2?: string;
}

export interface WhatsAppCatalogItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
}

export interface EmailAccountItem {
  id: string;
  endereco: string;
}

export interface EmailSignaturePerson {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

export interface OnboardingData {
  // 1. Dados da Empresa
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  segmento: string;
  outroSegmento: string;
  descricaoEmpresa: string;
  dataAbertura: string;
  telefone: string;
  whatsapp: string;
  email: string;
  site: string;
  instagram: string;
  facebookOutras: string;

  // 2. Endereço
  ruaAvenida: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;

  // 3. Horário de Funcionamento
  horarios: Record<DayOfWeek, DaySchedule>;
  trabalhaAgendamento: string; // 'Sim' | 'Não' | ''
  formasAgendamento: string[];
  outroAgendamento: string;
  contatoLinkAgendamento: string;

  // 4. Estrutura da Empresa
  estacionamento: string;
  outroEstacionamento: string;
  idiomas: string[];
  formasPagamento: string[];
  outroPagamento: string;
  bandeirasCartao: string[];
  outraBandeiraCartao: string;

  // 5. Responsável pelo Projeto
  responsavelNome: string;
  responsavelWhatsapp: string;
  responsavelEmail: string;
  responsavelCargo: string;

  // 6. Serviços Contratados
  servicosContratados: ServiceId[];

  // Módulo: Google Perfil
  googleNomeComercial: string;
  googleCategoriaPrincipal: string;
  googleCategoriasSecundarias: string;
  googlePrincipaisServicos: string;
  googleDescricaoServicos: string;
  googleAreaAtendimento: string;
  googleEndereco: string;
  googleHorarios: string;
  googleTelefone: string;
  googleWhatsapp: string;
  googleSite: string;
  googleInstagram: string;
  googlePrincipaisProdutosServicos: string;
  googleInfoAdicionais: string;
  googleJaPossuiPerfil: string; // 'Sim' | 'Não' | 'Não sei' | ''
  googleLinkPerfil: string;
  googleCorrecoesPerfil: string;

  // Módulo: Site Profissional
  siteJaPossui: string; // 'Sim' | 'Não' | ''
  siteLinkAtual: string;
  siteManterAtual: string;
  siteMudarAtual: string;
  siteObjetivos: string[];
  siteOutroObjetivo: string;
  sitePaginasNecessarias: string[];
  siteOutraPagina: string;
  siteReferencia: string;
  siteInfoObrigatoria: string;

  // Módulo: Loja Virtual
  ecommerceProdutosVendidos: string;
  ecommerceQuantidadeProdutos: string;
  ecommercePossuiFotos: string; // 'Sim' | 'Não' | ''
  ecommercePossuiCadastro: string; // 'Sim' | 'Não' | ''
  ecommerceFormasPagamento: string[];
  ecommerceEntrega: string;
  ecommerceRegioesAtendidas: string;
  ecommercePossuiDominio: string;
  ecommercePossuiSistemaPagamento: string;
  ecommerceReferencia: string;

  // Módulo: Tráfego Pago
  trafegoObjetivo: string;
  trafegoOutroObjetivo: string;
  trafegoProdutoServicoPrimeiro: string;
  trafegoCidade: string;
  trafegoBairrosRegioes: string;
  trafegoPublicoAlvo: string;
  trafegoJaAnuncia: string; // 'Sim' | 'Não' | ''
  trafegoPlataformas: string[];
  trafegoOutraPlataforma: string;
  trafegoCampanhasAtuais: string;
  trafegoWhatsappContatos: string;
  trafegoPeriodoPromocao: string;

  // Módulo: Identidade Visual
  identidadeJaPossui: string; // 'Sim' | 'Não' | ''
  identidadeElementosManter: string;
  identidadePossuiLogoAlta: string; // 'Sim' | 'Não' | ''
  identidadeCoresDesejadas: string;
  identidadeCoresNaoDesejadas: string;
  identidadeMarcasReferencia: string;
  identidadePercepcao: string[];
  identidadeOutraPercepcao: string;

  // Módulo: Mini Site
  minisiteInformacoes: string[];
  minisiteOutraInfo: string;
  minisiteWhatsapp: string;
  minisiteInstagram: string;
  minisiteSite: string;
  minisiteEndereco: string;
  minisiteInfoAdicional: string;

  // Módulo: SEO
  seoProdutosServicosImportantes: string;
  seoCidadesRegioes: string;
  seoBairros: string;
  seoTermosPesquisa: string;
  seoPrincipaisConcorrentes: string;
  seoSitesPerfisConcorrentes: string;

  // Módulo: Sistemas e Automações
  autoProcessoAutomatizar: string;
  autoComoFunciona: string;
  autoProblemaResolver: string;
  autoQuemUtilizara: string;
  autoInformacoesArmazenar: string;
  autoAcoesExecutar: string;
  autoSistemaIntegrar: string;
  autoExemploReferencia: string;

  // Módulo: WhatsApp Business (Refatorado)
  whatsJaPossuiBusiness: string; // 'Sim' | 'Não' | 'Está usando WhatsApp comum' | ''
  whatsNumero: string;
  whatsNomeComercial: string;
  whatsDescricaoPerfil: string;
  whatsPossuiEnderecoFisico: string; // 'Sim' | 'Não' | ''
  whatsObsLocalizacao: string;
  whatsLinks: string[]; // ['Site', 'Instagram', 'Facebook', 'Outro link']
  whatsLinkSite: string;
  whatsLinkInstagram: string;
  whatsLinkFacebook: string;
  whatsLinkOutro: string;
  whatsUsuarioDesejado: string;
  whatsDesejaCatalogo: string; // 'Sim' | 'Não' | 'Já possui um catálogo' | ''
  whatsCatalogoItens: WhatsAppCatalogItem[];

  // Módulo: E-mail Profissional
  emailDominio: string;
  emailContas: EmailAccountItem[];

  // Módulo: Assinatura de E-mail Profissional
  assinaturaPessoas: EmailSignaturePerson[];

  // Módulo: Registro de Domínio
  dominioJaPossui: string; // 'Sim' | 'Não' | ''
  dominioAtual: string;
  dominioDesejado: string;
  dominioExtensao: string; // '.com.br' | '.com' | 'Ainda não sei' | 'Outra' | ''
  dominioOutraExtensao: string;

  // Módulo: Registro de Marca
  marcaJaPossuiRegistro: string; // 'Sim' | 'Não' | 'Não sei' | ''
  marcaNomeRegistrar: string;
  marcaVariacoesNome: string;

  // 22. Detalhes Específicos do Segmento
  segmentoRespostas: Record<string, any>;

  // 23. Materiais
  possuiMateriais: string; // 'Sim' | 'Não' | ''
  tiposMateriais: string[];
  linksMateriais: string;
  linkTransferNow: string;
  observacoesMateriais: string;

  // 24. Observações Finais
  observacoesFinais: string;
}

export type StepType =
  | 'company'
  | 'address'
  | 'hours'
  | 'structure'
  | 'manager'
  | 'services'
  | 'segment_details'
  | 'module_google'
  | 'module_site'
  | 'module_ecommerce'
  | 'module_trafego'
  | 'module_identidade'
  | 'module_minisite'
  | 'module_seo'
  | 'module_automacoes'
  | 'module_whatsapp'
  | 'module_email'
  | 'module_assinatura_email'
  | 'module_registro_marca'
  | 'module_registro_dominio'
  | 'materials'
  | 'final_notes'
  | 'summary'
  | 'success';

export interface StepDefinition {
  id: StepType;
  title: string;
  subtitle: string;
  categoryName: string;
}
