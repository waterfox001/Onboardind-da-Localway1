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
  | 'registro_dominio'
  | 'plaquinha'
  | 'catalogo';

export type UniversalQuestionType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'yes_no'
  | 'date'
  | 'file'
  | 'select'
  | 'url'
  | 'repeatable'
  | 'products_catalog'
  | 'services_catalog';

export interface ConditionalRule {
  dependsOn: string;
  operator: 'equals' | 'not_equals' | 'includes' | 'not_empty';
  value?: string;
}

export interface UniversalQuestion {
  id: string;
  key?: string;
  storageKey?: string;
  label: string;
  placeholder?: string;
  type: UniversalQuestionType;
  options?: string[];
  helper?: string;
  required?: boolean;
  enabled?: boolean;
  order?: number;
  category?: string;
  allowOther?: boolean;
  otherLabel?: string;
  otherPlaceholder?: string;
  conditional?: ConditionalRule;
}

export interface ManagedServiceConfig {
  id: ServiceId;
  title: string;
  shortTitle: string;
  tagline: string;
  enabled: boolean;
  questions: UniversalQuestion[];
  iconName?: string;
  themeColor?: string;
  bgLight?: string;
  borderLight?: string;
  textColor?: string;
  ringColor?: string;
}

export interface ServiceOption {
  id: ServiceId;
  title: string;
  shortTitle: string;
  tagline: string;
  iconName: string;
  themeColor: string;
  bgLight: string;
  borderLight: string;
  textColor: string;
  ringColor: string;
  enabled?: boolean;
  questions?: UniversalQuestion[];
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

export interface SharedCatalogItem {
  id: string;
  tipo: 'produto' | 'servico';
  nome: string;
  descricao: string;
  tipoPreco: 'fixo' | 'a_partir' | 'sob_consulta';
  preco?: string;
  duracao?: string;
  variacoes?: string;
  fotoLink?: string;
  destinos: ('google' | 'site' | 'minisite')[];
}

export interface WebsitePersonItem {
  id: string;
  nome: string;
  funcao: string;
  fotoLink?: string;
  useGeneralPhoto?: boolean;
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
  codigoCliente?: string;
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
  enderecoSemLocalFisico?: boolean;
  cep?: string;
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
  possuiLinkAgendamento?: string; // 'Sim' | 'Não' | ''
  contatoLinkAgendamento: string;

  // 4. Estrutura da Empresa
  tipoEstabelecimento?: string;
  formaAtendimento?: string;
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

  // Cadastro Compartilhado de Produtos e Serviços
  catalogoCompartilhado?: SharedCatalogItem[];

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
  googleJaPossuiPerfil: string;
  googleLinkPerfil: string;
  googleCorrecoesPerfil: string;
  googleItensDestaqueIds?: string[];
  googleItensCustom?: SharedCatalogItem[];

  // Módulo: Site Profissional (Site Institucional)
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
  // Novos campos estruturados — Site Institucional
  siteHistoria?: string;
  siteApresentarResponsavel?: string;
  siteResponsavelNome?: string;
  siteResponsavelFuncao?: string;
  siteResponsavelFoto?: string;
  siteDiferenciais?: string[];
  siteDiferenciaisOutro?: string;
  siteDiferenciaisDesc?: string;
  sitePublicoAlvo?: string[];
  sitePublicoAlvoOutro?: string;
  sitePublicoAlvoDesc?: string;
  siteServicosSelecionadosIds?: string[];
  siteComercializaProdutos?: string;
  siteProdutosSelecionadosIds?: string[];
  siteProcessoAtendimento?: string[];
  siteProcessoAtendimentoOutro?: string;
  siteOrientacaoPreContratacao?: string;
  siteApresentarEquipeTipo?: string;
  siteEquipePessoas?: WebsitePersonItem[];
  sitePossuiVideos?: string;
  siteVideosLink?: string;
  siteVideosArquivo?: string;
  siteSecoesAdicionais?: string[];
  siteSecoesAdicionaisOutro?: string;
  siteDuvidasFrequentes?: string;
  siteObjetivoPrincipal?: string;

