import { SEGMENTS_CONFIG, SegmentConfig } from './segments';
import { DEFAULT_SERVICES_CONFIG } from './services';
import { ConditionalRule, ManagedServiceConfig, UniversalQuestionType } from '../types';

export type FieldStepId =
  | 'company'
  | 'address'
  | 'hours'
  | 'structure'
  | 'manager'
  | 'materials'
  | 'final_notes'
  | 'general_company'
  | 'general_structure';

export type GeneralPageId = 'general_company' | 'general_structure';

export type StepCategory = FieldStepId;

export interface FormCategoryConfig {
  id: string;
  title: string;
  subtitle?: string;
  pageId: GeneralPageId;
  order: number;
  icon?: string;
}

export interface OnboardingFieldConfig {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type:
    | 'text'
    | 'textarea'
    | 'email'
    | 'tel'
    | 'url'
    | 'number'
    | 'date'
    | 'yes_no'
    | 'file'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'segment_select'
    | 'schedule_grid'
    | 'no_physical_toggle'
    | 'shared_catalog'
    | 'repeatable'
    | 'products_catalog'
    | 'services_catalog';
  required: boolean;
  enabled: boolean;
  order: number;
  stepId: FieldStepId;
  pageId?: GeneralPageId;
  categoryId?: string;
  category?: string;
  options?: string[];
  allowOther?: boolean;
  conditional?: ConditionalRule;
  colSpan?: 1 | 2;
}

export type CompanyFieldConfig = OnboardingFieldConfig;

export const DEFAULT_CATEGORIES_CONFIG: FormCategoryConfig[] = [
  {
    id: 'cat_company',
    title: 'A. Empresa',
    subtitle: 'Dados cadastrais e canais principais de contato',
    pageId: 'general_company',
    order: 1,
    icon: 'Building2',
  },
  {
    id: 'cat_address',
    title: 'B. Endereço',
    subtitle: 'Localização do negócio ou atendimento em região dos clientes',
    pageId: 'general_company',
    order: 2,
    icon: 'MapPin',
  },
  {
    id: 'cat_hours',
    title: 'C. Horários de Funcionamento e Agendamento',
    subtitle: 'Dias, horários de atendimento e política de agendamento prévio',
    pageId: 'general_company',
    order: 3,
    icon: 'Clock',
  },
  {
    id: 'cat_structure',
    title: 'A. Estrutura e Atendimento',
    subtitle: 'Formato de operação, acessibilidade e idiomas',
    pageId: 'general_structure',
    order: 4,
    icon: 'Layers',
  },
  {
    id: 'cat_payment',
    title: 'B. Formas de Pagamento',
    subtitle: 'Modalidades aceitas e bandeiras de cartão',
    pageId: 'general_structure',
    order: 5,
    icon: 'CreditCard',
  },
  {
    id: 'cat_manager',
    title: 'C. Responsável pelo Projeto',
    subtitle: 'Pessoa de contato principal para aprovações com a Localway',
    pageId: 'general_structure',
    order: 6,
    icon: 'UserCheck',
  },
  {
    id: 'cat_catalog',
    title: 'D. Cadastro Compartilhado de Produtos e Serviços (Opcional)',
    subtitle: 'Cadastre seus itens uma única vez para reaproveitar em Google, Site e Mini Site',
    pageId: 'general_structure',
    order: 7,
    icon: 'PackagePlus',
  },
  {
    id: 'cat_materials',
    title: 'E. Arquivos e Materiais Digitais',
    subtitle: 'Logotipo, fotos e links de pastas na nuvem',
    pageId: 'general_structure',
    order: 8,
    icon: 'FolderUp',
  },
  {
    id: 'cat_final_notes',
    title: 'F. Observações Finais',
    subtitle: 'Orientações ou prioridades adicionais para nossa equipe',
    pageId: 'general_structure',
    order: 9,
    icon: 'MessageCircleHeart',
  },
];

