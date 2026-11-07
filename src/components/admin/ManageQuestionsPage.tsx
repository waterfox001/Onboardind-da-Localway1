import React, { useState } from 'react';
import { FormSchemaState, CompanyFieldConfig } from '../../constants/formSchema';
import { SegmentQuestion, SegmentConfig } from '../../constants/segments';
import { LocalwayLogo } from '../LocalwayLogo';
import { GoogleAccentDots } from '../GoogleAccentDots';
import {
  ArrowLeft,
  Save,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Database,
  Sliders,
  AlertCircle,
  HelpCircle,
  Edit2,
  Eye,
  EyeOff,
  FolderPlus,
  X,
  Building,
  Download,
  RefreshCw,
  FileText,
  Settings,
  ExternalLink,
  Edit,
  LogOut,
  Sparkles,
  Copy,
  CheckSquare,
  Square,
  Wand2,
  ListPlus,
  ChevronDown,
} from 'lucide-react';
import { CompanyDataEditor } from './CompanyDataEditor';
import { OnboardingFieldsManager } from './OnboardingFieldsManager';
import { SegmentsAndQuestionsManager } from './SegmentsAndQuestionsManager';
import { ServicesManager } from './ServicesManager';
import { DEFAULT_ONBOARDING_FIELDS, OnboardingFieldConfig } from '../../constants/formSchema';
import { initGoogleAuth, googleSignIn, googleLogout } from '../../services/googleAuth';
import { listUserSpreadsheets, createOnboardingSpreadsheet, GoogleSheetFile } from '../../services/googleSheets';
import { GoogleSignInButton } from '../GoogleSignInButton';
import type { User as FirebaseUser } from 'firebase/auth';

export type AdminTabType = 'fields' | 'segments' | 'services' | 'submissions' | 'settings' | 'companyFields';

interface ManageQuestionsPageProps {
  schema: FormSchemaState;
  onUpdateSchema: (newSchema: FormSchemaState) => void;
  onBack: () => void;
  onLogout?: () => void;
  initialTab?: AdminTabType;
}

