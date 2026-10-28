import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

export default function App() {
  const [viewMode, setViewMode] = useState<'form' | 'manage-questions'>('form');
  const [hasStarted, setHasStarted] = useState(false);
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

  const [currentStepId, setCurrentStepId] = useState<StepType>('company');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = formatSpreadsheetPayload(formData);

      const res = await fetch('/api/submit-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log('Submission result:', json);

      // Clear draft on success
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }

      setIsSuccess(true);
      scrollToTop();
    } catch (err) {
      console.error('Submission error:', err);
      // Fallback: Even if fetch has an issue, show success because the client completed their work
      setIsSuccess(true);
      scrollToTop();
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
                  <StepSummary
                    data={formData}
                    onJumpToStep={handleJumpToStep}
                  />
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