export const DEFAULT_ONBOARDING_FIELDS: OnboardingFieldConfig[] = [
  // ================= PÁGINA 1A: EMPRESA =================
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
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'razaoSocial',
    key: 'razaoSocial',
    label: 'Razão Social',
    placeholder: 'Ex: Bella Italia Alimentos LTDA',
    helper: 'Nome oficial registrado no CNPJ',
    type: 'text',
    required: false,
    enabled: false,
    order: 2,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'cnpj',
    key: 'cnpj',
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    helper: 'Cadastro Nacional de Pessoa Jurídica',
    type: 'text',
    required: false,
    enabled: false,
    order: 3,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'dataAbertura',
    key: 'dataAbertura',
    label: 'Data de Abertura da Empresa',
    placeholder: 'Ex: 15/03/2018',
    helper: 'Importante para verificar autoridade e tempo de mercado',
    type: 'text',
    required: false,
    enabled: false,
    order: 4,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'segmento',
    key: 'segmento',
    label: 'Segmento da Empresa',
    helper: 'Define as perguntas personalizadas da sua área de atuação logo abaixo',
    type: 'segment_select',
    required: true,
    enabled: true,
    order: 5,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'descricaoEmpresa',
    key: 'descricaoEmpresa',
    label: 'Descrição da Empresa',
    placeholder: 'Conte brevemente sobre sua empresa, seus produtos ou serviços e diferenciais...',
    helper: 'Resumo geral com foco em posicionamento e diferenciais',
    type: 'textarea',
    required: true,
    enabled: true,
    order: 6,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
  },
  {
    id: 'whatsapp',
    key: 'whatsapp',
    label: 'WhatsApp Principal',
    placeholder: '(11) 90000-0000',
    helper: 'Canal oficial para contato direto com seus clientes (reutilizado automaticamente nos serviços)',
    type: 'tel',
    required: true,
    enabled: true,
    order: 7,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
  },
  {
    id: 'telefone',
    key: 'telefone',
    label: 'Telefone Comercial',
    placeholder: '(11) 3000-0000',
    type: 'tel',
    required: false,
    enabled: true,
    order: 8,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
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
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
  },
  {
    id: 'site',
    key: 'site',
    label: 'Site Atual',
    placeholder: 'https://suaempresa.com.br',
    type: 'url',
    required: false,
    enabled: true,
    order: 10,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
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
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
  },
  {
    id: 'facebookOutras',
    key: 'facebookOutras',
    label: 'Facebook e Outras Redes Sociais',
    placeholder: 'facebook.com/suaempresa ou LinkedIn',
    type: 'text',
    required: false,
    enabled: true,
    order: 12,
    stepId: 'company',
    pageId: 'general_company',
    categoryId: 'cat_company',
    category: 'A. Empresa',
    colSpan: 1,
  },

  // ================= PÁGINA 1B: ENDEREÇO =================
  {
    id: 'enderecoSemLocalFisico',
    key: 'enderecoSemLocalFisico',
    label: 'Não possuo estabelecimento físico aberto ao público (atendimento online ou na região dos clientes)',
    helper: 'Marque esta opção caso não atenda clientes em endereço físico fixo.',
    type: 'no_physical_toggle',
    required: false,
    enabled: true,
    order: 13,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
  },
  {
    id: 'cep',
    key: 'cep',
    label: 'CEP',
    placeholder: '00000-000',
    helper: 'Digite o CEP para preencher rua, bairro, cidade e estado automaticamente.',
    type: 'text',
    required: false,
    enabled: true,
    order: 14,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    conditional: {
      dependsOn: 'enderecoSemLocalFisico',
      operator: 'not_equals',
      value: 'true',
    },
    colSpan: 1,
  },
  {
    id: 'ruaAvenida',
    key: 'ruaAvenida',
    label: 'Rua / Avenida',
    placeholder: 'Ex: Av. Paulista',
    type: 'text',
    required: true,
    enabled: true,
    order: 15,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    conditional: {
      dependsOn: 'enderecoSemLocalFisico',
      operator: 'not_equals',
      value: 'true',
    },
    colSpan: 2,
  },
  {
    id: 'numero',
    key: 'numero',
    label: 'Número',
    placeholder: 'Ex: 1000',
    type: 'text',
    required: true,
    enabled: true,
    order: 16,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    conditional: {
      dependsOn: 'enderecoSemLocalFisico',
      operator: 'not_equals',
      value: 'true',
    },
    colSpan: 1,
  },
  {
    id: 'complemento',
    key: 'complemento',
    label: 'Complemento',
    placeholder: 'Ex: Sala 402, Bloco B, Próximo ao metrô',
    type: 'text',
    required: false,
    enabled: true,
    order: 17,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    conditional: {
      dependsOn: 'enderecoSemLocalFisico',
      operator: 'not_equals',
      value: 'true',
    },
    colSpan: 1,
  },
  {
    id: 'bairro',
    key: 'bairro',
    label: 'Bairro',
    placeholder: 'Ex: Bela Vista',
    type: 'text',
    required: true,
    enabled: true,
    order: 18,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    conditional: {
      dependsOn: 'enderecoSemLocalFisico',
      operator: 'not_equals',
      value: 'true',
    },
    colSpan: 1,
  },
  {
    id: 'cidade',
    key: 'cidade',
    label: 'Cidade',
    placeholder: 'Ex: São Paulo',
    type: 'text',
    required: true,
    enabled: true,
    order: 19,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    colSpan: 1,
  },
  {
    id: 'estado',
    key: 'estado',
    label: 'Estado (UF)',
    type: 'select',
    required: true,
    enabled: true,
    order: 20,
    stepId: 'address',
    pageId: 'general_company',
    categoryId: 'cat_address',
    category: 'B. Endereço',
    options: [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
    ],
    colSpan: 1,
  },

  // ================= PÁGINA 1C: HORÁRIOS E AGENDAMENTO =================
  {
    id: 'horarios',
    key: 'horarios',
    label: 'Horários de Funcionamento (Segunda a Domingo)',
    helper: 'Marque dias fechados ou adicione intervalo/segundo período por dia',
    type: 'schedule_grid',
    required: true,
    enabled: true,
    order: 21,
    stepId: 'hours',
    pageId: 'general_company',
    categoryId: 'cat_hours',
    category: 'C. Horários de Funcionamento e Agendamento',
  },
  {
    id: 'trabalhaAgendamento',
    key: 'trabalhaAgendamento',
    label: 'Trabalha com agendamento prévio?',
    helper: 'Indica se os clientes precisam ou costumam agendar horário',
    type: 'radio',
    required: true,
    enabled: true,
    order: 22,
    stepId: 'hours',
    pageId: 'general_company',
    categoryId: 'cat_hours',
    category: 'C. Horários de Funcionamento e Agendamento',
    options: ['Sim', 'Não'],
  },
  {
    id: 'formasAgendamento',
    key: 'formasAgendamento',
    label: 'Como funciona o agendamento?',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 23,
    stepId: 'hours',
    pageId: 'general_company',
    categoryId: 'cat_hours',
    category: 'C. Horários de Funcionamento e Agendamento',
    options: ['WhatsApp', 'Telefone', 'Direct do Instagram', 'Site / Plataforma online', 'Presencialmente', 'Outro'],
    allowOther: true,
    conditional: {
      dependsOn: 'trabalhaAgendamento',
      operator: 'equals',
      value: 'Sim',
    },
  },
  {
    id: 'possuiLinkAgendamento',
    key: 'possuiLinkAgendamento',
    label: 'Possui link de agendamento?',
    type: 'radio',
    required: false,
    enabled: true,
    order: 24,
    stepId: 'hours',
    pageId: 'general_company',
    categoryId: 'cat_hours',
    category: 'C. Horários de Funcionamento e Agendamento',
    options: ['Sim', 'Não'],
    conditional: {
      dependsOn: 'trabalhaAgendamento',
      operator: 'equals',
      value: 'Sim',
    },
  },
  {
    id: 'contatoLinkAgendamento',
    key: 'contatoLinkAgendamento',
    label: 'Informe o link de agendamento',
    placeholder: 'Ex: https://calendly.com/suaempresa ou https://wa.me/55...',
    type: 'url',
    required: false,
    enabled: true,
    order: 25,
    stepId: 'hours',
    pageId: 'general_company',
    categoryId: 'cat_hours',
    category: 'C. Horários de Funcionamento e Agendamento',
    conditional: {
      dependsOn: 'possuiLinkAgendamento',
      operator: 'equals',
      value: 'Sim',
    },
  },

  // ================= PÁGINA 2A: ESTRUTURA E ATENDIMENTO =================
  {
    id: 'tipoEstabelecimento',
    key: 'tipoEstabelecimento',
    label: 'Tipo de Estabelecimento',
    helper: 'Ajuda a definir o posicionamento do seu Perfil no Google e Site',
    type: 'radio',
    required: false,
    enabled: true,
    order: 26,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_structure',
    category: 'A. Estrutura e Atendimento',
    options: [
      'Loja de rua / Ponto comercial próprio',
      'Sala comercial / Consultório / Escritório',
      'Quiosque ou loja em shopping / galeria',
      'Atendimento domiciliar / Sem ponto fixo aberto ao público',
      'Operação 100% digital / Online',
    ],
  },
  {
    id: 'formaAtendimento',
    key: 'formaAtendimento',
    label: 'Forma de Atendimento',
    helper: 'Será reaproveitada automaticamente nas configurações do Google e Site',
    type: 'radio',
    required: true,
    enabled: true,
    order: 27,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_structure',
    category: 'A. Estrutura e Atendimento',
    options: [
      'Atendemos clientes em nosso estabelecimento',
      'Atendemos somente na região dos clientes',
      'Trabalhamos das duas formas',
      'Atendimento 100% online',
    ],
  },
  {
    id: 'estacionamento',
    key: 'estacionamento',
    label: 'Estacionamento para Clientes',
    type: 'radio',
    required: false,
    enabled: true,
    order: 28,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_structure',
    category: 'A. Estrutura e Atendimento',
    options: [
      'Estacionamento próprio gratuito no local',
      'Estacionamento próprio pago',
      'Estacionamento conveniado próximo',
      'Vagas na rua / zona azul',
      'Não possui estacionamento',
      'Outro',
    ],
    allowOther: true,
    conditional: {
      dependsOn: 'formaAtendimento',
      operator: 'not_equals',
      value: 'Atendimento 100% online',
    },
  },
  {
    id: 'idiomas',
    key: 'idiomas',
    label: 'Idiomas de Atendimento',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 29,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_structure',
    category: 'A. Estrutura e Atendimento',
    options: ['Português', 'Inglês', 'Espanhol', 'LIBRAS (Língua Brasileira de Sinais)'],
  },

  // ================= PÁGINA 2B: FORMAS DE PAGAMENTO =================
  {
    id: 'formasPagamento',
    key: 'formasPagamento',
    label: 'Formas de Pagamento Aceitas',
    type: 'checkbox',
    required: true,
    enabled: true,
    order: 30,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_payment',
    category: 'B. Formas de Pagamento',
    options: [
      'Pix',
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'Boleto',
      'Transferência Bancária',
      'Outros',
    ],
    allowOther: true,
  },
  {
    id: 'bandeirasCartao',
    key: 'bandeirasCartao',
    label: 'Bandeiras de Cartão Aceitas',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 31,
    stepId: 'structure',
    pageId: 'general_structure',
    categoryId: 'cat_payment',
    category: 'B. Formas de Pagamento',
    options: ['Visa', 'Mastercard', 'Elo', 'Hipercard', 'American Express (Amex)', 'Outra'],
    allowOther: true,
    conditional: {
      dependsOn: 'formasPagamento',
      operator: 'includes',
      value: 'Cartão',
    },
  },

  // ================= PÁGINA 2C: RESPONSÁVEL PELO PROJETO =================
  {
    id: 'responsavelNome',
    key: 'responsavelNome',
    label: 'Nome do Responsável',
    placeholder: 'Ex: Carlos Alberto da Silva',
    type: 'text',
    required: true,
    enabled: true,
    order: 32,
    stepId: 'manager',
    pageId: 'general_structure',
    categoryId: 'cat_manager',
    category: 'C. Responsável pelo Projeto',
    colSpan: 1,
  },
  {
    id: 'responsavelCargo',
    key: 'responsavelCargo',
    label: 'Cargo / Função na Empresa',
    placeholder: 'Ex: Proprietário, Diretor, Gerente...',
    type: 'text',
    required: false,
    enabled: true,
    order: 33,
    stepId: 'manager',
    pageId: 'general_structure',
    categoryId: 'cat_manager',
    category: 'C. Responsável pelo Projeto',
    colSpan: 1,
  },
  {
    id: 'responsavelWhatsapp',
    key: 'responsavelWhatsapp',
    label: 'WhatsApp do Responsável',
    placeholder: '(11) 90000-0000',
    type: 'tel',
    required: true,
    enabled: true,
    order: 34,
    stepId: 'manager',
    pageId: 'general_structure',
    categoryId: 'cat_manager',
    category: 'C. Responsável pelo Projeto',
    colSpan: 1,
  },
  {
    id: 'responsavelEmail',
    key: 'responsavelEmail',
    label: 'E-mail do Responsável',
    placeholder: 'responsavel@suaempresa.com.br',
    type: 'email',
    required: true,
    enabled: true,
    order: 35,
    stepId: 'manager',
    pageId: 'general_structure',
    categoryId: 'cat_manager',
    category: 'C. Responsável pelo Projeto',
    colSpan: 1,
  },

  // ================= PÁGINA 2D: CADASTRO COMPARTILHADO =================
  {
    id: 'catalogoCompartilhado',
    key: 'catalogoCompartilhado',
    label: 'Produtos e Serviços da Empresa',
    helper: 'Opcional: cadastre uma vez e escolha onde exibir (Perfil no Google, Site Institucional ou Mini Site). Empresas que prestam apenas serviços não precisam cadastrar produtos.',
    type: 'shared_catalog',
    required: false,
    enabled: true,
    order: 36,
    stepId: 'general_structure',
    pageId: 'general_structure',
    categoryId: 'cat_catalog',
    category: 'D. Cadastro Compartilhado de Produtos e Serviços (Opcional)',
  },

  // ================= PÁGINA 2E: ARQUIVOS E MATERIAIS DIGITAIS =================
  {
    id: 'possuiMateriais',
    key: 'possuiMateriais',
    label: 'Já possui arquivos ou materiais digitais para compartilhar agora?',
    helper: 'Não é obrigatório possuir os materiais neste momento.',
    type: 'radio',
    required: false,
    enabled: true,
    order: 37,
    stepId: 'materials',
    pageId: 'general_structure',
    categoryId: 'cat_materials',
    category: 'E. Arquivos e Materiais Digitais',
    options: ['Sim', 'Não possuo materiais no momento'],
  },
  {
    id: 'tiposMateriais',
    key: 'tiposMateriais',
    label: 'Quais materiais deseja enviar?',
    type: 'checkbox',
    required: false,
    enabled: true,
    order: 38,
    stepId: 'materials',
    pageId: 'general_structure',
    categoryId: 'cat_materials',
    category: 'E. Arquivos e Materiais Digitais',
    options: [
      'Logotipo',
      'Fotos do estabelecimento',
      'Fotos da equipe',
      'Fotos de produtos e serviços',
      'Outros materiais relevantes',
    ],
    conditional: {
      dependsOn: 'possuiMateriais',
      operator: 'equals',
      value: 'Sim',
    },
  },
  {
    id: 'linkTransferNow',
    key: 'linkTransferNow',
    label: 'Link de Envio de Arquivos (TransferNow)',
    placeholder: 'https://www.transfernow.net/dl/...',
    type: 'url',
    required: false,
    enabled: true,
    order: 39,
    stepId: 'materials',
    pageId: 'general_structure',
    categoryId: 'cat_materials',
    category: 'E. Arquivos e Materiais Digitais',
    conditional: {
      dependsOn: 'possuiMateriais',
      operator: 'equals',
      value: 'Sim',
    },
    colSpan: 1,
  },
  {
    id: 'linksMateriais',
    key: 'linksMateriais',
    label: 'Link do Google Drive / Dropbox / OneDrive',
    placeholder: 'https://drive.google.com/drive/folders/...',
    type: 'url',
    required: false,
    enabled: true,
    order: 40,
    stepId: 'materials',
    pageId: 'general_structure',
    categoryId: 'cat_materials',
    category: 'E. Arquivos e Materiais Digitais',
    conditional: {
      dependsOn: 'possuiMateriais',
      operator: 'equals',
      value: 'Sim',
    },
    colSpan: 1,
  },
  {
    id: 'observacoesMateriais',
    key: 'observacoesMateriais',
    label: 'Observações sobre os Materiais',
    placeholder: 'Ex: Pastas organizadas por serviços, logotipo em alta resolução...',
    type: 'textarea',
    required: false,
    enabled: true,
    order: 41,
    stepId: 'materials',
    pageId: 'general_structure',
    categoryId: 'cat_materials',
    category: 'E. Arquivos e Materiais Digitais',
  },

  // ================= PÁGINA 2F: OBSERVAÇÕES FINAIS =================
  {
    id: 'observacoesFinais',
    key: 'observacoesFinais',
    label: 'Observações Finais para a Equipe Localway',
    placeholder: 'Alguma informação importante, expectativa ou prioridade que gostaria de ressaltar?',
    helper: 'Campo opcional — compartilhe qualquer orientação adicional com nossa equipe',
    type: 'textarea',
    required: false,
    enabled: true,
    order: 42,
    stepId: 'final_notes',
    pageId: 'general_structure',
    categoryId: 'cat_final_notes',
    category: 'F. Observações Finais',
  },
];