  // Módulo: Loja Virtual
  ecommerceProdutosVendidos: string;
  ecommerceQuantidadeProdutos: string;
  ecommercePossuiFotos: string;
  ecommercePossuiCadastro: string;
  ecommercePossuiVariacoes: string;
  ecommerceControleEstoque: string;
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
  trafegoJaAnuncia: string;
  trafegoPlataformas: string[];
  trafegoOutraPlataforma: string;
  trafegoCampanhasAtuais: string;
  trafegoWhatsappContatos: string;
  trafegoPeriodoPromocao: string;

  // Módulo: Identidade Visual
  identidadeJaPossui: string;
  identidadeElementosManter: string;
  identidadePossuiLogoAlta: string;
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
  minisiteFacebook?: string;
  minisiteSite: string;
  minisiteEndereco: string;
  minisiteGoogleReviews?: string;
  minisiteCatalogoBotao?: string;
  minisiteInfoAdicional: string;
  minisiteApresentacao?: string;
  minisiteItensDestaqueIds?: string[];
  minisiteItensCustom?: SharedCatalogItem[];
  minisiteCatalogoPossui?: string;
  minisiteCatalogoLink?: string;
  minisiteCatalogoArquivo?: string;
  minisiteCoresDesejadas?: string;
  minisiteCoresEvitar?: string;
  minisiteReferenciaVisual?: string;
  minisiteRecursosAdicionais?: string[];
  minisiteWifiRede?: string;
  minisiteWifiSenha?: string;
  minisitePixChave?: string;
  minisitePixTitular?: string;
  minisiteRecursosOutros?: string;

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

  // Módulo: WhatsApp Business
  whatsJaPossuiBusiness: string;
  whatsNumero: string;
  whatsNomeComercial: string;
  whatsDescricaoPerfil: string;
  whatsPossuiEnderecoFisico: string;
  whatsObsLocalizacao: string;
  whatsLinks: string[];
  whatsLinkSite: string;
  whatsLinkInstagram: string;
  whatsLinkFacebook: string;
  whatsLinkOutro: string;
  whatsUsuarioDesejado: string;
  whatsDesejaCatalogo: string;
  whatsCatalogoItens: WhatsAppCatalogItem[];

  // Módulo: E-mail Profissional
  emailDominio: string;
  emailContas: EmailAccountItem[];

  // Módulo: Assinatura de E-mail Profissional
  assinaturaPessoas: EmailSignaturePerson[];

  // Módulo: Registro de Domínio
  dominioJaPossui: string;
  dominioAtual: string;
  dominioDesejado: string;
  dominioExtensao: string;
  dominioOutraExtensao: string;

  // Módulo: Registro de Marca
  marcaJaPossuiRegistro: string;
  marcaNomeRegistrar: string;
  marcaVariacoesNome: string;

  // Módulo: Plaquinha Inteligente QR Code / NFC
  plaquinhaDestino: string;
  plaquinhaQuantidade: string;
  plaquinhaLocalInstalacao: string;
  plaquinhaObservacoes: string;

  // Módulo: Catálogo de Produtos e Serviços
  catalogoTipoItens: string;
  catalogoQuantidadeItens: string;
  catalogoPossuiPrecos: string;

  // 22. Detalhes Específicos do Segmento
  segmentoRespostas: Record<string, any>;

  // 23. Materiais
  possuiMateriais: string;
  tiposMateriais: string[];
  linksMateriais: string;
  linkTransferNow: string;
  observacoesMateriais: string;
  materiaisArquivosNomes?: string[];

  // 24. Observações Finais
  observacoesFinais: string;

  // Respostas de campos/perguntas customizadas criadas no Painel Admin
  respostasPersonalizadas?: Record<string, any>;
}

export type StepType =
  | 'general_company'
  | 'general_structure'
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
  | 'module_plaquinha'
  | 'module_catalogo'
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
