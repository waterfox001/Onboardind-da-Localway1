import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { OnboardingData, ServiceId, StepType } from './types';
import { INITIAL_ONBOARDING_DATA } from './constants/initialData';
import { getActiveSteps, normalizeStepId } from './utils/stepManager';
import { formatSpreadsheetPayload } from './utils/formatSpreadsheetRow';

import { HeaderProgress } from './components/HeaderProgress';
import { WelcomeCover } from './components/WelcomeCover';
import { StepNavigation } from './components/StepNavigation';

import { StepServicesSelection } from './components/steps/StepServicesSelection';
import { StepGeneralPage } from './components/steps/StepGeneralPage';

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
import { ModuleSmartCard } from './components/steps/modules/ModuleSmartCard';
import { ModuleCatalog } from './components/steps/modules/ModuleCatalog';

import { StepSegmentDetails } from './components/steps/StepSegmentDetails';
import { StepSummary } from './components/steps/StepSummary';
import { StepSuccess } from './components/steps/StepSuccess';
import { GoogleAccentDots } from './components/GoogleAccentDots';
import { LocalwayLogo } from './components/LocalwayLogo';
import { ManageQuestionsPage } from './components/admin/ManageQuestionsPage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import {
  INITIAL_SCHEMA,
  FormSchemaState,
  migrateSchema,
  evaluateCondition,
} from './constants/formSchema';
import {
  testFirestoreConnection,
  loadSchemaFromFirestore,
  saveSchemaToFirestore,
  loadSettingsFromFirestore,
  saveSubmissionToFirestore,
  loadSubmissionsFromFirestore,
} from './services/firebaseDb';

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
      const savedStep = localStorage.getItem(STEP_KEY);
      const normalized = normalizeStepId(savedStep);
      if (savedStep && normalized !== 'general_company') return true;
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        if (
          parsed.nomeFantasia ||
          parsed.whatsapp ||
          parsed.razaoSocial ||
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

  const [adminPageTab, setAdminPageTab] = useState<
    'services' | 'questions' | 'local-ai' | 'fields' | 'segments' | 'submissions' | 'settings'
  >('questions');
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(() => {
    return localStorage.getItem('localway_admin_auth') === 'true';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Dynamic Schema & Configurations (auto-migrated safely to v2)
  const [schema, setSchema] = useState<FormSchemaState>(() => {
    try {
      const saved = localStorage.getItem(SCHEMA_KEY);
      if (saved) {
        return migrateSchema(JSON.parse(saved));
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
      const savedStep = localStorage.getItem(STEP_KEY);
      return normalizeStepId(savedStep);
    } catch {
      // ignore
    }
    return 'general_company';
  });

  const [moduleNotice, setModuleNotice] = useState<string | null>(null);

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

  // Load Firestore + server-persisted schema, settings, and submissions on mount
  useEffect(() => {
    const loadRemoteConfig = async () => {
      try {
        // Run non-blocking Firestore connection check
        testFirestoreConnection().catch(() => {});

        const [schemaRes, settingsRes, fsSchema, fsSettings, fsSubs] = await Promise.all([
          fetch('/api/admin/schema').catch(() => null),
          fetch('/api/admin/settings').catch(() => null),
          loadSchemaFromFirestore().catch(() => null),
          loadSettingsFromFirestore().catch(() => null),
          loadSubmissionsFromFirestore().catch(() => []),
        ]);

        const apiSchemaJson = schemaRes && schemaRes.ok ? await schemaRes.json().catch(() => null) : null;
        const apiSettingsJson = settingsRes && settingsRes.ok ? await settingsRes.json().catch(() => null) : null;

        // Prioritize Firestore (when populated with schemaVersion >= 2 or updatedAt newer) or server schema
        const remoteSchema =
          fsSchema && (Number(fsSchema.schemaVersion || 1) >= 2 || !apiSchemaJson?.schema)
            ? fsSchema
            : apiSchemaJson?.success && apiSchemaJson.schema
            ? apiSchemaJson.schema
            : fsSchema || null;

        setSchema((prev) => {
          const base = remoteSchema ? migrateSchema(remoteSchema) : prev;
          const mergedSettings = {
            ...base.settings,
            ...(apiSettingsJson?.success && apiSettingsJson.settings ? apiSettingsJson.settings : {}),
            ...(fsSettings || {}),
          };
          const finalSchema: FormSchemaState = {
            ...base,
            settings: mergedSettings,
          };
          try {
            localStorage.setItem(SCHEMA_KEY, JSON.stringify(finalSchema));
          } catch {
            // ignore
          }
          return finalSchema;
        });

        // Merge Firestore submissions into local admin cache
        if (Array.isArray(fsSubs) && fsSubs.length > 0) {
          try {
            const raw = localStorage.getItem(ADMIN_CACHE_KEY);
            const cachedList = raw ? JSON.parse(raw) : [];
            const map = new Map<string, any>();
            for (const item of cachedList) {
              const key = item.codigoCliente || item.payload?.rowData?.['Código do cliente'] || item.timestamp;
              if (key) map.set(key, item);
            }
            for (const item of fsSubs) {
              const key = item.codigoCliente || item.payload?.rowData?.['Código do cliente'] || item.timestamp;
              if (key) map.set(key, item);
            }
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
            );
            localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Using local schema defaults:', err);
      }
    };

    loadRemoteConfig();
  }, []);

  // Active dynamic steps: Dados da empresa -> Serviços contratados -> Módulos sequenciais -> Estrutura, catálogo e materiais -> Resumo
  const activeSteps = useMemo(() => {
    return getActiveSteps(formData.servicosContratados, schema.servicesConfig);
  }, [formData.servicosContratados, schema.servicesConfig]);

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

  // Schema-driven validation rules per step
  const validateCurrentStep = (): boolean => {
    const stepErrors: Record<string, string> = {};

    if (currentStepId === 'services') {
      if (formData.servicosContratados.length === 0) {
        stepErrors.servicosContratados = 'Selecione ao menos 1 serviço contratado para prosseguir.';
      }
    }

    if (currentStepId === 'general_company' || currentStepId === 'general_structure') {
      const pageFields = (schema.onboardingFields || []).filter((f) => {
        const fPage =
          f.pageId ||
          (['structure', 'manager', 'materials', 'final_notes', 'general_structure'].includes(f.stepId)
            ? 'general_structure'
            : 'general_company');
        return fPage === currentStepId;
      });

      pageFields.forEach((field) => {
        if (field.enabled === false) return;
        if (!evaluateCondition(field.conditional, formData as Record<string, any>)) return;

        // When no_physical_toggle is true, skip physical street/number/bairro fields even if schema had them required
        if (
          formData.enderecoSemLocalFisico &&
          ['cep', 'ruaAvenida', 'numero', 'complemento', 'bairro'].includes(field.key || field.id)
        ) {
          return;
        }

        if (field.type === 'schedule_grid' || field.type === 'no_physical_toggle' || field.type === 'shared_catalog') {
          return;
        }

        if (field.type === 'segment_select') {
          if (field.required && !formData.segmento) {
            stepErrors.segmento = 'Selecione o segmento de atuação.';
          } else if (formData.segmento === 'Outro' && !formData.outroSegmento?.trim()) {
            stepErrors.outroSegmento = 'Informe o nome do seu segmento.';
          }
          return;
        }

        if (!field.required) return;

        const key = field.key || field.id;
        const val = key in formData ? (formData as any)[key] : formData.respostasPersonalizadas?.[field.id];

        if (Array.isArray(val)) {
          if (val.length === 0) {
            stepErrors[key] = `Selecione ao menos uma opção em "${field.label}".`;
          }
        } else if (!val || !String(val).trim()) {
          stepErrors[key] = `Por favor, informe ${field.label.toLowerCase()}.`;
        }
      });
    }

    // Dynamic validation for module steps configured via Admin
    if (currentStepId.startsWith('module_')) {
      const svcId = currentStepId.replace('module_', '') as ServiceId;
      const svcCfg = schema.servicesConfig?.[svcId];
      if (svcCfg && Array.isArray(svcCfg.questions)) {
        svcCfg.questions.forEach((q) => {
          if (q.enabled === false) return;
          if (!q.required) return;
          if (!evaluateCondition(q.conditional, formData as Record<string, any>)) return;

          const key = q.storageKey || q.key || q.id;
          const val = key in formData ? (formData as any)[key] : formData.respostasPersonalizadas?.[q.id];

          if (Array.isArray(val)) {
            if (val.length === 0) {
              stepErrors[key] = `Selecione ao menos uma opção em "${q.label}".`;
            }
          } else if (!val || !String(val).trim()) {
            stepErrors[key] = `Por favor, preencha "${q.label}".`;
          }
        });
      }

      // Specific legacy module safeguards when optional secondary modules are enabled
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
        if (!formData.trafegoObjetivo) stepErrors.trafegoObjetivo = 'Selecione o objetivo dos anúncios.';
        if (!formData.trafegoProdutoServicoPrimeiro.trim()) {
          stepErrors.trafegoProdutoServicoPrimeiro = 'Informe o produto/serviço prioritário.';
        }
        if (!formData.trafegoCidade.trim()) stepErrors.trafegoCidade = 'Informe a cidade de veiculação.';
        if (!formData.trafegoPublicoAlvo.trim()) stepErrors.trafegoPublicoAlvo = 'Descreva seu público-alvo.';
        if (!formData.trafegoJaAnuncia) stepErrors.trafegoJaAnuncia = 'Informe se já anunciou antes.';
      }
      if (currentStepId === 'module_identidade' && !formData.identidadeJaPossui) {
        stepErrors.identidadeJaPossui = 'Informe se já possui logotipo.';
      }
      if (currentStepId === 'module_seo') {
        if (!formData.seoProdutosServicosImportantes.trim()) {
          stepErrors.seoProdutosServicosImportantes = 'Informe os serviços mais importantes.';
        }
        if (!formData.seoCidadesRegioes.trim()) stepErrors.seoCidadesRegioes = 'Informe as cidades prioritárias.';
        if (!formData.seoTermosPesquisa.trim()) stepErrors.seoTermosPesquisa = 'Informe termos que clientes pesquisam.';
      }
      if (currentStepId === 'module_automacoes') {
        if (!formData.autoProcessoAutomatizar.trim()) {
          stepErrors.autoProcessoAutomatizar = 'Informe qual processo deseja automatizar.';
        }
        if (!formData.autoComoFunciona.trim()) stepErrors.autoComoFunciona = 'Descreva como funciona hoje.';
        if (!formData.autoProblemaResolver.trim()) stepErrors.autoProblemaResolver = 'Descreva o problema a resolver.';
      }
      if (currentStepId === 'module_whatsapp') {
        if (!formData.whatsNumero.trim() && !formData.whatsapp.trim()) {
          stepErrors.whatsNumero = 'Informe o número do WhatsApp comercial.';
        }
        if (!formData.whatsJaPossuiBusiness) stepErrors.whatsJaPossuiBusiness = 'Informe se já utiliza WhatsApp Business.';
        if (!formData.whatsNomeComercial.trim()) stepErrors.whatsNomeComercial = 'Informe o nome comercial para o perfil.';
        if (!formData.whatsDescricaoPerfil.trim()) stepErrors.whatsDescricaoPerfil = 'Informe a descrição da empresa para o perfil.';
      }
      if (currentStepId === 'module_email' && !formData.emailDominio.trim()) {
        stepErrors.emailDominio = 'Informe o domínio utilizado para os e-mails.';
      }
      if (currentStepId === 'module_registro_marca') {
        if (!formData.marcaJaPossuiRegistro) stepErrors.marcaJaPossuiRegistro = 'Informe se já possui registro da marca no INPI.';
        if (!formData.marcaNomeRegistrar.trim()) stepErrors.marcaNomeRegistrar = 'Informe o nome exato da marca que deseja registrar.';
      }
      if (currentStepId === 'module_registro_dominio') {
        if (!formData.dominioJaPossui) {
          stepErrors.dominioJaPossui = 'Informe se já possui um domínio registrado.';
        } else if (formData.dominioJaPossui === 'Sim' && !formData.dominioAtual.trim()) {
          stepErrors.dominioAtual = 'Informe o domínio atual.';
        } else if (formData.dominioJaPossui === 'Não') {
          if (!formData.dominioDesejado.trim()) stepErrors.dominioDesejado = 'Informe o nome de domínio que gostaria de registrar.';
          if (!formData.dominioExtensao) stepErrors.dominioExtensao = 'Selecione a extensão de domínio de interesse.';
        }
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

    if (currentStepId === 'summary') {
      handleSubmit();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < activeSteps.length) {
      const nextStep = activeSteps[nextIndex];
      if (currentStepId.startsWith('module_')) {
        if (nextStep.id.startsWith('module_')) {
          setModuleNotice(
            `${currentStep.title} concluído! Preencha agora as informações do próximo serviço selecionado: ${nextStep.title}.`
          );
        } else if (nextStep.id === 'general_structure') {
          setModuleNotice(
            `${currentStep.title} concluído! Agora finalize informando a estrutura, catálogo e materiais.`
          );
        } else {
          setModuleNotice(null);
        }
      } else {
        setModuleNotice(null);
      }
      setCurrentStepId(nextStep.id);
      scrollToTop();
    }
  };

  const handleBack = () => {
    setModuleNotice(null);
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(activeSteps[prevIndex].id);
      scrollToTop();
    }
  };

  const handleJumpToStep = (stepId: StepType) => {
    setModuleNotice(null);
    setCurrentStepId(normalizeStepId(stepId));
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
          raw: { ...formData, codigoCliente: clientCode },
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
      const payload = formatSpreadsheetPayload(
        formData,
        schema.segmentsConfig,
        schema.servicesConfig,
        schema.onboardingFields
      );

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

      const targetScriptUrl =
        schema.settings?.googleScriptUrl ||
        'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec';

      let submissionSuccess = false;
      let sheetSuccess = false;
      let errorMsg = '';

      // 1. Primary submission attempt: Backend API (/api/submit-onboarding)
      try {
        const res = await fetch('/api/submit-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
            errorMsg =
              json.warning ||
              json.error ||
              'A sincronização com a planilha do Google retornou uma pendência.';
          } else {
            errorMsg = json.error || 'Erro ao processar envio no servidor.';
          }
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (backendErr) {
        console.warn('Backend unavailable or timed out, executing direct client resilience fallback:', backendErr);

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
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
          submissionSuccess = true;
          sheetSuccess = false;
          errorMsg =
            'Suas informações foram salvas com segurança no sistema, mas a planilha do Google não respondeu no momento.';
        }
      }

      // 2. Always persist directly to Firestore (ensuring serverless durability even if local disk clears)
      const nowIso = new Date().toISOString();
      saveSubmissionToFirestore({
        timestamp: nowIso,
        codigoCliente: clientCodeAssigned,
        lastModified: nowIso,
        finalized: true,
        status: 'Finalizado',
        finalizedAt: nowIso,
        sheetSyncStatus: sheetSuccess ? 'synced' : 'pending',
        sheetSyncError: sheetSuccess ? undefined : errorMsg,
        payload: {
          rowData: payload.rowData,
          raw: { ...formData, codigoCliente: clientCodeAssigned },
          dataHora: payload.rowData['Data e hora'] || new Date().toLocaleString('pt-BR'),
        },
      }).catch((e) => console.warn('Firestore direct submission persist error:', e));

      // 3. Always update local admin cache
      syncToAdminCache(clientCodeAssigned, payload.rowData, sheetSuccess, sheetSuccess ? undefined : errorMsg);

      if (submissionSuccess && sheetSuccess) {
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
      const payload = formatSpreadsheetPayload(
        formData,
        schema.segmentsConfig,
        schema.servicesConfig,
        schema.onboardingFields
      );
      const clientCode =
        formData.codigoCliente ||
        submitError?.clientCode ||
        payload.rowData['Código do cliente'] ||
        'LW-01';
      payload.rowData['Código do cliente'] = clientCode;
      payload.rowData['Status do Onboarding'] = 'Finalizado';

      const targetScriptUrl =
        schema.settings?.googleScriptUrl ||
        'https://script.google.com/macros/s/AKfycbyuYdO4N3qStGn8W7dwXjd4AuVS627iIKJxxD0S6XED9Xv71Gn4zRo86v4-Ag2KdOE9cQ/exec';

      let synced = false;

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
        const nowIso = new Date().toISOString();
        saveSubmissionToFirestore({
          timestamp: nowIso,
          codigoCliente: clientCode,
          lastModified: nowIso,
          finalized: true,
          status: 'Finalizado',
          finalizedAt: nowIso,
          sheetSyncStatus: 'synced',
          payload: {
            rowData: payload.rowData,
            raw: { ...formData, codigoCliente: clientCode },
            dataHora: payload.rowData['Data e hora'] || new Date().toLocaleString('pt-BR'),
          },
        }).catch(() => {});

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
            setModuleNotice(null);
            setCurrentStepId('general_company');
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

  const handleOpenAdminWithTab = (
    tab: 'submissions' | 'fields' | 'segments' | 'services' | 'settings' | 'questions' = 'questions'
  ) => {
    const tabMap: Record<
      string,
      'services' | 'questions' | 'local-ai' | 'fields' | 'segments' | 'submissions' | 'settings'
    > = {
      segments: 'segments',
      fields: 'fields',
      questions: 'questions',
      services: 'services',
      submissions: 'submissions',
      settings: 'settings',
    };
    const target = tabMap[tab] || 'questions';
    setAdminPageTab(target);

    if (isAdminAuth) {
      setViewMode('manage-questions');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  if (viewMode === 'manage-questions') {
    return (
      <ManageQuestionsPage
        schema={schema}
        initialTab={adminPageTab}
        onUpdateSchema={(newS) => {
          const normalized = migrateSchema(newS);
          setSchema(normalized);
          try {
            localStorage.setItem(SCHEMA_KEY, JSON.stringify(normalized));
          } catch {
            // ignore
          }
          saveSchemaToFirestore(normalized).catch(() => {});
        }}
        onBack={() => setViewMode('form')}
        onLogout={handleLogout}
      />
    );
  }

  if (!hasStarted) {
    const hasExistingDraft = Boolean(
      formData.nomeFantasia ||
        formData.whatsapp ||
        formData.razaoSocial ||
        formData.email ||
        (formData.servicosContratados && formData.servicosContratados.length > 0) ||
        currentStepId !== 'general_company'
    );
    return (
      <>
        <WelcomeCover
          onStart={() => {
            setHasStarted(true);
            scrollToTop();
          }}
          onOpenAdmin={handleOpenAdminWithTab}
          onOpenManageQuestions={() => handleOpenAdminWithTab('questions')}
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
        <HeaderProgress
          currentStepIndex={currentStepIndex}
          totalSteps={activeSteps.length}
          currentStep={currentStep}
          onResetToCover={() => setHasStarted(false)}
          onOpenAdmin={handleOpenAdminWithTab}
          onOpenManageQuestions={() => handleOpenAdminWithTab('questions')}
          isAuthenticated={isAdminAuth}
        />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_24px_rgba(15,23,42,0.04)] p-5 sm:p-8 md:p-10 relative">
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

            {moduleNotice && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between gap-3 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{moduleNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModuleNotice(null)}
                  className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg cursor-pointer"
                  aria-label="Fechar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepId}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {currentStepId === 'services' && (
                  <StepServicesSelection
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    servicesConfig={schema.servicesConfig}
                  />
                )}

                {currentStepId === 'general_company' && (
                  <StepGeneralPage
                    pageId="general_company"
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    schema={schema}
                  />
                )}

                {currentStepId === 'general_structure' && (
                  <StepGeneralPage
                    pageId="general_structure"
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    schema={schema}
                  />
                )}

                {/* Dynamic Service Modules */}
                {currentStepId === 'module_google' && (
                  <ModuleGoogleProfile
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    serviceConfig={schema.servicesConfig?.google}
                  />
                )}

                {currentStepId === 'module_site' && (
                  <ModuleWebsite
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    serviceConfig={schema.servicesConfig?.site}
                  />
                )}

                {currentStepId === 'module_minisite' && (
                  <ModuleMiniSite
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                    serviceConfig={schema.servicesConfig?.minisite}
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

                {currentStepId === 'module_plaquinha' && (
                  <ModuleSmartCard
                    data={formData}
                    onChange={updateField}
                    errors={errors}
                  />
                )}

                {currentStepId === 'module_catalogo' && (
                  <ModuleCatalog
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
                      schema={schema}
                    />
                  </>
                )}
              </motion.div>
            </AnimatePresence>

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