// Backwards-compatible alias for existing imports
export const DEFAULT_COMPANY_FIELDS: CompanyFieldConfig[] = DEFAULT_ONBOARDING_FIELDS.filter(
  (f) => f.categoryId === 'cat_company'
);

export interface FormSchemaState {
  schemaVersion?: number;
  companyFields: OnboardingFieldConfig[];
  onboardingFields: OnboardingFieldConfig[];
  categoriesConfig?: FormCategoryConfig[];
  segmentsConfig: Record<string, SegmentConfig>;
  servicesConfig: Record<string, ManagedServiceConfig>;
  settings: {
    googleScriptUrl: string;
    transferNowUrl: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
  };
}

export const INITIAL_SCHEMA: FormSchemaState = {
  schemaVersion: 2,
  companyFields: DEFAULT_COMPANY_FIELDS,
  onboardingFields: DEFAULT_ONBOARDING_FIELDS,
  categoriesConfig: DEFAULT_CATEGORIES_CONFIG,
  segmentsConfig: SEGMENTS_CONFIG,
  servicesConfig: DEFAULT_SERVICES_CONFIG,
  settings: {
    googleScriptUrl:
      'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec',
    transferNowUrl: 'https://www.transfernow.net',
    supabaseUrl: '',
    supabaseAnonKey: '',
  },
};

