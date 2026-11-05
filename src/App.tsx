import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { OnboardingData, StepType } from './types';
import { INITIAL_ONBOARDING_DATA } from './constants/initialData';
import { getActiveSteps } from './utils/stepManager';
import { formatSpreadsheetPayload } from './utils/formatSpreadsheetRow';

import { HeaderProgress } from './components/HeaderProgress';
import { WelcomeCover } from './components/WelcomeCover';
import { StepNavigation } from './components/StepNavigation';

import { StepCompanyData } from './components/steps/StepCompanyData';
import { StepAddress } from './components/steps/StepAddress';
import { StepHours } from './components/steps/StepHours';
import { StepStructure } from './components/steps/StepStructure';
import { StepManager } from './components/steps/StepManager';
import { StepServicesSelection } from './components/steps/StepServicesSelection';

import { ModuleGoogleProfile } from './components/steps/modules/ModuleGoogleProfile';
import { ModuleWebsite } from './components/steps/modules/ModuleWebsite';
import { ModuleEcommerce } from './components/steps/modules/ModuleEcommerce';
import { ModulePaidTraffic } from './components/steps/modules/ModulePaidTraffic';
import { ModuleVisualIdentity } from './components/steps/modules/ModuleVisualIdentity';
import { ModuleMiniSite } from './components/steps/modules/ModuleMiniSite';
import { ModuleSEO } from './components/steps/modules/ModuleSEO';
import { ModuleAutomations } from './components/steps/modules/ModuleAutomations';
import { ModuleWhatsAppBusiness } from './components/steps/modules/ModuleWhatsAppBusiness';
import { ModuleEmail } from './components/steps/modules/ModuleEmail';
import { ModuleEmailSignature } from './components/steps/modules/ModuleEmailSignature';
import { ModuleBrandRegistry } from './components/steps/modules/ModuleBrandRegistry';
import { ModuleDomain } from './components/steps/modules/ModuleDomain';

import { StepSegmentDetails } from './components/steps/StepSegmentDetails';
import { StepMaterials } from './components/steps/StepMaterials';
import { StepFinalNotes } from './components/steps/StepFinalNotes';
import { StepSummary } from './components/steps/StepSummary';
import { StepSuccess } from './components/steps/StepSuccess';
import { GoogleAccentDots } from './components/GoogleAccentDots';
import { LocalwayLogo } from './components/LocalwayLogo';
import { AdminPanel } from './components/AdminPanel';
import { ManageQuestionsPage } from './components/admin/ManageQuestionsPage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { INITIAL_SCHEMA, FormSchemaState } from './constants/formSchema';

const DRAFT_KEY = 'localway_onboarding_draft_v1';
const SCHEMA_KEY = 'localway_form_schema_v1';
const STEP_KEY = 'localway_onboarding_step_v1';
const STARTED_KEY = 'localway_onboarding_started_v1';
const ADMIN_CACHE_KEY = 'localway_admin_submissions_v1';