export const ManageQuestionsPage: React.FC<ManageQuestionsPageProps> = ({
  schema,
  onUpdateSchema,
  onBack,
  onLogout,
  initialTab = 'fields',
}) => {
  // Navigation between fields catalog, questions per segment, services, submissions, settings
  const normalizeTab = (tab: AdminTabType): 'fields' | 'segments' | 'services' | 'submissions' | 'settings' => {
    if (tab === 'companyFields') return 'fields';
    return tab;
  };

  const [activeTab, setActiveTab] = useState<'fields' | 'segments' | 'services' | 'submissions' | 'settings'>(
    normalizeTab(initialTab)
  );

  React.useEffect(() => {
    if (initialTab) setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  // Copy of schema for live editing
  const [editableOnboardingFields, setEditableOnboardingFields] = useState<OnboardingFieldConfig[]>(
    schema.onboardingFields && schema.onboardingFields.length > 0
      ? schema.onboardingFields
      : DEFAULT_ONBOARDING_FIELDS
  );
  const [editableSegments, setEditableSegments] = useState<Record<string, SegmentConfig>>(
    schema.segmentsConfig
  );
  const [editableCompanyFields, setEditableCompanyFields] = useState<CompanyFieldConfig[]>(
    schema.companyFields
  );
  const [editableSettings, setEditableSettings] = useState(schema.settings);

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [editingSubmissionIndex, setEditingSubmissionIndex] = useState<number | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isTestingSheets, setIsTestingSheets] = useState(false);
  const [sheetsTestResult, setSheetsTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Google Workspace & Sheets direct integration state
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [userSpreadsheets, setUserSpreadsheets] = useState<GoogleSheetFile[]>([]);
  const [isLoadingSpreadsheets, setIsLoadingSpreadsheets] = useState(false);
  const [createdSpreadsheet, setCreatedSpreadsheet] = useState<GoogleSheetFile | null>(null);

  React.useEffect(() => {
    const unsub = initGoogleAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsub();
  }, []);

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setGoogleUser(res.user);
        showToast(`Conectado ao Google como ${res.user.email}!`);
      }
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        showToast('Não foi possível conectar à conta Google. Tente novamente.');
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    await googleLogout();
    setGoogleUser(null);
    setUserSpreadsheets([]);
    showToast('Conta Google desconectada.');
  };

  const handleFetchSpreadsheets = async () => {
    setIsLoadingSpreadsheets(true);
    try {
      const list = await listUserSpreadsheets();
      setUserSpreadsheets(list);
      showToast(`${list.length} planilha(s) encontrada(s) no seu Google Drive.`);
    } catch (err: any) {
      showToast(err?.message || 'Falha ao buscar planilhas no Google Drive.');
    } finally {
      setIsLoadingSpreadsheets(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    const confirmed = window.confirm(
      'Deseja criar uma nova planilha oficial "Localway - Respostas do Onboarding" no seu Google Drive com todas as colunas formatadas?'
    );
    if (!confirmed) return;

    setIsLoadingSpreadsheets(true);
    try {
      const newSheet = await createOnboardingSpreadsheet('Localway - Respostas do Onboarding');
      setCreatedSpreadsheet(newSheet);
      setUserSpreadsheets((prev) => [newSheet, ...prev]);
      showToast('Planilha criada com sucesso no seu Google Sheets!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao criar planilha no Google Sheets.');
    } finally {
      setIsLoadingSpreadsheets(false);
    }
  };

  // Selected segment for editing
  const segmentKeys = Object.keys(editableSegments);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>(
    segmentKeys[0] || 'Fotografia'
  );

  // Modal / Confirm state for deleting a question
  const [questionToDelete, setQuestionToDelete] = useState<{
    segmentKey: string;
    questionId: string;
    label: string;
  } | null>(null);

  // Modal state for adding a new segment
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentCategory, setNewSegmentCategory] = useState('');
  const [newSegmentDescription, setNewSegmentDescription] = useState('');

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState('');

  // AI Question Generator State
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<SegmentQuestion[]>([]);
  const [selectedGeneratedIds, setSelectedGeneratedIds] = useState<string[]>([]);
  const [copiedScript, setCopiedScript] = useState(false);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(''), 3500);
  };

  const handleGenerateQuestionsWithAi = async () => {
    if (!aiInstructions.trim()) {
      showToast('Por favor, descreva quais informações você deseja coletar.');
      return;
    }

    const currentSeg = editableSegments[selectedSegmentKey];
    const existingLabels = currentSeg ? currentSeg.questions.map((q) => q.label) : [];

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentName: selectedSegmentKey,
          instructions: aiInstructions,
          count: aiQuestionCount,
          existingQuestions: existingLabels,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        setSelectedGeneratedIds(data.questions.map((q: any) => q.id));
        showToast(`${data.questions.length} perguntas geradas pelo Gemini! Revise antes de salvar.`);
      } else {
        showToast(data.error || 'Erro ao gerar perguntas com IA.');
      }
    } catch (err) {
      showToast('Erro de conexão ao gerar perguntas com IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleToggleSelectGenerated = (id: string) => {
    setSelectedGeneratedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllGenerated = () => {
    if (selectedGeneratedIds.length === generatedQuestions.length) {
      setSelectedGeneratedIds([]);
    } else {
      setSelectedGeneratedIds(generatedQuestions.map((q) => q.id));
    }
  };

  const handleUpdateGeneratedQuestion = (idx: number, updates: Partial<SegmentQuestion>) => {
    setGeneratedQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...updates };
      return copy;
    });
  };

  const handleDeleteGeneratedQuestion = (idx: number) => {
    setGeneratedQuestions((prev) => {
      const copy = [...prev];
      const removed = copy.splice(idx, 1)[0];
      if (removed) {
        setSelectedGeneratedIds((s) => s.filter((id) => id !== removed.id));
      }
      return copy;
    });
  };

  const handleAddSelectedAiQuestions = () => {
    const toAdd = generatedQuestions.filter((q) => selectedGeneratedIds.includes(q.id));
    if (toAdd.length === 0) {
      showToast('Selecione pelo menos uma pergunta para adicionar.');
      return;
    }

    setEditableSegments((prev) => {
      const seg = prev[selectedSegmentKey];
      if (!seg) return prev;
      return {
        ...prev,
        [selectedSegmentKey]: {
          ...seg,
          questions: [...seg.questions, ...toAdd],
        },
      };
    });

    showToast(`${toAdd.length} pergunta(s) adicionada(s) ao segmento ${selectedSegmentKey}!`);
    setGeneratedQuestions([]);
    setSelectedGeneratedIds([]);
    setAiInstructions('');
  };

  // Load submissions with local cache fallback
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    let apiList: any[] = [];
    try {
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.submissions)) {
          apiList = data.submissions;
        }
      }
    } catch (err) {
      console.warn('API /api/submissions unavailable, loading local cache:', err);
    }

    let cachedList: any[] = [];
    try {
      const raw = localStorage.getItem('localway_admin_submissions_v1');
      if (raw) cachedList = JSON.parse(raw);
    } catch {
      // ignore
    }

    const map = new Map<string, any>();
    for (const item of cachedList) {
      const key = item.codigoCliente || item.payload?.rowData?.['Código do cliente'] || item.timestamp;
      if (key) map.set(key, item);
    }
    for (const item of apiList) {
      const key = item.codigoCliente || item.payload?.rowData?.['Código do cliente'] || item.timestamp;
      if (key) map.set(key, item);
    }

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

    try {
      localStorage.setItem('localway_admin_submissions_v1', JSON.stringify(merged));
    } catch {
      // ignore
    }

    setSubmissions(merged);
    setIsLoadingSubmissions(false);
  };

  React.useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    }
  }, [activeTab]);

  // Load settings
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setEditableSettings((prev: any) => ({ ...prev, ...data.settings }));
        }
      } catch (err) {
        console.warn('Usando configurações padrão:', err);
      }
    };
    loadSettings();
  }, []);

  const handleResyncSubmission = async (sub: any) => {
    try {
      setSyncStatus('Reenviando para a planilha...');
      const res = await fetch('/api/admin/sync-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowData: sub.payload?.rowData || sub.rowData }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('Sincronizado com sucesso!');
        showToast('Planilha atualizada com sucesso!');
      } else {
        setSyncStatus('Erro ao sincronizar.');
      }
    } catch {
      setSyncStatus('Erro de conexão ao sincronizar.');
    } finally {
      setTimeout(() => setSyncStatus(''), 4000);
    }
  };

  const handleTestSheetsIntegration = async () => {
    setIsTestingSheets(true);
    setSheetsTestResult(null);
    try {
      const res = await fetch('/api/admin/test-sheets-integration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleScriptUrl: editableSettings?.googleScriptUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSheetsTestResult({
          success: true,
          message: data.message || 'Teste enviado com sucesso para a planilha!',
          details: 'Aba Dashboard e aba individual LW-01 atualizadas com dados de exemplo.',
        });
        showToast('Planilha testada com sucesso!');
        fetchSubmissions();
      } else {
        setSheetsTestResult({
          success: false,
          message: data.error || data.message || 'Erro ao comunicar com a planilha',
          details:
            typeof data.scriptResponse === 'object'
              ? JSON.stringify(data.scriptResponse)
              : data.scriptResponse || 'Verifique se a URL da implantação do Apps Script está correta.',
        });
      }
    } catch (err: any) {
      setSheetsTestResult({
        success: false,
        message: 'Falha de conexão com o servidor ao testar a planilha.',
        details: err?.message || String(err),
      });
    } finally {
      setIsTestingSheets(false);
    }
  };

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert('Nenhuma empresa cadastrada para exportar.');
      return;
    }
    const headers = Object.keys(submissions[0].payload?.rowData || {});
    const rows = submissions.map((s) => {
      const row = s.payload?.rowData || {};
      return headers
        .map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`)
        .join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `empresas_onboarding_localway_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= SEGMENTS OPERATIONS =================
  const handleAddNewSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) return;

    const trimmed = newSegmentName.trim();
    if (editableSegments[trimmed]) {
      alert('Já existe um segmento com esse nome.');
      return;
    }

    const newConfig: SegmentConfig = {
      name: trimmed,
      category: newSegmentCategory.trim() || 'Serviços & Atendimento',
      description: newSegmentDescription.trim() || 'Perguntas e especificações do segmento',
      questions: [
        {
          id: `custom_${Date.now()}_1`,
          label: 'Quais os principais serviços ou produtos oferecidos?',
          type: 'checkbox',
          options: ['Opção 1', 'Opção 2', 'Outro'],
          otherLabel: 'Outro',
          otherPlaceholder: 'Qual?',
        },
      ],
    };

    setEditableSegments((prev) => ({
      ...prev,
      [trimmed]: newConfig,
    }));

    setSelectedSegmentKey(trimmed);
    setIsAddingSegment(false);
    setNewSegmentName('');
    setNewSegmentCategory('');
    setNewSegmentDescription('');
    showToast(`Segmento "${trimmed}" adicionado!`);
  };

  const handleUpdateSegmentMeta = (
    segKey: string,
    field: 'name' | 'category' | 'description',
    value: string
  ) => {
    setEditableSegments((prev) => {
      const seg = prev[segKey];
      if (!seg) return prev;
      return {
        ...prev,
        [segKey]: {
          ...seg,
          [field]: value,
        },
      };
    });
  };

  // ================= QUESTIONS OPERATIONS =================
  const handleAddQuestion = (segKey: string) => {
    const seg = editableSegments[segKey];
    if (!seg) return;

    const newQuestion: SegmentQuestion = {
      id: `q_${Date.now()}`,
      label: 'Nova pergunta do segmento',
      type: 'checkbox',
      options: ['Primeira opção', 'Segunda opção', 'Outro'],
      otherLabel: 'Outro',
      otherPlaceholder: 'Especifique...',
      helper: 'Selecione as opções aplicáveis ou descreva em Outro.',
    };

    setEditableSegments((prev) => ({
      ...prev,
      [segKey]: {
        ...seg,
        questions: [...seg.questions, newQuestion],
      },
    }));

    showToast('Nova pergunta adicionada ao segmento!');
  };

  const handleUpdateQuestion = (
    segKey: string,
    qId: string,
    updatedProps: Partial<SegmentQuestion>
  ) => {
    setEditableSegments((prev) => {
      const seg = prev[segKey];
      if (!seg) return prev;
      return {
        ...prev,
        [segKey]: {
          ...seg,
          questions: seg.questions.map((q) =>
            q.id === qId ? { ...q, ...updatedProps } : q
          ),
        },
      };
    });
  };

  const handleMoveQuestion = (segKey: string, index: number, direction: 'up' | 'down') => {
    const seg = editableSegments[segKey];
    if (!seg) return;

    const newQuestions = [...seg.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    setEditableSegments((prev) => ({
      ...prev,
      [segKey]: {
        ...seg,
        questions: newQuestions,
      },
    }));
  };

  const confirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    const { segmentKey, questionId } = questionToDelete;

    setEditableSegments((prev) => {
      const seg = prev[segmentKey];
      if (!seg) return prev;
      return {
        ...prev,
        [segmentKey]: {
          ...seg,
          questions: seg.questions.filter((q) => q.id !== questionId),
        },
      };
    });

    setQuestionToDelete(null);
    showToast('Pergunta removida.');
  };

  // Manage options inside a question
  const handleAddOption = (segKey: string, qId: string) => {
    const seg = editableSegments[segKey];
    const q = seg?.questions.find((item) => item.id === qId);
    if (!q) return;

    const currentOptions = q.options || [];
    const newOptions = [...currentOptions, `Nova opção ${currentOptions.length + 1}`];

    handleUpdateQuestion(segKey, qId, { options: newOptions });
  };

  const handleUpdateOption = (segKey: string, qId: string, optIndex: number, text: string) => {
    const seg = editableSegments[segKey];
    const q = seg?.questions.find((item) => item.id === qId);
    if (!q || !q.options) return;

    const newOptions = [...q.options];
    newOptions[optIndex] = text;

    handleUpdateQuestion(segKey, qId, { options: newOptions });
  };

  const handleRemoveOption = (segKey: string, qId: string, optIndex: number) => {
    const seg = editableSegments[segKey];
    const q = seg?.questions.find((item) => item.id === qId);
    if (!q || !q.options) return;

    const newOptions = q.options.filter((_, idx) => idx !== optIndex);
    handleUpdateQuestion(segKey, qId, { options: newOptions });
  };

  // ================= COMPANY FIELDS OPERATIONS =================
  const handleMoveCompanyField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...editableCompanyFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    newFields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setEditableCompanyFields(newFields);
  };

  const handleToggleCompanyFieldRequired = (id: string) => {
    setEditableCompanyFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleToggleCompanyFieldEnabled = (id: string) => {
    setEditableCompanyFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleUpdateCompanyFieldLabel = (id: string, label: string) => {
    setEditableCompanyFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, label } : f))
    );
  };

  const handleUpdateCompanyFieldPlaceholder = (id: string, placeholder: string) => {
    setEditableCompanyFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, placeholder } : f))
    );
  };

  // ================= SAVE ALL =================
  const handleSaveAll = async () => {
    setIsSaving(true);
    const updatedSchema: FormSchemaState = {
      ...schema,
      onboardingFields: editableOnboardingFields,
      companyFields: editableCompanyFields,
      segmentsConfig: editableSegments,
      settings: editableSettings,
    };

    onUpdateSchema(updatedSchema);
    localStorage.setItem('localway_form_schema_v1', JSON.stringify(updatedSchema));

    try {
      await fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchema),
      });
      showToast('Todas as alterações foram salvas com sucesso no servidor!');
    } catch (err) {
      console.error('Erro ao salvar schema no servidor:', err);
      showToast('Salvo localmente no navegador (backup seguro).');
    } finally {
      setIsSaving(false);
    }
  };

  const currentSegment = editableSegments[selectedSegmentKey];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between">
      {/* ================= PAGE HEADER BAR ================= */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Voltar ao formulário"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <LocalwayLogo size="sm" />
              <div className="hidden sm:flex flex-col">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Gerenciador de Perguntas & Segmentos
                </h1>
                <span className="text-[11px] text-slate-400">
                  Edição completa sem modais ou limitações
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>

        {/* Success toast bar */}
        {saveToast && (
          <div className="bg-emerald-600 text-white text-xs font-semibold py-2 px-4 text-center animate-fadeIn flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{saveToast}</span>
          </div>
        )}
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1">
        {/* Main Tab Switcher */}
        <div className="flex items-center justify-between pb-6 flex-wrap gap-4">
          <div className="inline-flex rounded-2xl p-1 bg-slate-200/70 border border-slate-300/50 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('fields')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'fields'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Campos do Onboarding ({editableOnboardingFields.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('segments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'segments'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Perguntas por Segmento ({segmentKeys.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Serviços da Localway</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'submissions'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Respostas ({submissions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações & Links</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Toda mudança de texto, opção ou dado é refletida instantaneamente no sistema.
          </div>
        </div>

        {/* ================= TAB 1: CAMPOS DO ONBOARDING ================= */}
        {activeTab === 'fields' && (
          <OnboardingFieldsManager
            fields={editableOnboardingFields}
            onChange={(updated) => {
              setEditableOnboardingFields(updated);
            }}
          />
        )}

        {/* ================= TAB 2: PERGUNTAS POR SEGMENTO ================= */}
        {activeTab === 'segments' && (
          <SegmentsAndQuestionsManager
            segments={editableSegments}
            onChange={(updated) => {
              setEditableSegments(updated);
            }}
          />
        )}

        {/* ================= TAB 3: SERVIÇOS DA LOCALWAY ================= */}
        {activeTab === 'services' && (
          <ServicesManager />
        )}

        {/* ================= TAB 3: RESPOSTAS DOS CLIENTES ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Respostas Recebidas ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Todas as respostas enviadas pelos clientes ficam salvas aqui de forma permanente. Consulte detalhes, edite dados ou reenvie para a planilha.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchSubmissions}
                  disabled={isLoadingSubmissions}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  title="Atualizar lista"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={submissions.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {syncStatus && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium animate-fadeIn">
                {syncStatus}
              </div>
            )}

            {isLoadingSubmissions ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-xs">Carregando respostas dos clientes...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nenhuma resposta recebida ainda</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Assim que um cliente concluir o formulário oficial de onboarding, todas as respostas, dados cadastrais, horários e detalhes do segmento aparecerão aqui.
                </p>
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <span>Preencher um teste no formulário</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {submissions.map((sub, idx) => {
                  const row = sub.payload?.rowData || sub.rowData || {};
                  const clientCode = sub.codigoCliente || row['Código do cliente'] || `LW-${String(submissions.length - idx).padStart(2, '0')}`;
                  const companyName = row['Nome fantasia'] || row['Razão social'] || 'Empresa sem nome';
                  const segment = row['Segmento'] || 'Geral';
                  const date = sub.timestamp ? new Date(sub.timestamp).toLocaleString('pt-BR') : '-';
                  const whatsapp = row['WhatsApp'] || row['WhatsApp principal'] || row['Telefone'] || row['Telefone fixo'] || '-';
                  const city = row['Cidade'] ? `${row['Cidade']}/${row['Estado'] || ''}` : '-';

                  const isFinalized = sub.status === 'Finalizado' || sub.finalized || row['Status do Onboarding'] === 'Finalizado';
                  const syncStatusValue = sub.sheetSyncStatus || (sub.sheetSyncSuccess ? 'synced' : 'pending');

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900 text-white shadow-xs">
                            {clientCode}
                          </span>
                          <span className="font-bold text-base text-slate-900 truncate">
                            {companyName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {segment}
                          </span>
                          {isFinalized ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Finalizado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Rascunho
                            </span>
                          )}
                          {syncStatusValue === 'synced' ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Sincronizado
                            </span>
                          ) : syncStatusValue === 'error' ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1" title={sub.sheetSyncError}>
                              <AlertCircle className="w-3 h-3" /> Falha na planilha
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                              <RefreshCw className="w-3 h-3" /> Pendente de sincronização
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <span>{date}</span>
                          <span>•</span>
                          <span>WhatsApp: <strong className="text-slate-700">{whatsapp}</strong></span>
                          <span>•</span>
                          <span>Cidade: {city}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {/* EDIT COMPANY BUTTON */}
                        <button
                          type="button"
                          onClick={() => setEditingSubmissionIndex(idx)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          title="Editar todos os dados da empresa (horários, agendamento, endereço, facilidades)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar Empresa</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedSubmission(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Respostas</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResyncSubmission(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                          title="Reenviar para a planilha do Google"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reenviar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submission Detail Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">
                        {selectedSubmission.payload?.rowData?.['Nome fantasia'] || 'Detalhes do Onboarding'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Recebido em {selectedSubmission.timestamp ? new Date(selectedSubmission.timestamp).toLocaleString('pt-BR') : '-'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-2.5 text-xs">
                    {Object.entries(selectedSubmission.payload?.rowData || {}).map(([key, value]) => {
                      if (!value) return null;
                      return (
                        <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <span className="font-semibold text-slate-500 block">{key}:</span>
                          <span className="font-medium text-slate-800 whitespace-pre-line">
                            {String(value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(null)}
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Edição Completa da Empresa */}
            {editingSubmissionIndex !== null && (
              <CompanyDataEditor
                submissionIndex={editingSubmissionIndex}
                submissionData={submissions[editingSubmissionIndex]}
                isOpen={true}
                onClose={() => setEditingSubmissionIndex(null)}
                onSaved={(updated) => {
                  setSubmissions((prev) => {
                    const next = [...prev];
                    next[editingSubmissionIndex] = updated;
                    return next;
                  });
                  showToast('Dados da empresa atualizados com sucesso!');
                  setEditingSubmissionIndex(null);
                }}
              />
            )}
          </div>
        )}

        {/* ================= TAB 4: SETTINGS & INTEGRATIONS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Configurações & Integrações</h3>
              <p className="text-xs text-slate-500">
                Gerencie URLs do Google Sheets, TransferNow e links de materiais.
              </p>
            </div>

            {/* Google Workspace & Google Sheets API Connection */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-200">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Google Workspace (Google Sheets & Drive)</h4>
                    <p className="text-[11px] text-slate-500">
                      Integração oficial OAuth com permissão para gerenciar planilhas no Google Drive.
                    </p>
                  </div>
                </div>

                {googleUser && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Conectado</span>
                  </span>
                )}
              </div>

              {!googleUser ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Conecte sua conta do Google para visualizar planilhas diretamente no seu Google Drive, criar planilhas de onboarding com cabeçalhos automáticos e sincronizar dados.
                  </p>
                  <div className="max-w-xs">
                    <GoogleSignInButton
                      onClick={handleGoogleConnect}
                      disabled={isConnectingGoogle}
                      text={isConnectingGoogle ? 'Conectando ao Google...' : 'Conectar Google Workspace'}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      {googleUser.photoURL ? (
                        <img
                          src={googleUser.photoURL}
                          alt={googleUser.displayName || ''}
                          className="w-9 h-9 rounded-full border border-slate-300"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                          {googleUser.email?.slice(0, 2).toUpperCase() || 'G'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {googleUser.displayName || 'Administrador Google'}
                        </div>
                        <div className="text-[11px] text-slate-500">{googleUser.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGoogleDisconnect}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Desconectar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleCreateSpreadsheet}
                      disabled={isLoadingSpreadsheets}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Criar Nova Planilha no Sheets</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFetchSpreadsheets}
                      disabled={isLoadingSpreadsheets}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpreadsheets ? 'animate-spin' : ''}`} />
                      <span>Buscar Planilhas no Drive</span>
                    </button>
                  </div>

                  {createdSpreadsheet && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn">
                      <div>
                        <strong>Planilha criada:</strong> {createdSpreadsheet.name}
                      </div>
                      {createdSpreadsheet.webViewLink && (
                        <a
                          href={createdSpreadsheet.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                        >
                          <span>Abrir no Google Sheets</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {userSpreadsheets.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h5 className="text-xs font-bold text-slate-700">Planilhas encontradas no seu Google Drive:</h5>
                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {userSpreadsheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                          >
                            <span className="font-medium text-slate-800 truncate max-w-xs">{sheet.name}</span>
                            {sheet.webViewLink && (
                              <a
                                href={sheet.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline shrink-0"
                              >
                                <span>Abrir</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Google Apps Script Web App URL (Google Sheets)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={editableSettings?.googleScriptUrl || ''}
                    onChange={(e) =>
                      setEditableSettings((prev: any) => ({ ...prev, googleScriptUrl: e.target.value }))
                    }
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleTestSheetsIntegration}
                    disabled={isTestingSheets}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
                    title="Envia dados reais de teste para validar a gravação na planilha do Google"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-spin' : ''}`} />
                    <span>{isTestingSheets ? 'Enviando teste...' : 'Testar na Planilha Agora'}</span>
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Endpoint do seu Web App no Google Drive. Use o botão acima para enviar dados de exemplo e confirmar a conexão.
                </span>

                {/* Sheets Test Feedback Result */}
                {sheetsTestResult && (
                  <div
                    className={`mt-3 p-3.5 rounded-2xl border text-xs animate-fadeIn ${
                      sheetsTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {sheetsTestResult.success ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      )}
                      <span>{sheetsTestResult.message}</span>
                    </div>
                    {sheetsTestResult.details && (
                      <p className="mt-1 text-[11px] opacity-90 leading-relaxed font-mono">
                        {sheetsTestResult.details}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Link do TransferNow (Envio de arquivos pesados)
                </label>
                <input
                  type="url"
                  value={editableSettings?.transferNowUrl || ''}
                  onChange={(e) =>
                    setEditableSettings((prev: any) => ({ ...prev, transferNowUrl: e.target.value }))
                  }
                  placeholder="https://www.transfernow.net/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Link exibido na etapa de envio de fotos e arquivos de alta resolução.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch('/api/admin/settings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editableSettings),
                      });
                      showToast('Configurações salvas com sucesso!');
                    } catch {
                      showToast('Erro ao salvar configurações.');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Configurações</span>
                </button>
              </div>
            </div>

            {/* ================= GUIA DA PLANILHA GOOGLE SHEETS & APPS SCRIPT ================= */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      Automação Google Sheets
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">
                      Código do Google Apps Script (Dashboard + Abas Individuais)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Script completo com proteção contra envios vazios, aba Dashboard geral e aba individual por cliente (LW-01, LW-02...).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const scriptCode = `/**
 * GOOGLE APPS SCRIPT - ONBOARDING LOCALWAY
 * Sistema Oficial com Dashboard Geral + Aba Individual por Cliente (LW-01, LW-02...)
 */

// Resposta amigável quando abre a URL no navegador
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    message: 'Localway Google Apps Script está ativo e pronto para receber dados via POST!',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

// Endpoint de recebimento automático de cada formulário
function doPost(e) {
  try {
    var rawData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        rawData = e.parameter || {};
      }
    } else if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      rawData = e.parameter;
    }

    // Proteção: se o script for executado sem parâmetros (ex: clicando em 'Executar' no doPost)
    var nome = rawData['Nome fantasia'] || rawData.nomeFantasia || '';
    var whats = rawData['WhatsApp'] || rawData.whatsapp || '';
    if (!nome && !whats) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Nenhum dado recebido. Se estiver testando direto no editor do Google Apps Script, selecione a função testarEnvio() e clique em Executar.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Extrair código do cliente (LW-01, LW-02...)
    var clientCode = rawData['Código do cliente'] || rawData.codigoCliente;
    
    // 2. Registrar no Dashboard Geral
    var dashSheet = getOrCreateDashboard(ss);
    var clientCodeFinal = recordInDashboard(dashSheet, rawData, clientCode);
    
    // 3. Criar ou Atualizar Aba Individual do Cliente
    recordInClientTab(ss, rawData, clientCodeFinal);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Onboarding registrado com sucesso!',
      clientCode: clientCodeFinal
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Função de teste pronta para executar diretamente no editor do Apps Script
function testarEnvio() {
  var dadosExemplo = {
    'Código do cliente': 'LW-01',
    'Data e hora': new Date().toLocaleString('pt-BR'),
    'Nome fantasia': 'Empresa Exemplo Localway',
    'Razão social': 'Empresa Exemplo Serviços Ltda',
    'CNPJ': '12.345.678/0001-90',
    'Segmento': 'Fotografia',
    'WhatsApp': '(11) 99999-8888',
    'Telefone': '(11) 3333-4444',
    'E-mail': 'contato@empresaexemplo.com.br',
    'Cidade': 'São Paulo',
    'Estado': 'SP',
    'Rua / Avenida': 'Av. Paulista',
    'Número': '1000',
    'Complemento': 'Sala 502',
    'Bairro': 'Bela Vista',
    'Horário segunda a sexta': '08:00 às 18:00',
    'Sábado': '08:00 às 12:00',
    'Domingo': 'Fechado',
    'Trabalha com agendamento': 'Sim',
    'Formas de agendamento': 'WhatsApp, Telefone',
    'Estacionamento': 'Estacionamento próprio no local',
    'Formas de pagamento': 'Cartão de Crédito, Pix, Dinheiro',
    'Responsável': 'Carlos Alberto da Silva',
    'Cargo / função': 'Diretor Comercial',
    'WhatsApp responsável': '(11) 98888-1111',
    'E-mail responsável': 'carlos@empresaexemplo.com.br',
    'Serviços contratados': 'Google Meu Negócio, Mini Site, Tráfego Pago',
    'Detalhes dos serviços': '[GOOGLE MEU NEGÓCIO]: Perfil com fotos, horários e endereço completo.\\n\\n[MINI SITE]: Mini-site de alta conversão.',
    'Detalhes específicos do segmento': 'Especialidades: Casamentos, Eventos e Ensaios Corporativos.',
    'Possui materiais': 'Sim',
    'Tipos de materiais': 'Logotipo em vetor, Fotos em alta resolução',
    'Link TransferNow': 'https://www.transfernow.net/exemplo',
    'Observações finais': 'Projeto prioritário.'
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashSheet = getOrCreateDashboard(ss);
  var code = recordInDashboard(dashSheet, dadosExemplo, 'LW-01');
  recordInClientTab(ss, dadosExemplo, code);
  Logger.log('Teste concluído com sucesso! Verifique a aba Dashboard e a aba LW-01.');
}

function getOrCreateDashboard(ss) {
  var sheet = ss.getSheetByName('Dashboard');
  if (!sheet) {
    sheet = ss.insertSheet('Dashboard', 0);
    var headers = [
      'Código', 'Data/Hora', 'Nome Fantasia', 'Segmento', 'WhatsApp',
      'E-mail', 'Cidade/UF', 'Serviços Contratados', 'Ficha do Cliente', 'Status'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function recordInDashboard(sheet, data, clientCode) {
  var rows = sheet.getDataRange().getValues();
  var whats = (data['WhatsApp'] || '').toString().trim();
  var nome = (data['Nome fantasia'] || '').toString().trim().toLowerCase();
  
  var targetRow = -1;
  var finalCode = clientCode;
  
  for (var i = 1; i < rows.length; i++) {
    var rowCode = rows[i][0] ? rows[i][0].toString() : '';
    var rowNome = rows[i][2] ? rows[i][2].toString().toLowerCase() : '';
    var rowWhats = rows[i][4] ? rows[i][4].toString() : '';
    
    if ((finalCode && rowCode === finalCode) || (rowNome && rowNome === nome && rowWhats === whats)) {
      targetRow = i + 1;
      finalCode = rowCode;
      break;
    }
  }
  
  if (!finalCode) {
    var num = rows.length;
    finalCode = 'LW-' + (num < 10 ? '0' + num : num);
  }
  
  var rowValues = [
    finalCode,
    data['Data e hora'] || new Date().toLocaleString('pt-BR'),
    data['Nome fantasia'] || '',
    data['Segmento'] || '',
    data['WhatsApp'] || '',
    data['E-mail'] || '',
    (data['Cidade'] || '') + (data['Estado'] ? '/' + data['Estado'] : ''),
    data['Serviços contratados'] || '',
    'Aba: ' + finalCode + ' - ' + (data['Nome fantasia'] || ''),
    'Recebido'
  ];
  
  if (targetRow > 1) {
    sheet.getRange(targetRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  
  return finalCode;
}

function recordInClientTab(ss, data, clientCode) {
  var tabName = (clientCode + ' - ' + (data['Nome fantasia'] || '')).substring(0, 50).trim();
  var sheet = ss.getSheetByName(tabName);
  
  if (!sheet) {
    var allSheets = ss.getSheets();
    for (var i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getName().indexOf(clientCode + ' -') === 0 || allSheets[i].getName() === clientCode) {
        sheet = allSheets[i];
        sheet.setName(tabName);
        break;
      }
    }
  }
  
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
  } else {
    sheet.clear();
  }
  
  var content = [
    ['FICHA DE ONBOARDING - LOCALWAY', ''],
    ['Código do Cliente:', clientCode],
    ['Data e Hora de Envio:', data['Data e hora'] || new Date().toLocaleString('pt-BR')],
    ['', ''],
    ['--- 1. DADOS CADASTRAIS DA EMPRESA ---', ''],
    ['Nome Fantasia:', data['Nome fantasia'] || ''],
    ['Razão Social:', data['Razão social'] || ''],
    ['CNPJ:', data['CNPJ'] || ''],
    ['Data de Abertura:', data['Data de abertura'] || ''],
    ['Segmento:', data['Segmento'] || ''],
    ['Descrição da Empresa:', data['Descrição da empresa'] || ''],
    ['WhatsApp Principal:', data['WhatsApp'] || ''],
    ['Telefone Comercial:', data['Telefone'] || ''],
    ['E-mail de Contato:', data['E-mail'] || ''],
    ['Site Atual:', data['Site'] || ''],
    ['Instagram:', data['Instagram'] || ''],
    ['Facebook / Outras:', data['Facebook / outras redes'] || ''],
    ['Endereço Completo:', (data['Rua / Avenida'] || '') + ', ' + (data['Número'] || '') + (data['Complemento'] ? ' - ' + data['Complemento'] : '')],
    ['Bairro / Cidade / UF:', (data['Bairro'] || '') + ' - ' + (data['Cidade'] || '') + '/' + (data['Estado'] || '')],
    ['', ''],
    ['--- 2. HORÁRIOS & ATENDIMENTO ---', ''],
    ['Horário Segunda a Sexta:', data['Horário segunda a sexta'] || ''],
    ['Sábado:', data['Sábado'] || ''],
    ['Domingo:', data['Domingo'] || ''],
    ['Trabalha com Agendamento:', data['Trabalha com agendamento'] || ''],
    ['Formas de Agendamento:', data['Formas de agendamento'] || ''],
    ['Estacionamento:', data['Estacionamento'] || ''],
    ['Formas de Pagamento:', data['Formas de pagamento'] || ''],
    ['', ''],
    ['--- 3. RESPONSÁVEL PELO PROJETO ---', ''],
    ['Nome do Responsável:', data['Responsável'] || ''],
    ['Cargo / Função:', data['Cargo / função'] || ''],
    ['WhatsApp do Responsável:', data['WhatsApp responsável'] || ''],
    ['E-mail do Responsável:', data['E-mail responsável'] || ''],
    ['', ''],
    ['--- 4. SERVIÇOS CONTRATADOS & ESPECIFICAÇÕES ---', ''],
    ['Serviços Contratados:', data['Serviços contratados'] || ''],
    ['Detalhamento dos Serviços:', data['Detalhes dos serviços'] || ''],
    ['', ''],
    ['--- 5. PERGUNTAS ESPECÍFICAS DO SEGMENTO ---', ''],
    ['Respostas do Segmento:', data['Detalhes específicos do segmento'] || ''],
    ['', ''],
    ['--- 6. ARQUIVOS & MATERIAIS ---', ''],
    ['Possui Materiais:', data['Possui materiais'] || ''],
    ['Tipos de Materiais:', data['Tipos de materiais'] || ''],
    ['Link TransferNow / Arquivos:', data['Link TransferNow'] || ''],
    ['Observações dos Materiais:', data['Observações dos materiais'] || ''],
    ['Observações Finais:', data['Observações finais'] || '']
  ];
  
  sheet.getRange(1, 1, content.length, 2).setValues(content);
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 600);
  
  sheet.getRange('A1:B1').setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  sheet.getRange('A1').setFontSize(12);
  sheet.getRange('A5:B5').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A21:B21').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A30:B30').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A36:B36').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A40:B40').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A43:B43').setBackground('#f1f5f9').setFontWeight('bold');
  
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 600);
  
  sheet.getRange('A1:B1').setBackground('#0f172a').setFontColor('#ffffff').setFontWeight('bold');
  sheet.getRange('A1').setFontSize(12);
  sheet.getRange('A5:B5').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A21:B21').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A30:B30').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A36:B36').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A40:B40').setBackground('#f1f5f9').setFontWeight('bold');
  sheet.getRange('A43:B43').setBackground('#f1f5f9').setFontWeight('bold');
  
  sheet.getRange(1, 1, content.length, 2).setWrap(true);
}`;
                    navigator.clipboard.writeText(scriptCode);
                    setCopiedScript(true);
                    showToast('Código copiado para a área de transferência!');
                    setTimeout(() => setCopiedScript(false), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>{copiedScript ? 'Copiado!' : 'Copiar Código do Script'}</span>
                </button>
              </div>

              {/* Instructions Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">1</span>
                    <span>Como colar no Google Sheets:</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-relaxed">
                    <li>Abra a sua planilha no <strong>Google Sheets</strong>.</li>
                    <li>No menu superior, clique em <strong>Extensões</strong> &gt; <strong>Apps Script</strong>.</li>
                    <li>Apague todo o código existente, <strong>cole o código acima</strong> e salve (Ctrl+S).</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">2</span>
                    <span>Como implantar e obter a URL:</span>
                  </div>
                  <ol className="list-decimal pl-5 space-y-1 text-slate-600 leading-relaxed">
                    <li>Clique no botão azul <strong>Implantar</strong> &gt; <strong>Nova implantação</strong>.</li>
                    <li>Clique na engrenagem no canto esquerdo e selecione <strong>App da Web</strong>.</li>
                    <li>Em <em>Executar como</em>: <strong>Eu</strong>; em <em>Quem pode acessar</em>: <strong>Qualquer pessoa</strong>.</li>
                    <li>Clique em <strong>Implantar</strong>, autorize o Google e copie a <strong>URL do app da web</strong> gerada para o campo no topo desta tela.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[11px]">3</span>
                    <span>Como testar sem erro:</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Para testar direto no editor do Google Apps Script, escolha a função <strong>testarEnvio</strong> ao lado do botão Executar.
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Ou, após colar a URL no campo acima, basta clicar no botão <strong>Testar na Planilha Agora</strong> para enviar dados completos de teste e preencher sua planilha na hora!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL DE CONFIRMAÇÃO DE EXCLUSÃO ================= */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Excluir esta pergunta?</h4>
              <p className="text-xs text-slate-500">
                A pergunta &quot;<strong>{questionToDelete.label}</strong>&quot; será removida do formulário do segmento {questionToDelete.segmentKey}.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteQuestion}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Sim, Excluir Pergunta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Minimalist Footer */}
      <footer className="py-6 border-t border-slate-200/80 bg-white/70 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LocalwayLogo size="sm" />
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Editor Administrativo de Perguntas & Segmentos</span>
          </div>

          <div className="flex items-center gap-3">
            <GoogleAccentDots size="xs" />
            <span>Localway • Presença Digital & Resultados</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
