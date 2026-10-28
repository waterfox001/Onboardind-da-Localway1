import { SEGMENTS_CONFIG, SegmentConfig } from './segments';

export interface CompanyFieldConfig {
  id: string;
  key: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'email' | 'segment_select';
  required: boolean;
  enabled: boolean;
  order: number;
  category: 'identificacao' | 'segmento' | 'descricao' | 'contato' | 'redes';
}

export const DEFAULT_COMPANY_FIELDS: CompanyFieldConfig[] = [
  {
    id: 'nomeFantasia',
    key: 'nomeFantasia',
    label: 'Nome Fantasia',
    placeholder: 'Ex: Pizzaria Bella Italia',
    type: 'text',
    required: true,
    enabled: true,
    order: 1,
    category: 'identificacao',
  },
  {
    id: 'razaoSocial',
    key: 'razaoSocial',
    label: 'Razão Social',
    placeholder: 'Ex: Bella Italia Alimentos LTDA',
    type: 'text',
    required: false,
    enabled: true,
    order: 2,
    category: 'identificacao',
  },
  {
    id: 'cnpj',
    key: 'cnpj',
    label: 'CNPJ',
    placeholder: '00.000.000/0000-00',
    type: 'text',
    required: false,
    enabled: true,
    order: 3,
    category: 'identificacao',
  },
  {
    id: 'dataAbertura',
    key: 'dataAbertura',
    label: 'Data de Abertura da Empresa',
    placeholder: 'Ex: 15/03/2018',
    type: 'text',
    required: false,
    enabled: true,
    order: 4,
    category: 'identificacao',
  },
  {
    id: 'segmento',
    key: 'segmento',
    label: 'Qual é o segmento da sua empresa?',
    type: 'segment_select',
    required: true,
    enabled: true,
    order: 5,
    category: 'segmento',
  },
  {
    id: 'descricaoEmpresa',
    key: 'descricaoEmpresa',
    label: 'Descrição da Empresa',
    placeholder: 'Conte brevemente sobre sua empresa, seus produtos ou serviços e diferenciais...',
    type: 'textarea',
    required: true,
    enabled: true,
    order: 6,
    category: 'descricao',
  },
  {
    id: 'whatsapp',
    key: 'whatsapp',
    label: 'WhatsApp Principal',
    placeholder: '(11) 90000-0000',
    type: 'text',
    required: true,
    enabled: true,
    order: 7,
    category: 'contato',
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
    category: 'contato',
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
    category: 'contato',
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
    category: 'redes',
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
    category: 'redes',
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
    category: 'redes',
  },
];

export interface FormSchemaState {
  companyFields: CompanyFieldConfig[];
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
  segmentsConfig: SEGMENTS_CONFIG,
  settings: {
    googleScriptUrl:
      'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec',
    transferNowUrl: 'https://www.transfernow.net',
    supabaseUrl: '',
    supabaseAnonKey: '',
  },
};