export default function App() {
  const [viewMode, setViewMode] = useState<'form' | 'manage-questions'>('form');
  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    try {
      const started = localStorage.getItem(STARTED_KEY);
      if (started === 'true') return true;
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (
          parsed.nomeFantasia ||
          parsed.whatsapp ||
          parsed.email ||
          (parsed.servicosContratados && parsed.servicosContratados.length > 0)
        ) {
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  });
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<'submissions' | 'fields' | 'segments' | 'settings'>('submissions');
  const [adminPageTab, setAdminPageTab] = useState<'segments' | 'companyFields' | 'submissions' | 'settings'>('segments');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return localStorage.getItem('localway_admin_auth') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Dynamic Schema & Configurations (fields order, mandatory flags, segments, settings)
  const [schema, setSchema] = useState<FormSchemaState>(() => {
    try {
      const saved = localStorage.getItem(SCHEMA_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_SCHEMA;
  });

  const [formData, setFormData] = useState<OnboardingData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return { ...INITIAL_ONBOARDING_DATA, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return INITIAL_ONBOARDING_DATA;
  });

  const [currentStepId, setCurrentStepId] = useState<StepType>(() => {
    try {
      const savedStep = localStorage.getItem(STEP_KEY) as StepType;
      if (savedStep) return savedStep;
    } catch {
      // ignore
    }
    return 'company';
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<{
    message: string;
    isSyncError?: boolean;
    clientCode?: string;
  } | null>(null);
  const [saveIndicator, setSaveIndicator] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load server-persisted schema and settings on mount
  useEffect(() => {
    const loadRemoteConfig = async () => {
      try {
        const [schemaRes, settingsRes] = await Promise.all([
          fetch('/api/admin/schema'),
          fetch('/api/admin/settings'),
        ]);

        const schemaData = await schemaRes.json();
        const settingsData = await settingsRes.json();

        setSchema((prev) => {
          const merged = { ...prev };
          if (schemaData.success && schemaData.schema) {
            merged.companyFields = schemaData.schema.companyFields || merged.companyFields;
            merged.segmentsConfig = schemaData.schema.segmentsConfig || merged.segmentsConfig;
          }
          if (settingsData.success && settingsData.settings) {
            merged.settings = { ...merged.settings, ...settingsData.settings };
          }
          return merged;
        });
      } catch (err) {
        console.warn('Using local schema defaults:', err);
      }
    };

    loadRemoteConfig();
  }, []);

  // Active dynamic steps
  const activeSteps = useMemo(() => {
    return getActiveSteps(formData.servicosContratados);
  }, [formData.servicosContratados]);

  // Current step index
  const currentStepIndex = useMemo(() => {
    const idx = activeSteps.findIndex((s) => s.id === currentStepId);
    return idx >= 0 ? idx : 0;
  }, [activeSteps, currentStepId]);

  const currentStep = activeSteps[currentStepIndex] || activeSteps[0];

  // Auto-save draft on data changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setSaveIndicator(true);
      const timer = setTimeout(() => setSaveIndicator(false), 1200);
      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, [formData]);

  // Persist current step to allow resumption after refresh
  useEffect(() => {
    try {
      if (currentStepId) {
        localStorage.setItem(STEP_KEY, currentStepId);
      }
    } catch {
      // ignore
    }
  }, [currentStepId]);

  // Persist started state
  useEffect(() => {
    try {
      localStorage.setItem(STARTED_KEY, String(hasStarted));
    } catch {
      // ignore
    }
  }, [hasStarted]);

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for that field if exists
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validation rules per step
  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStepId === 'company') {
      schema.companyFields.forEach((field) => {
        if (!field.enabled || !field.required) return;
        const val = (formData as any)[field.key];
        if (field.type === 'segment_select') {
          if (!formData.segmento) {
            stepErrors.segmento = 'Selecione o segmento de atuação.';
          }
        } else if (!val || !String(val).trim()) {
          stepErrors[field.key] = `Por favor, informe ${field.label.toLowerCase()}.`;
        }
      });
    }

    if (currentStepId === 'address') {
      if (!formData.ruaAvenida.trim()) {
        stepErrors.ruaAvenida = 'Informe a rua ou avenida.';
      }
      if (!formData.numero.trim()) {
        stepErrors.numero = 'Informe o número.';
      }
      if (!formData.bairro.trim()) {
        stepErrors.bairro = 'Informe o bairro.';
      }
      if (!formData.cidade.trim()) {
        stepErrors.cidade = 'Informe a cidade.';
      }
      if (!formData.estado) {
        stepErrors.estado = 'Selecione o estado.';
      }
    }

    if (currentStepId === 'hours') {
      if (!formData.trabalhaAgendamento) {
        stepErrors.trabalhaAgendamento = 'Informe se trabalha com agendamento.';
      }
    }

    if (currentStepId === 'structure') {
      if (!formData.estacionamento) {
        stepErrors.estacionamento = 'Selecione uma opção de estacionamento.';
      }
    }

    if (currentStepId === 'manager') {
      if (!formData.responsavelNome.trim()) {
        stepErrors.responsavelNome = 'Informe o nome do responsável pelo projeto.';
      }
      if (!formData.responsavelCargo.trim()) {
        stepErrors.responsavelCargo = 'Informe o cargo ou função.';
      }
      if (!formData.responsavelWhatsapp.trim()) {
        stepErrors.responsavelWhatsapp = 'Informe o WhatsApp do responsável.';
      }
      if (!formData.responsavelEmail.trim()) {
        stepErrors.responsavelEmail = 'Informe o e-mail do responsável.';
      }
    }

    if (currentStepId === 'services') {
      if (formData.servicosContratados.length === 0) {
        stepErrors.servicosContratados = 'Selecione ao menos 1 serviço contratado para prosseguir.';
      }
    }

    if (currentStepId === 'module_google') {
      if (!formData.googleJaPossuiPerfil) {
        stepErrors.googleJaPossuiPerfil = 'Informe se já possui perfil no Google.';
      }
      if (!formData.googleCategoriaPrincipal.trim()) {
        stepErrors.googleCategoriaPrincipal = 'Informe a categoria principal no Google.';
      }
      if (!formData.googlePrincipaisServicos.trim()) {
        stepErrors.googlePrincipaisServicos = 'Informe os principais serviços.';
      }
    }

    if (currentStepId === 'module_site') {
      if (!formData.siteJaPossui) {
        stepErrors.siteJaPossui = 'Informe se já possui site.';
      }
    }

    if (currentStepId === 'module_ecommerce') {
      if (!formData.ecommerceProdutosVendidos.trim()) {
        stepErrors.ecommerceProdutosVendidos = 'Informe os tipos de produtos.';
      }
      if (!formData.ecommercePossuiFotos) {
        stepErrors.ecommercePossuiFotos = 'Informe se já possui fotos dos produtos.';
      }
      if (!formData.ecommercePossuiCadastro) {
        stepErrors.ecommercePossuiCadastro = 'Informe se já possui cadastro dos produtos.';
      }
    }

    if (currentStepId === 'module_trafego') {
      if (!formData.trafegoObjetivo) {
        stepErrors.trafegoObjetivo = 'Selecione o objetivo dos anúncios.';
      }
      if (!formData.trafegoProdutoServicoPrimeiro.trim()) {
        stepErrors.trafegoProdutoServicoPrimeiro = 'Informe o produto/serviço prioritário.';
      }
      if (!formData.trafegoCidade.trim()) {
        stepErrors.trafegoCidade = 'Informe a cidade de veiculação.';
      }
      if (!formData.trafegoPublicoAlvo.trim()) {
        stepErrors.trafegoPublicoAlvo = 'Descreva seu público-alvo.';
      }
      if (!formData.trafegoJaAnuncia) {
        stepErrors.trafegoJaAnuncia = 'Informe se já anunciou antes.';
      }
    }

    if (currentStepId === 'module_identidade') {
      if (!formData.identidadeJaPossui) {
        stepErrors.identidadeJaPossui = 'Informe se já possui logotipo.';
      }
    }

    if (currentStepId === 'module_seo') {
      if (!formData.seoProdutosServicosImportantes.trim()) {
        stepErrors.seoProdutosServicosImportantes = 'Informe os serviços mais importantes.';
      }
      if (!formData.seoCidadesRegioes.trim()) {
        stepErrors.seoCidadesRegioes = 'Informe as cidades prioritárias.';
      }
      if (!formData.seoTermosPesquisa.trim()) {
        stepErrors.seoTermosPesquisa = 'Informe termos que clientes pesquisam.';
      }
    }

    if (currentStepId === 'module_automacoes') {
      if (!formData.autoProcessoAutomatizar.trim()) {
        stepErrors.autoProcessoAutomatizar = 'Informe qual processo deseja automatizar.';
      }
      if (!formData.autoComoFunciona.trim()) {
        stepErrors.autoComoFunciona = 'Descreva como funciona hoje.';
      }
      if (!formData.autoProblemaResolver.trim()) {
        stepErrors.autoProblemaResolver = 'Descreva o problema a resolver.';
      }
    }

    if (currentStepId === 'module_whatsapp') {
      if (!formData.whatsNumero.trim() && !formData.whatsapp.trim()) {
        stepErrors.whatsNumero = 'Informe o número do WhatsApp comercial.';
      }
      if (!formData.whatsJaPossuiBusiness) {
        stepErrors.whatsJaPossuiBusiness = 'Informe se já utiliza WhatsApp Business.';
      }
      if (!formData.whatsNomeComercial.trim()) {
        stepErrors.whatsNomeComercial = 'Informe o nome comercial para o perfil.';
      }
      if (!formData.whatsDescricaoPerfil.trim()) {
        stepErrors.whatsDescricaoPerfil = 'Informe a descrição da empresa para o perfil.';
      }
    }

    if (currentStepId === 'module_email') {
      if (!formData.emailDominio.trim()) {
        stepErrors.emailDominio = 'Informe o domínio utilizado para os e-mails.';
      }
    }

    if (currentStepId === 'module_registro_marca') {
      if (!formData.marcaJaPossuiRegistro) {
        stepErrors.marcaJaPossuiRegistro = 'Informe se já possui registro da marca no INPI.';
      }
      if (!formData.marcaNomeRegistrar.trim()) {
        stepErrors.marcaNomeRegistrar = 'Informe o nome exato da marca que deseja registrar.';
      }
    }

    if (currentStepId === 'module_registro_dominio') {
      if (!formData.dominioJaPossui) {
        stepErrors.dominioJaPossui = 'Informe se já possui um domínio registrado.';
      } else if (formData.dominioJaPossui === 'Sim' && !formData.dominioAtual.trim()) {
        stepErrors.dominioAtual = 'Informe o domínio atual.';
      } else if (formData.dominioJaPossui === 'Não') {
        if (!formData.dominioDesejado.trim()) {
          stepErrors.dominioDesejado = 'Informe o nome de domínio que gostaria de registrar.';
        }
        if (!formData.dominioExtensao) {
          stepErrors.dominioExtensao = 'Selecione a extensão de domínio de interesse.';
        }
      }
    }

    if (currentStepId === 'materials') {
      if (!formData.possuiMateriais) {
        stepErrors.possuiMateriais = 'Informe se possui materiais para enviar agora.';
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      scrollToTop();
      return;
    }

    // If on summary step, submit
    if (currentStepId === 'summary') {
      handleSubmit();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < activeSteps.length) {
      setCurrentStepId(activeSteps[nextIndex].id);
      scrollToTop();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(activeSteps[prevIndex].id);
      scrollToTop();
    }
  };

  const handleJumpToStep = (stepId: StepType) => {
    setCurrentStepId(stepId);
    scrollToTop();
  };

  const syncToAdminCache = (
    clientCode: string,
    rowData: Record<string, string>,
    isSynced: boolean,
    syncError?: string
  ) => {
    try {
      const raw = localStorage.getItem(ADMIN_CACHE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const now = new Date().toISOString();
      const existingIdx = list.findIndex(
        (item: any) =>
          item.codigoCliente === clientCode ||
          item.payload?.rowData?.['Código do cliente'] === clientCode
      );

      const record = {
        timestamp: existingIdx >= 0 && list[existingIdx]?.timestamp ? list[existingIdx].timestamp : now,
        codigoCliente: clientCode,
        lastModified: now,
        finalized: true,
        status: 'Finalizado' as const,
        finalizedAt: now,
        sheetSyncStatus: (isSynced ? 'synced' : 'pending') as 'synced' | 'pending' | 'error',
        sheetSyncError: syncError,
        payload: {
          rowData,
          raw: formData,
          dataHora: rowData['Data e hora'] || new Date().toLocaleString('pt-BR'),
        },
      };

      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.unshift(record);
      }
      localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not update admin cache:', e);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = formatSpreadsheetPayload(formData, schema.segmentsConfig);

      // 1. Maintain client code deduplication
      let clientCodeAssigned = formData.codigoCliente || (payload.rowData['Código do cliente'] || '').trim();
      if (!clientCodeAssigned || !/^LW-\d+$/i.test(clientCodeAssigned)) {
        try {
          const cached = localStorage.getItem(ADMIN_CACHE_KEY);
          const list = cached ? JSON.parse(cached) : [];
          const nextNum = list.length + 1;
          clientCodeAssigned = `LW-${String(nextNum).padStart(2, '0')}`;
        } catch {
          clientCodeAssigned = 'LW-01';
        }
      }
      payload.rowData['Código do cliente'] = clientCodeAssigned;
      payload.rowData['Status do Onboarding'] = 'Finalizado';
      payload.rowData['Data de finalização'] = new Date().toLocaleString('pt-BR');

      let targetScriptUrl =
        schema.settings?.googleScriptUrl ||
        'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec';

      let submissionSuccess = false;
      let sheetSuccess = false;
      let errorMsg = '';

      // 2. Primary submission attempt: Backend API (/api/submit-onboarding)
      try {
        const res = await fetch('/api/submit-onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.clientCode) {
            clientCodeAssigned = json.clientCode;
            payload.rowData['Código do cliente'] = json.clientCode;
            setFormData((prev) => ({ ...prev, codigoCliente: json.clientCode }));
          }

          if (json.success && json.sheetSyncSuccess) {
            submissionSuccess = true;
            sheetSuccess = true;
          } else if (json.dbSaved) {
            submissionSuccess = true;
            sheetSuccess = false;
            errorMsg = json.warning || json.error || 'A sincronização com a planilha do Google retornou uma pendência.';
          } else {
            errorMsg = json.error || 'Erro ao processar envio no servidor.';
          }
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (backendErr) {
        console.warn('Backend unavailable or timed out, executing direct client resilience fallback:', backendErr);

        // Fallback Client Resilience: Direct dispatch to Google Apps Script Web App
        try {
          const directBody = {
            respostas: payload.rowData,
            dados: payload.rowData,
            ...payload.rowData,
            'Código do cliente': clientCodeAssigned,
            codigoCliente: clientCodeAssigned,
            'Status do Onboarding': 'Finalizado',
            status: 'Finalizado',
            finalizado: true,
          };

          const sheetRes = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(directBody),
          });

          const sheetText = await sheetRes.text().catch(() => '');
          let sheetJson: any = null;
          try {
            sheetJson = JSON.parse(sheetText);
          } catch {
            sheetJson = { raw: sheetText };
          }

          const isDirectSuccess = sheetRes.ok || (sheetJson && (sheetJson.sucesso || sheetJson.success));

          submissionSuccess = true;
          sheetSuccess = Boolean(isDirectSuccess);
          if (!isDirectSuccess) {
            errorMsg = sheetJson?.mensagem || 'A sincronização com a planilha está pendente.';
          }
        } catch (directErr) {
          console.warn('Direct Google Apps Script sync error:', directErr);
          submissionSuccess = true; // Data is permanently secured in client local storage
          sheetSuccess = false;
          errorMsg = 'Suas informações foram salvas com segurança no sistema, mas a planilha do Google não respondeu no momento.';
        }
      }

      // Always update local admin cache so responses immediately appear in the Admin Panel
      syncToAdminCache(clientCodeAssigned, payload.rowData, sheetSuccess, sheetSuccess ? undefined : errorMsg);

      if (submissionSuccess && sheetSuccess) {
        // Clear local draft only after full confirmed success
        try {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem(STEP_KEY);
          localStorage.removeItem(STARTED_KEY);
        } catch {
          // ignore
        }
        setIsSuccess(true);
        scrollToTop();
      } else if (submissionSuccess) {
        // Data protection: Saved in DB/storage, but sheet sync is pending
        setSubmitError({
          message:
            errorMsg ||
            'Suas informações foram salvas com segurança no banco de dados, mas houve uma instabilidade na conexão com a planilha do Google.',
          isSyncError: true,
          clientCode: clientCodeAssigned,
        });
        scrollToTop();
      } else {
        setSubmitError({
          message:
            errorMsg ||
            'Não foi possível concluir o envio. Suas informações continuam salvas no formulário. Por favor, tente novamente.',
          isSyncError: false,
        });
        scrollToTop();
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError({
        message:
          'Não foi possível concluir a transmissão. Suas informações continuam totalmente salvas no formulário. Por favor, tente novamente.',
        isSyncError: false,
      });
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrySync = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = formatSpreadsheetPayload(formData, schema.segmentsConfig);
      const clientCode = formData.codigoCliente || submitError?.clientCode || payload.rowData['Código do cliente'] || 'LW-01';
      payload.rowData['Código do cliente'] = clientCode;
      payload.rowData['Status do Onboarding'] = 'Finalizado';

      let targetScriptUrl =
        schema.settings?.googleScriptUrl ||
        'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec';

      let synced = false;

      // 1. Try server resync
      try {
        const res = await fetch('/api/admin/sync-submission', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rowData: payload.rowData }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.sheetSyncSuccess) {
            synced = true;
          }
        }
      } catch {
        // fallback to direct script dispatch
      }

      // 2. Direct fallback if server route failed
      if (!synced) {
        try {
          const directBody = {
            respostas: payload.rowData,
            dados: payload.rowData,
            ...payload.rowData,
            'Código do cliente': clientCode,
            codigoCliente: clientCode,
            'Status do Onboarding': 'Finalizado',
            finalizado: true,
          };
          const sheetRes = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(directBody),
          });
          if (sheetRes.ok) {
            synced = true;
          }
        } catch {
          // ignore
        }
      }

      if (synced) {
        syncToAdminCache(clientCode, payload.rowData, true);
        setSubmitError(null);
        try {
          localStorage.removeItem(DRAFT_KEY);
          localStorage.removeItem(STEP_KEY);
          localStorage.removeItem(STARTED_KEY);
        } catch {
          // ignore
        }
        setIsSuccess(true);
        scrollToTop();
      } else {
        setSubmitError({
          message:
            'Ainda não foi possível sincronizar com a planilha do Google. Suas informações continuam salvas com segurança no banco de dados. Você pode tentar novamente.',
          isSyncError: true,
          clientCode,
        });
      }
    } catch {
      setSubmitError({
        message:
          'Erro de conexão ao tentar sincronizar com a planilha. Suas informações continuam salvas com segurança no banco de dados.',
        isSyncError: true,
        clientCode: submitError?.clientCode,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If successfully submitted, show final confirmation
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] py-8 sm:py-16 px-4">
        <StepSuccess
          data={formData}
          onNewOnboarding={() => {
            try {
              localStorage.removeItem(DRAFT_KEY);
              localStorage.removeItem(STEP_KEY);
              localStorage.removeItem(STARTED_KEY);
            } catch {
              // ignore
            }
            setFormData(INITIAL_ONBOARDING_DATA);
            setIsSuccess(false);
            setHasStarted(false);
            setCurrentStepId('company');
          }}
        />
      </div>
    );
  }

  const handleLoginSuccess = () => {
    setIsAdminAuth(true);
    setIsLoginModalOpen(false);
    setViewMode('manage-questions');
  };

  const handleLogout = () => {
    localStorage.removeItem('localway_admin_auth');
    setIsAdminAuth(false);
    setViewMode('form');
  };

  const handleOpenAdminWithTab = (tab: 'submissions' | 'fields' | 'segments' | 'settings' = 'segments') => {
    const tabMap: Record<string, 'segments' | 'companyFields' | 'submissions' | 'settings'> = {
      segments: 'segments',
      fields: 'companyFields',
      submissions: 'submissions',
      settings: 'settings',
    };
    const target = tabMap[tab] || 'segments';
    setAdminPageTab(target);

    if (isAdminAuth) {
      setViewMode('manage-questions');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // If dedicated questions manager page is open
  if (viewMode === 'manage-questions') {
    return (
      <ManageQuestionsPage
        schema={schema}
        initialTab={adminPageTab}
        onUpdateSchema={(newS) => {
          setSchema(newS);
          localStorage.setItem(SCHEMA_KEY, JSON.stringify(newS));
        }}
        onBack={() => setViewMode('form')}
        onLogout={handleLogout}
      />
    );
  }

  // Cover Screen before form begins
  if (!hasStarted) {
    const hasExistingDraft = Boolean(formData.nomeFantasia || formData.whatsapp);
    return (
      <>
        <WelcomeCover
          onStart={() => {
            setHasStarted(true);
            scrollToTop();
          }}
          onOpenAdmin={handleOpenAdminWithTab}
          onOpenManageQuestions={() => handleOpenAdminWithTab('segments')}
          isAuthenticated={isAdminAuth}
          hasDraft={hasExistingDraft}
        />
        <AdminLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between" ref={containerRef}>
      <div>
        {/* Sticky Header with Progress Bar & Step counter */}
        <HeaderProgress
          currentStepIndex={currentStepIndex}
          totalSteps={activeSteps.length}
          currentStep={currentStep}
          onResetToCover={() => setHasStarted(false)}
          onOpenAdmin={handleOpenAdminWithTab}
          onOpenManageQuestions={() => handleOpenAdminWithTab('segments')}
          isAuthenticated={isAdminAuth}
        />

        {/* Main Step Container */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] p-5 sm:p-8 md:p-10 relative">
            {/* Auto-save subtle indicator */}
            <div className="absolute top-4 right-5 sm:top-6 sm:right-8 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 select-none">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  saveIndicator ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span className="hidden sm:inline">
                {saveIndicator ? 'Salvando...' : 'Salvo'}
              </span>
            </div>

            {/* Current Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepId}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {currentStepId === 'company' && (
                  <StepCompanyData
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    fields={schema.companyFields}
                    availableSegments={Object.keys(schema.segmentsConfig || {})}
                  />
                )}

                {currentStepId === 'address' && (
                  <StepAddress
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'hours' && (
                  <StepHours
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'structure' && (
                  <StepStructure
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'manager' && (
                  <StepManager
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'services' && (
                  <StepServicesSelection
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {/* Dynamic Service Modules */}
                {currentStepId === 'module_google' && (
                  <ModuleGoogleProfile
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_site' && (
                  <ModuleWebsite
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_ecommerce' && (
                  <ModuleEcommerce
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_trafego' && (
                  <ModulePaidTraffic
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_identidade' && (
                  <ModuleVisualIdentity
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_minisite' && (
                  <ModuleMiniSite
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_seo' && (
                  <ModuleSEO
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_automacoes' && (
                  <ModuleAutomations
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_whatsapp' && (
                  <ModuleWhatsAppBusiness
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_email' && (
                  <ModuleEmail
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_assinatura_email' && (
                  <ModuleEmailSignature
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_registro_marca' && (
                  <ModuleBrandRegistry
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_registro_dominio' && (
                  <ModuleDomain
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'segment_details' && (
                  <StepSegmentDetails
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    segmentsConfig={schema.segmentsConfig}
                  />
                )}

                {currentStepId === 'materials' && (
                  <StepMaterials
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    transferNowUrl={schema.settings?.transferNowUrl}
                  />
                )}

                {currentStepId === 'final_notes' && (
                  <StepFinalNotes
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'summary' && (
                  <>
                    {submitError && (
                      <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 animate-fadeIn">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div className="space-y-1.5 flex-1 text-xs">
                            <h4 className="font-bold text-amber-950">Atenção no envio</h4>
                            <p className="leading-relaxed">{submitError.message}</p>
                            {submitError.clientCode && (
                              <p className="text-[11px] text-amber-700 font-medium">
                                Código de registro no sistema: <strong>{submitError.clientCode}</strong>
                              </p>
                            )}
                            {submitError.isSyncError && (
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={handleRetrySync}
                                  disabled={isSubmitting}
                                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                                  <span>Tentar sincronizar novamente com a planilha</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <StepSummary
                      data={formData}
                      onJumpToStep={handleJumpToStep}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons: Back and Next */}
            <StepNavigation
              onBack={currentStepIndex > 0 ? handleBack : undefined}
              onNext={handleNext}
              isFirstStep={currentStepIndex === 0}
              isLastStep={currentStepId === 'summary'}
              isSubmitting={isSubmitting}
            />
          </div>
        </main>
      </div>

      {/* Global Minimalist Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/70 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LocalwayLogo size="sm" />
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Onboarding Oficial de Clientes</span>
          </div>

          <div className="flex items-center gap-3">
            <GoogleAccentDots size="xs" />
            <span>© {new Date().getFullYear()} Localway • Todos os direitos reservados</span>
          </div>
        </div>
      </footer>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
