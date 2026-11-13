import { StepDefinition, StepType, ServiceId, ManagedServiceConfig } from '../types';

export function normalizeStepId(stepId: string | null | undefined): StepType {
  if (!stepId) return 'general_company';
  if (
    stepId === 'company' ||
    stepId === 'address' ||
    stepId === 'hours' ||
    stepId === 'segment_details'
  ) {
    return 'general_company';
  }
  if (
    stepId === 'structure' ||
    stepId === 'manager' ||
    stepId === 'materials' ||
    stepId === 'final_notes'
  ) {
    return 'general_structure';
  }
  return stepId as StepType;
}

const ORDERED_SERVICE_MODULES: {
  id: ServiceId;
  stepId: StepType;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCategory: string;
}[] = [
  {
    id: 'google',
    stepId: 'module_google',
    defaultTitle: 'Perfil da Empresa no Google',
    defaultSubtitle:
      'Informações específicas para criar ou otimizar sua presença no Google e Google Maps',
    defaultCategory: 'Perfil no Google',
  },
  {
    id: 'site',
    stepId: 'module_site',
    defaultTitle: 'Site Institucional',
    defaultSubtitle:
      'História, serviços, produtos, diferenciais e estrutura do seu site institucional',
    defaultCategory: 'Site Institucional',
  },
  {
    id: 'minisite',
    stepId: 'module_minisite',
    defaultTitle: 'Mini Site',
    defaultSubtitle:
      'Links prioritários, destaques, identidade visual e recursos do seu mini site',
    defaultCategory: 'Mini Site',
  },
  {
    id: 'ecommerce',
    stepId: 'module_ecommerce',
    defaultTitle: 'Loja Virtual / E-commerce',
    defaultSubtitle: 'Catálogo de produtos, pagamentos, entrega e operação da loja',
    defaultCategory: 'E-commerce',
  },
  {
    id: 'trafego',
    stepId: 'module_trafego',
    defaultTitle: 'Tráfego Pago',
    defaultSubtitle: 'Objetivos, público-alvo, regiões e canais de anúncio',
    defaultCategory: 'Tráfego Pago',
  },
  {
    id: 'identidade',
    stepId: 'module_identidade',
    defaultTitle: 'Identidade Visual',
    defaultSubtitle: 'Estilo visual, preferências de cores e posicionamento de marca',
    defaultCategory: 'Identidade Visual',
  },
  {
    id: 'seo',
    stepId: 'module_seo',
    defaultTitle: 'SEO Local',
    defaultSubtitle: 'Termos de busca prioritários, regiões e concorrentes',
    defaultCategory: 'SEO Local',
  },
  {
    id: 'automacoes',
    stepId: 'module_automacoes',
    defaultTitle: 'Sistemas e Automações',
    defaultSubtitle: 'Processos a automatizar, sistemas integrados e regras de negócio',
    defaultCategory: 'Automações',
  },
  {
    id: 'whatsapp',
    stepId: 'module_whatsapp',
    defaultTitle: 'WhatsApp Business',
    defaultSubtitle: 'Configurações de atendimento, perfil comercial e catálogo',
    defaultCategory: 'WhatsApp Business',
  },
  {
    id: 'email',
    stepId: 'module_email',
    defaultTitle: 'E-mail Profissional',
    defaultSubtitle: 'Domínio corporativo e contas de e-mail da equipe',
    defaultCategory: 'E-mail Corporativo',
  },
  {
    id: 'assinatura_email',
    stepId: 'module_assinatura_email',
    defaultTitle: 'Assinatura de E-mail Profissional',
    defaultSubtitle: 'Assinaturas padronizadas e profissionais para colaboradores',
    defaultCategory: 'Assinatura de E-mail',
  },
  {
    id: 'registro_marca',
    stepId: 'module_registro_marca',
    defaultTitle: 'Registro de Marca',
    defaultSubtitle: 'Proteção jurídica e exame formal perante o INPI',
    defaultCategory: 'Registro de Marca',
  },
  {
    id: 'registro_dominio',
    stepId: 'module_registro_dominio',
    defaultTitle: 'Registro de Domínio',
    defaultSubtitle: 'Verificação, registro e titularidade do seu domínio na internet',
    defaultCategory: 'Registro de Domínio',
  },
  {
    id: 'plaquinha',
    stepId: 'module_plaquinha',
    defaultTitle: 'Plaquinha Inteligente QR Code / NFC',
    defaultSubtitle: 'Configurações de direcionamento e posições da sua plaquinha física',
    defaultCategory: 'Plaquinha Inteligente',
  },
  {
    id: 'catalogo',
    stepId: 'module_catalogo',
    defaultTitle: 'Catálogo de Produtos e Serviços',
    defaultSubtitle: 'Estruturação do catálogo digital com fotos, categorias e valores',
    defaultCategory: 'Catálogo Digital',
  },
];

export function getActiveSteps(
  selectedServices: ServiceId[],
  servicesConfig?: Record<string, ManagedServiceConfig>
): StepDefinition[] {
  const steps: StepDefinition[] = [
    {
      id: 'general_company',
      title: 'Dados da empresa',
      subtitle: 'Empresa, segmento, endereço comercial e horários de funcionamento',
      categoryName: 'Dados da empresa',
    },
    {
      id: 'services',
      title: 'Quais serviços você contratou com a Localway?',
      subtitle: 'Selecione os serviços incluídos no seu projeto com a Localway',
      categoryName: 'Serviços contratados',
    },
  ];

  // Sequential modules strictly for selected and enabled services
  ORDERED_SERVICE_MODULES.forEach((mod) => {
    if (!selectedServices.includes(mod.id)) return;
    const cfg = servicesConfig?.[mod.id];
    if (cfg && cfg.enabled === false) return;

    steps.push({
      id: mod.stepId,
      title: cfg?.title || mod.defaultTitle,
      subtitle: cfg?.tagline || mod.defaultSubtitle,
      categoryName: cfg?.shortTitle || mod.defaultCategory,
    });
  });

  // Final structure, shared catalog and materials step AFTER individual service modules
  steps.push({
    id: 'general_structure',
    title: 'Estrutura, catálogo e materiais',
    subtitle: 'Estrutura, formas de pagamento, responsável, produtos/serviços e materiais',
    categoryName: 'Estrutura, catálogo e materiais',
  });

  // Summary
  steps.push({
    id: 'summary',
    title: 'Resumo final',
    subtitle: 'Revise todas as respostas antes de enviar para a equipe Localway',
    categoryName: 'Resumo final',
  });

  return steps;
}
