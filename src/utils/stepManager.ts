import { StepDefinition, StepType, ServiceId } from '../types';

export function getActiveSteps(selectedServices: ServiceId[]): StepDefinition[] {
  const steps: StepDefinition[] = [
    {
      id: 'company',
      title: 'Dados da Empresa',
      subtitle: 'Informações cadastrais e perfil do seu negócio',
      categoryName: '1. Empresa',
    },
    {
      id: 'segment_details',
      title: 'Detalhes do Segmento',
      subtitle: 'Perguntas e especificações da sua área de atuação',
      categoryName: '2. Segmento',
    },
    {
      id: 'address',
      title: 'Endereço Comercial',
      subtitle: 'Localização da sede ou ponto de atendimento',
      categoryName: '3. Localização',
    },
    {
      id: 'hours',
      title: 'Horário de Funcionamento',
      subtitle: 'Dias, horários de atendimento e agendamento',
      categoryName: '4. Horários',
    },
    {
      id: 'structure',
      title: 'Estrutura e Pagamento',
      subtitle: 'Estacionamento, idiomas e formas de pagamento aceitas',
      categoryName: '5. Estrutura',
    },
    {
      id: 'manager',
      title: 'Responsável pelo Projeto',
      subtitle: 'Quem acompanhará as etapas e aprovações com a Localway',
      categoryName: '6. Responsável',
    },
    {
      id: 'services',
      title: 'Serviços Contratados',
      subtitle: 'Selecione todos os serviços incluídos no seu contrato',
      categoryName: '7. Serviços',
    },
  ];

  // Dynamic modules based on contracted services
  if (selectedServices.includes('google')) {
    steps.push({
      id: 'module_google',
      title: 'Perfil da Empresa no Google',
      subtitle: 'Informações para otimizar ou criar sua presença no Google e Google Maps',
      categoryName: 'Google Meu Negócio',
    });
  }

  if (selectedServices.includes('site')) {
    steps.push({
      id: 'module_site',
      title: 'Site Profissional',
      subtitle: 'Objetivos, páginas, referências e estrutura do seu novo site',
      categoryName: 'Site Profissional',
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

  if (selectedServices.includes('minisite')) {
    steps.push({
      id: 'module_minisite',
      title: 'Mini Site',
      subtitle: 'Links prioritários, contatos e informações para acesso rápido',
      categoryName: 'Mini Site',
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

  // Materials
  steps.push({
    id: 'materials',
    title: 'Materiais do Projeto',
    subtitle: 'Envio de logotipo, fotos, vídeos, cardápios e arquivos',
    categoryName: 'Materiais',
  });

  // Final notes
  steps.push({
    id: 'final_notes',
    title: 'Observações Finais',
    subtitle: 'Mensagem adicional ou orientações especiais para nossa equipe',
    categoryName: 'Observações',
  });

  // Summary
  steps.push({
    id: 'summary',
    title: 'Confira suas Informações',
    subtitle: 'Revise todas as respostas antes de enviar para a equipe Localway',
    categoryName: 'Revisão Geral',
  });

  return steps;
}
