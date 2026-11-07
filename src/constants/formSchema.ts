import { SEGMENTS_CONFIG, SegmentConfig } from './segments';

export type FieldStepId =
  | 'company'
  | 'address'
  | 'hours'
  | 'structure'
  | 'manager'
  | 'materials'
  | 'final_notes';

export type StepCategory = FieldStepId;

export interface OnboardingFieldConfig {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type: 'text' | 'textarea' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'segment_select';
  required: boolean;
  enabled: boolean;
  order: number;
  stepId: FieldStepId;
  category?: string;
  options?: string[];
}

export type CompanyFieldConfig = OnboardingFieldConfig;

export const DEFAULT_ONBOARDING_FIELDS: OnboardingFieldConfig[] = [
  // 1. Dados da Empresa (company)
  {
    id: 'nomeFantasia',
    key: 'nomeFantasia',
    label: 'Nome Fantasia',
    placeholder: 'Ex: Pizzaria Bella Italia',
    helper: 'Nome pelo qual sua empresa é conhecida pelos clientes',
    type: 'text',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'razaoSocial',
    key: 'razaoSocial',
    label: 'Razão Social',
    placeholder: 'Ex: Bella Italia Alimentos LTDA',
    helper: 'Nome oficial registrado no CNPJ',
    type: 'text',
    required: false,
    enabled: true,
    order: 2,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'cnpj',
    key: 'cnpj',
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    helper: 'Cadastro Nacional de Pessoa Jurídica',
    type: 'text',
    required: false,
    enabled: true,
    order: 3,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'dataAbertura',
    key: 'dataAbertura',
    label: 'Data de Abertura da Empresa',
    placeholder: 'Ex: 15/03/2018',
    helper: 'Importante para verificar autoridade e tempo de mercado',
    type: 'text',
    required: false,
    enabled: true,
    order: 4,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'segmento',
    key: 'segmento',
    label: 'Qual é o segmento da sua empresa?',
    helper: 'Define as perguntas personalizadas que serão feitas no formulário',
    type: 'segment_select',
    required: true,
    enabled: true,
    order: 5,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'descricaoEmpresa',
    key: 'descricaoEmpresa',
    label: 'Descrição da Empresa',
    placeholder: 'Conte brevemente sobre sua empresa, seus produtos ou serviços e diferenciais...',
    helper: 'Resumo com foco nos diferenciais e posicionamento',
    type: 'textarea',
    required: true,
    enabled: true,
    order: 6,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'whatsapp',
    key: 'whatsapp',
    label: 'WhatsApp Principal',
    placeholder: '(11) 90000-0000',
    helper: 'Canal oficial para contato direto com seus clientes',
    type: 'text',
    required: true,
    enabled: true,
    order: 7,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'telefone',
    key: 'telefone',
    label: 'Telefone Fixo / Comercial',
    placeholder: '(11) 3000-0000',
    type: 'text',
    required: false,
    enabled: true,
    order: 8,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'email',
    key: 'email',
    label: 'E-mail de Contato',
    placeholder: 'contato@suaempresa.com.br',
    type: 'email',
    required: true,
    enabled: true,
    order: 9,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'site',
    key: 'site',
    label: 'Site Atual',
    placeholder: 'https://suaempresa.com.br',
    type: 'text',
    required: false,
    enabled: true,
    order: 10,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'instagram',
    key: 'instagram',
    label: 'Instagram',
    placeholder: '@suaempresa',
    type: 'text',
    required: false,
    enabled: true,
    order: 11,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },
  {
    id: 'facebookOutras',
    key: 'facebookOutras',
    label: 'Facebook / Outras Redes',
    placeholder: 'facebook.com/suaempresa ou LinkedIn',
    type: 'text',
    required: false,
    enabled: true,
    order: 12,
    stepId: 'company',
    category: '1. Dados da Empresa',
  },

  // 2. Endereço Comercial (address)
  {
    id: 'ruaAvenida',
    key: 'ruaAvenida',
    label: 'Rua / Avenida',
    placeholder: 'Ex: Av. Paulista',
    type: 'text',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'address',
    category: '2. Endereço Comercial',
  },
  {
    id: 'numero',
    key: 'numero',
    label: 'Número',
    placeholder: 'Ex: 1000',
    type: 'text',
    required: true,
    enabled: true,
    order: 2,
    stepId: 'address',
    category: '2. Endereço Comercial',
  },
  {
    id: 'complemento',
    key: 'complemento',
    label: 'Complemento',
    placeholder: 'Ex: Sala 402, Bloco B, Próximo ao metrô',
    type: 'text',
    required: false,
    enabled: true,
    order: 3,
    stepId: 'address',
    category: '2. Endereço Comercial',
  },
  {
    id: 'bairro',
    key: 'bairro',
    label: 'Bairro',
    placeholder: 'Ex: Bela Vista',
    type: 'text',
    required: true,
    enabled: true,
    order: 4,
    stepId: 'address',
    category: '2. Endereço Comercial',
  },
  {
    id: 'cidade',
    key: 'cidade',
    label: 'Cidade',
    placeholder: 'Ex: São Paulo',
    type: 'text',
    required: true,
    enabled: true,
    order: 5,
    stepId: 'address',
    category: '2. Endereço Comercial',
  },
  {
    id: 'estado',
    key: 'estado',
    label: 'Estado (UF)',
    type: 'select',
    required: true,
    enabled: true,
    order: 6,
    stepId: 'address',
    category: '2. Endereço Comercial',
    options: [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ],
  },

  // 3. Horários & Atendimento (hours)
  {
    id: 'horarios',
    key: 'horarios',
    label: 'Tabela de Horários por Dia da Semana',
    helper: 'Dias e horários em que a empresa realiza atendimento',
    type: 'text',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'hours',
    category: '3. Horários de Atendimento',
  },
  {
    id: 'trabalhaAgendamento',
    key: 'trabalhaAgendamento',
    label: 'Trabalha com Agendamento Prévio?',
    helper: 'Indica se os clientes precisam agendar previamente',
    type: 'radio',
    required: true,
    enabled: true,
    order: 2,
    stepId: 'hours',
    category: '3. Horários de Atendimento',
    options: ['Sim', 'Não'],
  },
  {
    id: 'formasAgendamento',
    key: 'formasAgendamento',
    label: 'Formas de Agendamento Aceitas',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 3,
    stepId: 'hours',
    category: '3. Horários de Atendimento',
    options: ['WhatsApp', 'Telefone', 'Direct do Instagram', 'Site / Plataforma online', 'Presencialmente'],
  },
  {
    id: 'contatoLinkAgendamento',
    key: 'contatoLinkAgendamento',
    label: 'Link Direto ou Contato de Agendamento',
    placeholder: 'Ex: https://wa.me/55... ou link do sistema de agendamento',
    type: 'text',
    required: false,
    enabled: true,
    order: 4,
    stepId: 'hours',
    category: '3. Horários de Atendimento',
  },

  // 4. Estrutura & Formas de Pagamento (structure)
  {
    id: 'estacionamento',
    key: 'estacionamento',
    label: 'Estacionamento para Clientes',
    type: 'radio',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'structure',
    category: '4. Estrutura & Pagamento',
    options: [
      'Estacionamento próprio gratuito no local',
      'Estacionamento próprio pago',
      'Estacionamento conveniado próximo',
      'Vagas na rua / zona azul',
      'Não possui estacionamento',
    ],
  },
  {
    id: 'idiomas',
    key: 'idiomas',
    label: 'Idiomas para Atendimento',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 2,
    stepId: 'structure',
    category: '4. Estrutura & Pagamento',
    options: ['Português', 'Inglês', 'Espanhol', 'LIBRAS (Língua Brasileira de Sinais)'],
  },
  {
    id: 'formasPagamento',
    key: 'formasPagamento',
    label: 'Formas de Pagamento Aceitas',
    type: 'checkbox',
    required: true,
    enabled: true,
    order: 3,
    stepId: 'structure',
    category: '4. Estrutura & Pagamento',
    options: ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Boleto Bancário', 'Transferência (TED/DOC)', 'Link de Pagamento'],
  },
  {
    id: 'bandeirasCartao',
    key: 'bandeirasCartao',
    label: 'Bandeiras de Cartão Aceitas',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 4,
    stepId: 'structure',
    category: '4. Estrutura & Pagamento',
    options: ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express (Amex)'],
  },

  // 5. Responsável pelo Projeto (manager)
  {
    id: 'responsavelNome',
    key: 'responsavelNome',
    label: 'Nome Completo do Responsável',
    placeholder: 'Ex: Carlos Alberto da Silva',
    type: 'text',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'manager',
    category: '5. Responsável pelo Projeto',
  },
  {
    id: 'responsavelCargo',
    key: 'responsavelCargo',
    label: 'Cargo / Função na Empresa',
    placeholder: 'Ex: Proprietário, Diretor, Gerente...',
    type: 'text',
    required: true,
    enabled: true,
    order: 2,
    stepId: 'manager',
    category: '5. Responsável pelo Projeto',
  },
  {
    id: 'responsavelWhatsapp',
    key: 'responsavelWhatsapp',
    label: 'WhatsApp do Responsável',
    placeholder: '(11) 90000-0000',
    type: 'text',
    required: true,
    enabled: true,
    order: 3,
    stepId: 'manager',
    category: '5. Responsável pelo Projeto',
  },
  {
    id: 'responsavelEmail',
    key: 'responsavelEmail',
    label: 'E-mail do Responsável',
    placeholder: 'responsavel@suaempresa.com.br',
    type: 'email',
    required: true,
    enabled: true,
    order: 4,
    stepId: 'manager',
    category: '5. Responsável pelo Projeto',
  },

  // 6. Materiais do Projeto (materials)
  {
    id: 'possuiMateriais',
    key: 'possuiMateriais',
    label: 'Já possui materiais digitais para o projeto?',
    type: 'radio',
    required: true,
    enabled: true,
    order: 1,
    stepId: 'materials',
    category: '6. Materiais do Projeto',
    options: ['Sim', 'Não'],
  },
  {
    id: 'tiposMateriais',
    key: 'tiposMateriais',
    label: 'Quais tipos de materiais você possui?',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 2,
    stepId: 'materials',
    category: '6. Materiais do Projeto',
    options: [
      'Logotipo em vetor ou alta resolução',
      'Fotos profissionais de produtos / serviços',
      'Vídeos institucionais / Reels',
      'Cardápio / Tabela de preços em PDF',
      'Apresentações / Manual de marca',
    ],
  },
  {
    id: 'linkTransferNow',
    key: 'linkTransferNow',
    label: 'Link de Envio de Arquivos (TransferNow / Drive)',
    placeholder: 'https://www.transfernow.net/... ou Google Drive',
    type: 'text',
    required: false,
    enabled: true,
    order: 3,
    stepId: 'materials',
    category: '6. Materiais do Projeto',
  },
  {
    id: 'observacoesMateriais',
    key: 'observacoesMateriais',
    label: 'Observações sobre os Materiais',
    placeholder: 'Ex: Pastas organizadas por serviços, logotipo com versão clara e escura...',
    type: 'textarea',
    required: false,
    enabled: true,
    order: 4,
    stepId: 'materials',
    category: '6. Materiais do Projeto',
  },

  // 7. Observações Finais (final_notes)
  {
    id: 'observacoesFinais',
    key: 'observacoesFinais',
    label: 'Observações Finais para a Equipe Localway',
    placeholder: 'Alguma informação importante que gostaria de ressaltar para a nossa equipe?',
    helper: 'Instruções adicionais, prioridades ou particularidades do seu projeto',
    type: 'textarea',
    required: false,
    enabled: true,
    order: 1,
    stepId: 'final_notes',
    category: '7. Observações Finais',
  },
];

// Backwards-compatible alias for existing imports
export const DEFAULT_COMPANY_FIELDS: CompanyFieldConfig[] = DEFAULT_ONBOARDING_FIELDS.filter(
  (f) => f.stepId === 'company'
);

export interface FormSchemaState {
  companyFields: OnboardingFieldConfig[];
  onboardingFields: OnboardingFieldConfig[];
  segmentsConfig: Record<string, SegmentConfig>;
  settings: {
    googleScriptUrl: string;
    transferNowUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
}

export const INITIAL_SCHEMA: FormSchemaState = {
  companyFields: DEFAULT_COMPANY_FIELDS,
  onboardingFields: DEFAULT_ONBOARDING_FIELDS,
  segmentsConfig: SEGMENTS_CONFIG,
  settings: {
    googleScriptUrl:
      'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec',
    transferNowUrl: 'https://www.transfernow.net',
    supabaseUrl: '',
    supabaseAnonKey: '',
  },
};