/**
 * Evaluates a ConditionalRule against a data object (OnboardingData + respostasPersonalizadas).
 */
export function evaluateCondition(
  rule: ConditionalRule | undefined,
  data: Record<string, any>
): boolean {
  if (!rule || !rule.dependsOn) return true;
  const rawVal =
    data[rule.dependsOn] !== undefined
      ? data[rule.dependsOn]
      : data.respostasPersonalizadas?.[rule.dependsOn];
  const targetVal = rule.value ?? '';

  switch (rule.operator) {
    case 'not_empty':
      if (Array.isArray(rawVal)) return rawVal.length > 0;
      return rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '';
    case 'equals':
      if (Array.isArray(rawVal)) return rawVal.includes(targetVal);
      return String(rawVal ?? '') === targetVal;
    case 'not_equals':
      if (Array.isArray(rawVal)) return !rawVal.includes(targetVal);
      return String(rawVal ?? '') !== targetVal;
    case 'includes':
      if (Array.isArray(rawVal)) {
        return rawVal.some((item) =>
          String(item).toLowerCase().includes(targetVal.toLowerCase())
        );
      }
      return String(rawVal ?? '').toLowerCase().includes(targetVal.toLowerCase());
    default:
      return true;
  }
}

/**
 * Safely upgrades any v1 schema loaded from localStorage/Firestore/server into v2
 * without losing user-created questions, segments, or settings.
 */
