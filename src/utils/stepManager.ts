import { StepDefinition, StepType, ServiceId } from '../types';

export function normalizeStepId(stepId: string | null | undefined): StepType {
  if (!stepId) return 'services';
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

export function getActiveSteps(selectedServices: ServiceId[]): StepDefinition[] {
  const steps: StepDefinition[] = [
    {
      id: 'services',
      title: 'Serviços Contratados',
      subtitle: 'Selecione os serviços incluídos no seu projeto com a Localway',
      categoryName: '1. Serviços',
    },
    {
      id: 'general_company',
      title: 'Onboarding Geral — Página 1',
      subtitle: 'Dados da empresa, segmento, endereço comercial e horários de funcionamento',
      categoryName: '2. Dados da Empresa',
    },
    {
      id: 'general_structure',
      title: 'Onboarding Geral — Página 2',
      subtitle: 'Estrutura, formas de pagamento, responsável, produtos/serviços e materiais',
      categoryName: '3. Estrutura & Materiais',
    },
  ];

  // Dynamic modules based strictly on contracted services
  if (selectedServices.includes('google')) {
    steps.push({
      id: 'module_google',
      title: 'Perfil da Empresa no Google',
      subtitle: 'Informações específicas para criar ou otimizar sua presença no Google e Google Maps',
      categoryName: 'Perfil no Google',
    });
  }

  if (selectedServices.includes('site')) {
    steps.push({
      id: 'module_site',
      title: 'Site Institucional',
      subtitle: 'História, serviços, produtos, diferenciais e estrutura do seu site institucional',
      categoryName: 'Site Institucional',
    });
  }

  if (selectedServices.includes('minisite')) {
    steps.push({
      id: 'module_minisite',
      title: 'Mini Site',
      subtitle: 'Links prioritários, destaques, identidade visual e recursos do seu mini site',
      categoryName: 'Mini Site',
    });
  }

  if (selectedServices.includes('ecommerce')) {
    steps.push({
      id: 'module_ecommerce',
      title: 'Loja Virtual / E-commerce',
      subtitle: 'Catálogo de produtos, pagamentos, entrega e operação da loja',
      categoryName: 'E-commerce',
    });
  }

  if (selectedServices.includes('trafego')) {
    steps.push({
      id: 'module_trafego',
      title: 'Tráfego Pago',
      subtitle: 'Objetivos, público-alvo, regiões e canais de anúncio',
      categoryName: 'Tráfego Pago',
    });
  }

  if (selectedServices.includes('identidade')) {
    steps.push({
      id: 'module_identidade',
      title: 'Identidade Visual',
      subtitle: 'Estilo visual, preferências de cores e posicionamento de marca',
      categoryName: 'Identidade Visual',
    });
  }

  if (selectedServices.includes('seo')) {
    steps.push({
      id: 'module_seo',
      title: 'SEO Local',
      subtitle: 'Termos de busca prioritários, regiões e concorrentes',
      categoryName: 'SEO Local',
    });
  }

  if (selectedServices.includes('automacoes')) {
    steps.push({
      id: 'module_automacoes',
      title: 'Sistemas e Automações',
      subtitle: 'Processos a automatizar, sistemas integrados e regras de negócio',
      categoryName: 'Automações',
    });
  }

  if (selectedServices.includes('whatsapp')) {
    steps.push({
      id: 'module_whatsapp',
      title: 'WhatsApp Business',
      subtitle: 'Configurações de atendimento, perfil comercial e catálogo',
      categoryName: 'WhatsApp Business',
    });
  }

  if (selectedServices.includes('email')) {
    steps.push({
      id: 'module_email',
      title: 'E-mail Profissional',
      subtitle: 'Domínio corporativo e contas de e-mail da equipe',
      categoryName: 'E-mail Corporativo',
    });
  }

  if (selectedServices.includes('assinatura_email')) {
    steps.push({
      id: 'module_assinatura_email',
      title: 'Assinatura de E-mail Profissional',
      subtitle: 'Assinaturas padronizadas e profissionais para colaboradores',
      categoryName: 'Assinatura de E-mail',
    });
  }

  if (selectedServices.includes('registro_marca')) {
    steps.push({
      id: 'module_registro_marca',
      title: 'Registro de Marca',
      subtitle: 'Proteção jurídica e exame formal perante o INPI',
      categoryName: 'Registro de Marca',
    });
  }

  if (selectedServices.includes('registro_dominio')) {
    steps.push({
      id: 'module_registro_dominio',
      title: 'Registro de Domínio',
      subtitle: 'Verificação, registro e titularidade do seu domínio na internet',
      categoryName: 'Registro de Domínio',
    });
  }

  if (selectedServices.includes('plaquinha')) {
    steps.push({
      id: 'module_plaquinha',
      title: 'Plaquinha Inteligente QR Code / NFC',
      subtitle: 'Configurações de direcionamento e posições da sua plaquinha física',
      categoryName: 'Plaquinha Inteligente',
    });
  }

  if (selectedServices.includes('catalogo')) {
    steps.push({
      id: 'module_catalogo',
      title: 'Catálogo de Produtos e Serviços',
      subtitle: 'Estruturação do catálogo digital com fotos, categorias e valores',
      categoryName: 'Catálogo Digital',
    });
  }

  // Summary
  steps.push({
    id: 'summary',
    title: 'Confira suas Informações',
    subtitle: 'Revise todas as respostas antes de enviar para a equipe Localway',
    categoryName: 'Revisão Geral',
  });

  return steps;
}
