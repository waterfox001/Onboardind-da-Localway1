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

interface ManageQuestionsPageProps {
  schema: FormSchemaState;
  onUpdateSchema: (newSchema: FormSchemaState) => void;
  onBack: () => void;
  onLogout?: () => void;
  initialTab?: 'segments' | 'companyFields' | 'submissions' | 'settings';
}

export const ManageQuestionsPage: React.FC<ManageQuestionsPageProps> = ({
  schema,
  onUpdateSchema,
  onBack,
  onLogout,
  initialTab = 'segments',
}) => {
  // Navigation between questions per segment, company fields, submissions, settings
  const [activeTab, setActiveTab] = useState<'segments' | 'companyFields' | 'submissions' | 'settings'>(
    initialTab
  );

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Copy of schema for live editing
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

  // Load submissions
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions.reverse());
      }
    } catch (err) {
      console.error('Erro ao buscar envios:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
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
      companyFields: editableCompanyFields,
      segmentsConfig: editableSegments,
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
              onClick={() => setActiveTab('companyFields')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'companyFields'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Campos da Empresa ({editableCompanyFields.length})</span>
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
              <Building className="w-4 h-4" />
              <span>Empresas & Envios ({submissions.length})</span>
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

        {/* ================= TAB 1: SEGMENT QUESTIONS ================= */}
        {activeTab === 'segments' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Segment List */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Segmentos de Atuação</h3>
                  <p className="text-[11px] text-slate-400">Selecione para gerenciar as perguntas</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSegment(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                  title="Criar novo segmento"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Novo</span>
                </button>
              </div>

              {/* Add Segment Inline Box */}
              {isAddingSegment && (
                <form
                  onSubmit={handleAddNewSegment}
                  className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">Novo Segmento</span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSegment(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Nome do segmento (ex: Restaurante)"
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-blue-600"
                  />

                  <input
                    type="text"
                    placeholder="Categoria (ex: Gastronomia)"
                    value={newSegmentCategory}
                    onChange={(e) => setNewSegmentCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-blue-600"
                  />

                  <input
                    type="text"
                    placeholder="Descrição breve..."
                    value={newSegmentDescription}
                    onChange={(e) => setNewSegmentDescription(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:border-blue-600"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSegment(false)}
                      className="px-2.5 py-1 rounded-lg text-xs text-slate-600"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                    >
                      Criar Segmento
                    </button>
                  </div>
                </form>
              )}

              {/* Segment Cards */}
              <div className="space-y-2">
                {segmentKeys.map((key) => {
                  const seg = editableSegments[key];
                  const isSelected = selectedSegmentKey === key;
                  const qCount = seg.questions?.length || 0;

                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setSelectedSegmentKey(key)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm truncate">{seg.name}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            isSelected
                              ? 'bg-slate-800 text-slate-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {qCount} {qCount === 1 ? 'pergunta' : 'perguntas'}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1 line-clamp-1 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        {seg.description || seg.category}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Area: Questions Editor for Selected Segment */}
            <div className="lg:col-span-8 space-y-5">
              {currentSegment ? (
                <>
                  {/* Segment Details Header Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            Segmento Ativo
                          </span>
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {currentSegment.name}
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Edite os detalhes gerais e as perguntas personalizadas para este segmento.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddQuestion(selectedSegmentKey)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Pergunta</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nome do Segmento
                        </label>
                        <input
                          type="text"
                          value={currentSegment.name}
                          onChange={(e) =>
                            handleUpdateSegmentMeta(selectedSegmentKey, 'name', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Categoria
                        </label>
                        <input
                          type="text"
                          value={currentSegment.category}
                          onChange={(e) =>
                            handleUpdateSegmentMeta(selectedSegmentKey, 'category', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Descrição / Subtítulo no Onboarding
                        </label>
                        <input
                          type="text"
                          value={currentSegment.description}
                          onChange={(e) =>
                            handleUpdateSegmentMeta(selectedSegmentKey, 'description', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ================= GERADOR DE PERGUNTAS COM IA (GEMINI) ================= */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shadow-inner">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white">
                              Gerador de Perguntas com IA (Gemini)
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                              Gemini 3.8 Flash
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Gere perguntas estratégicas sob medida descrevendo o que deseja coletar do cliente.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAiGeneratorOpen((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto border border-white/10"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isAiGeneratorOpen ? 'Recolher Gerador' : 'Abrir Gerador com IA'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isAiGeneratorOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {isAiGeneratorOpen && (
                      <div className="space-y-4 pt-1 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2 space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                              Segmento Alvo
                            </label>
                            <select
                              value={selectedSegmentKey}
                              onChange={(e) => setSelectedSegmentKey(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                            >
                              {segmentKeys.map((key) => (
                                <option key={key} value={key} className="bg-slate-900 text-white">
                                  {editableSegments[key]?.name || key}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-300">
                              Qtd. de Perguntas
                            </label>
                            <select
                              value={aiQuestionCount}
                              onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white outline-none focus:border-amber-400"
                            >
                              <option value={3}>3 perguntas</option>
                              <option value={5}>5 perguntas (Recomendado)</option>
                              <option value={8}>8 perguntas</option>
                              <option value={10}>10 perguntas</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-300">
                            Quais informações você quer coletar deste segmento?
                          </label>
                          <textarea
                            rows={3}
                            value={aiInstructions}
                            onChange={(e) => setAiInstructions(e.target.value)}
                            placeholder="Ex: Quero mapear os tipos de serviços mais procurados, equipamentos ou marcas com que trabalham, formas de entrega/prazos, se atendem a domicílio e canais de agendamento..."
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 outline-none focus:border-amber-400 transition-colors"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">
                            Respeita as perguntas já existentes e inclui opção &quot;Outro&quot; nas seleções.
                          </span>

                          <button
                            type="button"
                            onClick={handleGenerateQuestionsWithAi}
                            disabled={isGeneratingAi || !aiInstructions.trim()}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-[0.99] text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                            <span>{isGeneratingAi ? 'Gerando com Gemini...' : 'Gerar Perguntas com IA'}</span>
                          </button>
                        </div>

                        {/* Review Screen for Generated Questions */}
                        {generatedQuestions.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3.5 animate-fadeIn">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                                  Revisão Prévia ({selectedGeneratedIds.length} de {generatedQuestions.length} selecionadas)
                                </span>
                                <p className="text-[11px] text-slate-400">
                                  Edite, desmarque ou remova perguntas antes de adicionar ao segmento.
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleToggleSelectAllGenerated}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer border border-slate-700"
                                >
                                  {selectedGeneratedIds.length === generatedQuestions.length ? (
                                    <>
                                      <Square className="w-3.5 h-3.5" />
                                      <span>Desmarcar Todas</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
                                      <span>Selecionar Todas</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Cards of Generated Questions */}
                            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                              {generatedQuestions.map((q, qIdx) => {
                                const isSelected = selectedGeneratedIds.includes(q.id);
                                return (
                                  <div
                                    key={q.id}
                                    className={`p-3.5 rounded-2xl border transition-all text-slate-900 ${
                                      isSelected
                                        ? 'bg-white border-amber-400/80 shadow-xs'
                                        : 'bg-slate-100/90 border-slate-300 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleToggleSelectGenerated(q.id)}
                                        className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                                      />

                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                          <input
                                            type="text"
                                            value={q.label}
                                            onChange={(e) =>
                                              handleUpdateGeneratedQuestion(qIdx, { label: e.target.value })
                                            }
                                            placeholder="Texto da pergunta..."
                                            className="flex-1 font-bold text-xs text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 outline-none pb-0.5"
                                          />

                                          <div className="flex items-center gap-2">
                                            <select
                                              value={q.type}
                                              onChange={(e) =>
                                                handleUpdateGeneratedQuestion(qIdx, {
                                                  type: e.target.value as any,
                                                })
                                              }
                                              className="text-[11px] font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none"
                                            >
                                              <option value="checkbox">Múltipla Escolha (Checkbox)</option>
                                              <option value="radio">Escolha Única (Radio)</option>
                                              <option value="select">Lista Suspensa (Select)</option>
                                              <option value="text">Texto Curto</option>
                                              <option value="textarea">Texto Longo (Área)</option>
                                            </select>

                                            <button
                                              type="button"
                                              onClick={() => handleDeleteGeneratedQuestion(qIdx)}
                                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                              title="Descartar esta pergunta"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        <input
                                          type="text"
                                          value={q.helper || ''}
                                          onChange={(e) =>
                                            handleUpdateGeneratedQuestion(qIdx, { helper: e.target.value })
                                          }
                                          placeholder="Texto de ajuda para o cliente (opcional)..."
                                          className="w-full text-[11px] text-slate-500 bg-transparent border-b border-slate-200 focus:border-slate-600 outline-none pb-0.5"
                                        />

                                        {/* Options preview for checkbox/radio/select */}
                                        {(q.type === 'checkbox' ||
                                          q.type === 'radio' ||
                                          q.type === 'select') && (
                                          <div className="pt-1.5 space-y-1.5">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                              Opções sugeridas:
                                            </span>
                                            <div className="flex flex-wrap gap-1.5">
                                              {(q.options || []).map((opt, optIdx) => (
                                                <span
                                                  key={optIdx}
                                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200"
                                                >
                                                  <span>{opt}</span>
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      const updatedOpts = (q.options || []).filter(
                                                        (_, idx) => idx !== optIdx
                                                      );
                                                      handleUpdateGeneratedQuestion(qIdx, {
                                                        options: updatedOpts,
                                                      });
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 cursor-pointer"
                                                  >
                                                    ×
                                                  </button>
                                                </span>
                                              ))}

                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newOpt = prompt('Digite o texto da nova opção:');
                                                  if (newOpt && newOpt.trim()) {
                                                    handleUpdateGeneratedQuestion(qIdx, {
                                                      options: [...(q.options || []), newOpt.trim()],
                                                    });
                                                  }
                                                }}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-slate-300 text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer"
                                              >
                                                <Plus className="w-3 h-3" />
                                                <span>Opção</span>
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Batch Actions */}
                            <div className="flex items-center justify-between pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setGeneratedQuestions([]);
                                  setSelectedGeneratedIds([]);
                                }}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Descartar Todas
                              </button>

                              <button
                                type="button"
                                onClick={handleAddSelectedAiQuestions}
                                disabled={selectedGeneratedIds.length === 0}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-40"
                              >
                                <ListPlus className="w-4 h-4" />
                                <span>
                                  Adicionar {selectedGeneratedIds.length} Pergunta(s) ao Segmento {selectedSegmentKey}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* List of Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-sm font-bold text-slate-800">
                        Perguntas Cadastradas ({currentSegment.questions.length})
                      </h3>
                      <span className="text-xs text-slate-400">
                        Arraste ou use as setas para alterar a ordem de exibição
                      </span>
                    </div>

                    {currentSegment.questions.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">
                          Nenhuma pergunta neste segmento
                        </p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">
                          Clique em &quot;Adicionar Pergunta&quot; para criar o primeiro campo.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(selectedSegmentKey)}
                          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                        >
                          Adicionar Pergunta Agora
                        </button>
                      </div>
                    ) : (
                      currentSegment.questions.map((q, qIndex) => {
                        const hasOptions =
                          q.type === 'checkbox' || q.type === 'radio' || q.type === 'select';

                        return (
                          <div
                            key={q.id}
                            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-4 hover:border-blue-200 transition-colors"
                          >
                            {/* Card Top: Order & Actions */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                {/* Up / Down Order */}
                                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(selectedSegmentKey, qIndex, 'up')}
                                    disabled={qIndex === 0}
                                    className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                                    title="Mover para cima"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveQuestion(selectedSegmentKey, qIndex, 'down')}
                                    disabled={qIndex === currentSegment.questions.length - 1}
                                    className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                                    title="Mover para baixo"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <span className="text-xs font-bold text-slate-400">
                                  Pergunta #{qIndex + 1}
                                </span>

                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                  {q.type}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setQuestionToDelete({
                                    segmentKey: selectedSegmentKey,
                                    questionId: q.id,
                                    label: q.label,
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir</span>
                              </button>
                            </div>

                            {/* Question Title & Type */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Texto da Pergunta
                                </label>
                                <input
                                  type="text"
                                  value={q.label}
                                  onChange={(e) =>
                                    handleUpdateQuestion(selectedSegmentKey, q.id, {
                                      label: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Tipo de Resposta
                                </label>
                                <select
                                  value={q.type}
                                  onChange={(e) =>
                                    handleUpdateQuestion(selectedSegmentKey, q.id, {
                                      type: e.target.value as any,
                                      options:
                                        e.target.value === 'text' || e.target.value === 'textarea'
                                          ? undefined
                                          : q.options || ['Opção 1', 'Opção 2', 'Outro'],
                                    })
                                  }
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:border-blue-600 outline-none"
                                >
                                  <option value="checkbox">Múltipla Seleção (Checkbox)</option>
                                  <option value="radio">Escolha Única (Radio)</option>
                                  <option value="select">Lista Suspensa (Select)</option>
                                  <option value="text">Texto Curto</option>
                                  <option value="textarea">Texto Longo</option>
                                </select>
                              </div>
                            </div>

                            {/* Helper / Subtitle */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Texto de Apoio / Instrução (Opcional)
                              </label>
                              <input
                                type="text"
                                value={q.helper || ''}
                                onChange={(e) =>
                                  handleUpdateQuestion(selectedSegmentKey, q.id, {
                                    helper: e.target.value,
                                  })
                                }
                                placeholder="Ex: Selecione todas as modalidades atendidas pelo estúdio."
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 focus:border-blue-600 outline-none"
                              />
                            </div>

                            {/* Options Editor (if checkbox, radio, or select) */}
                            {hasOptions && (
                              <div className="pt-3 border-t border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-slate-700">
                                    Opções de Seleção ({q.options?.length || 0})
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(selectedSegmentKey, q.id)}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Adicionar Opção</span>
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {(q.options || []).map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80"
                                    >
                                      <span className="text-[11px] font-bold text-slate-400 w-5 text-center">
                                        {optIdx + 1}.
                                      </span>

                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) =>
                                          handleUpdateOption(
                                            selectedSegmentKey,
                                            q.id,
                                            optIdx,
                                            e.target.value
                                          )
                                        }
                                        className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:border-blue-600 outline-none"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRemoveOption(selectedSegmentKey, q.id, optIdx)
                                        }
                                        className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                                        title="Remover opção"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>

                                {/* Custom "Outro" field settings */}
                                <div className="p-3 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2">
                                  <span className="text-xs font-bold text-blue-900 block">
                                    Configuração do Campo &quot;Outro&quot; (Personalizado)
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                        Rótulo da Opção Outro
                                      </label>
                                      <input
                                        type="text"
                                        value={q.otherLabel || ''}
                                        onChange={(e) =>
                                          handleUpdateQuestion(selectedSegmentKey, q.id, {
                                            otherLabel: e.target.value,
                                          })
                                        }
                                        placeholder="Ex: Outro tipo, Outro serviço"
                                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                        Placeholder da Caixa de Texto
                                      </label>
                                      <input
                                        type="text"
                                        value={q.otherPlaceholder || ''}
                                        onChange={(e) =>
                                          handleUpdateQuestion(selectedSegmentKey, q.id, {
                                            otherPlaceholder: e.target.value,
                                          })
                                        }
                                        placeholder="Ex: Qual outro tipo?"
                                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500">
                  Selecione um segmento na coluna à esquerda para editar suas perguntas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: COMPANY FIELDS ================= */}
        {activeTab === 'companyFields' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Campos da Etapa: Dados da Empresa
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reordene a posição dos campos (ex: mover CNPJ antes do Nome Fantasia), altere obrigatoriedade ou ative/desative.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Ordem dos Campos</span>
              </button>
            </div>

            <div className="space-y-3">
              {editableCompanyFields.map((field, idx) => (
                <div
                  key={field.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    field.enabled
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Move Up / Down */}
                    <div className="flex flex-col gap-0.5 shrink-0 bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveCompanyField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCompanyField(idx, 'down')}
                        disabled={idx === editableCompanyFields.length - 1}
                        className="p-1 rounded hover:bg-white text-slate-600 disabled:opacity-30 cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="w-6 text-center text-xs font-bold text-slate-400">
                      #{idx + 1}
                    </span>

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateCompanyFieldLabel(field.id, e.target.value)}
                        className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none w-full max-w-sm"
                      />
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Chave: <code className="bg-slate-100 px-1 py-0.5 rounded">{field.key}</code></span>
                        <span>•</span>
                        <span>Tipo: {field.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder input */}
                  <div className="w-full sm:w-72">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      Placeholder (Dica no campo)
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateCompanyFieldPlaceholder(field.id, e.target.value)}
                      placeholder="Dica no campo..."
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:border-blue-600 outline-none"
                    />
                  </div>

                  {/* Switches: Mandatory & Active */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleCompanyFieldRequired(field.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        field.required
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {field.required ? 'Obrigatório *' : 'Opcional'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleCompanyFieldEnabled(field.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        field.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {field.enabled ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Oculto</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SUBMISSIONS & COMPANIES ================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Empresas Cadastradas ({submissions.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Consulte os cadastros recebidos, edite dados operacionais (horários, agendamentos, facilidades) ou reenvie para a planilha.
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
                <p className="text-xs">Carregando dados das empresas...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nenhum envio recebido ainda</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Assim que um cliente concluir o formulário oficial de onboarding, todos os dados cadastrais, horários e facilidades estarão disponíveis para edição aqui.
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
                  const companyName = row['Nome fantasia'] || row['Razão social'] || 'Empresa sem nome';
                  const segment = row['Segmento'] || 'Geral';
                  const date = sub.timestamp ? new Date(sub.timestamp).toLocaleString('pt-BR') : '-';
                  const whatsapp = row['WhatsApp principal'] || row['Telefone fixo'] || '-';
                  const city = row['Cidade'] ? `${row['Cidade']}/${row['Estado'] || ''}` : '-';

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-bold text-base text-slate-900 truncate">
                            {companyName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {segment}
                          </span>
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

            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Google Apps Script Web App URL (Google Sheets)
                </label>
                <input
                  type="url"
                  value={editableSettings?.googleScriptUrl || ''}
                  onChange={(e) =>
                    setEditableSettings((prev: any) => ({ ...prev, googleScriptUrl: e.target.value }))
                  }
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Endpoint para envio automático de cada onboarding submetido.
                </span>
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
                    Script pronto que cria a aba Dashboard e gera uma aba individual para cada cliente (LW-01, LW-02...) sem duplicações.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const scriptCode = `/**
 * GOOGLE APPS SCRIPT - ONBOARDING LOCALWAY
 * Sistema Oficial com Dashboard Geral + Aba Individual por Cliente (LW-01, LW-02...)
 */

function doPost(e) {
  try {
    var rawData = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Extrair código do cliente (LW-01, LW-02...)
    var clientCode = rawData['Código do cliente'] || rawData.codigoCliente;
    var nomeFantasia = rawData['Nome fantasia'] || 'Cliente Sem Nome';
    
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
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
                    <li>Clique em <strong>Implantar</strong>, autorize o acesso do Google e copie a <strong>URL do app da web</strong> gerada para o campo acima.</li>
                  </ol>
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