export function migrateSchema(incoming: Partial<FormSchemaState> | null | undefined): FormSchemaState {
  if (!incoming) return INITIAL_SCHEMA;

  const isAlreadyV2 = Number(incoming.schemaVersion || 1) >= 2;

  // Categories config
  const categoriesConfig =
    Array.isArray(incoming.categoriesConfig) && incoming.categoriesConfig.length > 0
      ? incoming.categoriesConfig
      : DEFAULT_CATEGORIES_CONFIG;

  // Merge onboardingFields: if migrating from v1, enrich existing fields with pageId/categoryId and append missing new fields
  const defaultMap = new Map(DEFAULT_ONBOARDING_FIELDS.map((f) => [f.id, f]));
  const incomingFields = Array.isArray(incoming.onboardingFields) ? incoming.onboardingFields : [];

  let mergedFields: OnboardingFieldConfig[];
  if (incomingFields.length === 0) {
    mergedFields = DEFAULT_ONBOARDING_FIELDS;
  } else if (isAlreadyV2) {
    mergedFields = incomingFields.map((f) => {
      const def = defaultMap.get(f.id);
      return {
        ...def,
        ...f,
        pageId: f.pageId || def?.pageId || 'general_company',
        categoryId: f.categoryId || def?.categoryId || 'cat_company',
      };
    });
  } else {
    // v1 -> v2 upgrade: preserve user's custom fields & labels, apply v2 grouping and newly introduced fields
    const disabledInV2 = new Set(['razaoSocial', 'cnpj', 'dataAbertura']);
    const existingIds = new Set<string>();
    mergedFields = incomingFields.map((f) => {
      existingIds.add(f.id);
      const def = defaultMap.get(f.id);
      return {
        ...def,
        ...f,
        enabled: disabledInV2.has(f.id) ? false : f.enabled,
        required: disabledInV2.has(f.id) ? false : f.required,
        pageId: def?.pageId || (['structure', 'manager', 'materials', 'final_notes'].includes(f.stepId) ? 'general_structure' : 'general_company'),
        categoryId: def?.categoryId || (
          f.stepId === 'address' ? 'cat_address' :
          f.stepId === 'hours' ? 'cat_hours' :
          f.stepId === 'structure' ? 'cat_structure' :
          f.stepId === 'manager' ? 'cat_manager' :
          f.stepId === 'materials' ? 'cat_materials' :
          f.stepId === 'final_notes' ? 'cat_final_notes' : 'cat_company'
        ),
        conditional: f.conditional ?? def?.conditional,
      };
    });
    DEFAULT_ONBOARDING_FIELDS.forEach((def) => {
      if (!existingIds.has(def.id)) {
        mergedFields.push(def);
      }
    });
  }

  // Merge servicesConfig: preserve all services and user-added questions
  const mergedServices: Record<string, ManagedServiceConfig> = { ...DEFAULT_SERVICES_CONFIG };
  const activeV2Defaults = new Set(['google', 'site', 'minisite']);
  if (incoming.servicesConfig && typeof incoming.servicesConfig === 'object') {
    Object.entries(incoming.servicesConfig).forEach(([id, svc]) => {
      const def = DEFAULT_SERVICES_CONFIG[id];
      if (!svc) return;
      mergedServices[id] = {
        ...def,
        ...svc,
        // On v1 -> v2 upgrade, align active services to the 3 core services unless already v2
        enabled: isAlreadyV2 ? svc.enabled : activeV2Defaults.has(id),
        questions:
          !isAlreadyV2 && activeV2Defaults.has(id) && def?.questions
            ? def.questions
            : Array.isArray(svc.questions) && svc.questions.length > 0
            ? svc.questions
            : def?.questions || [],
      };
    });
  }

  return {
    schemaVersion: 2,
    companyFields: mergedFields.filter((f) => f.categoryId === 'cat_company'),
    onboardingFields: mergedFields,
    categoriesConfig,
    segmentsConfig: incoming.segmentsConfig && Object.keys(incoming.segmentsConfig).length > 0
      ? incoming.segmentsConfig
      : SEGMENTS_CONFIG,
    servicesConfig: mergedServices,
    settings: {
      ...INITIAL_SCHEMA.settings,
      ...(incoming.settings || {}),
    },
  };
}
