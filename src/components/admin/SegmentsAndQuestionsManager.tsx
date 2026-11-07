import React, { useState } from 'react';
import { SegmentConfig, SegmentQuestion, QuestionType } from '../../constants/segments';
import {
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Eye,
  EyeOff,
  Check,
  X,
  Search,
  CheckSquare,
  Square,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderPlus,
  AlertCircle,
  Layers,
  Sliders,
} from 'lucide-react';

interface SegmentsAndQuestionsManagerProps {
  segments: Record<string, SegmentConfig>;
  onChange: (updatedSegments: Record<string, SegmentConfig>) => void;
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'text', label: 'Texto Curto' },
  { value: 'textarea', label: 'Texto Longo / Parágrafo' },
  { value: 'radio', label: 'Escolha Única' },
  { value: 'checkbox', label: 'Múltipla Escolha' },
  { value: 'select', label: 'Dropdown / Seleção' },
];

export const SegmentsAndQuestionsManager: React.FC<SegmentsAndQuestionsManagerProps> = ({
  segments,
  onChange,
}) => {
  const segmentKeys = Object.keys(segments);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>(
    segmentKeys[0] || 'Geral'
  );

  // Gemini AI Generator state
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(true);
  const [aiCommand, setAiCommand] = useState<string>('');
  const [aiTargetSegment, setAiTargetSegment] = useState<string>(selectedSegmentKey);
  const [aiCount, setAiCount] = useState<number>(10);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<SegmentQuestion[]>([]);
  const [detectedSegmentName, setDetectedSegmentName] = useState<string>('');

  // Segment CRUD modals / states
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentCategory, setNewSegmentCategory] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');

  const [editingSegmentKey, setEditingSegmentKey] = useState<string | null>(null);
  const [editSegmentName, setEditSegmentName] = useState('');
  const [editSegmentCategory, setEditSegmentCategory] = useState('');
  const [editSegmentDesc, setEditSegmentDesc] = useState('');

  // Question CRUD states
  const [editingQuestion, setEditingQuestion] = useState<SegmentQuestion | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState<Partial<SegmentQuestion>>({});
  const [questionOptionInput, setQuestionOptionInput] = useState('');

  const currentSegment = segments[selectedSegmentKey] || {
    name: selectedSegmentKey,
    category: 'Geral',
    description: '',
    questions: [],
    enabled: true,
  };

  // Keep target segment in sync with selected segment if needed
  React.useEffect(() => {
    if (selectedSegmentKey) {
      setAiTargetSegment(selectedSegmentKey);
    }
  }, [selectedSegmentKey]);

  // Handle Gemini AI Question Generation
  const handleGenerateQuestions = async () => {
    if (!aiCommand.trim() && !aiTargetSegment) {
      setAiError('Digite uma instrução ou selecione um segmento.');
      return;
    }

    setIsAiGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: aiCommand.trim(),
          segmentName: aiTargetSegment,
          count: aiCount,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
        if (data.segmentName) {
          setDetectedSegmentName(data.segmentName);
        }
      } else {
        throw new Error(data.error || 'Não foi possível gerar perguntas.');
      }
    } catch (err: any) {
      console.error('Error generating questions with Gemini:', err);
      setAiError(
        'Erro ao conectar com a IA do Gemini. Verifique a conexão do servidor ou tente novamente.'
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleUpdateGeneratedQuestion = (
    index: number,
    field: keyof SegmentQuestion,
    val: any
  ) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: val } : q))
    );
  };

  const handleRemoveGeneratedQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddGeneratedOption = (questionIndex: number, option: string) => {
    if (!option.trim()) return;
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const currentOpts = q.options || [];
        if (currentOpts.includes(option.trim())) return q;
        return { ...q, options: [...currentOpts, option.trim()] };
      })
    );
  };

  const handleRemoveGeneratedOption = (questionIndex: number, optIndex: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        return {
          ...q,
          options: (q.options || []).filter((_, oi) => oi !== optIndex),
        };
      })
    );
  };

  const handleApplyGeneratedQuestions = () => {
    if (generatedQuestions.length === 0) return;

    let targetKey = aiTargetSegment || detectedSegmentName || selectedSegmentKey;
    const updated = { ...segments };

    if (!updated[targetKey]) {
      // create segment if it doesn't exist
      updated[targetKey] = {
        name: targetKey,
        category: 'Comércio e Serviços',
        description: `Perguntas geradas por IA para ${targetKey}`,
        enabled: true,
        questions: [],
      };
    }

    const existingQuestions = updated[targetKey].questions || [];
    // Ensure unique IDs
    const newQuestionsFormatted: SegmentQuestion[] = generatedQuestions.map((q, idx) => ({
      ...q,
      id: `${targetKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_q_${Date.now()}_${idx}`,
      enabled: q.enabled ?? true,
      required: q.required ?? false,
    }));

    updated[targetKey] = {
      ...updated[targetKey],
      questions: [...existingQuestions, ...newQuestionsFormatted],
    };

    onChange(updated);
    setSelectedSegmentKey(targetKey);
    setGeneratedQuestions([]);
    setAiCommand('');
    alert(`${newQuestionsFormatted.length} perguntas aprovadas e adicionadas ao segmento "${targetKey}" com sucesso!`);
  };

  // Segment CRUD functions
  const handleSaveNewSegment = () => {
    const trimmed = newSegmentName.trim();
    if (!trimmed) return;
    if (segments[trimmed]) {
      alert('Já existe um segmento com esse nome.');
      return;
    }

    const updated = {
      ...segments,
      [trimmed]: {
        name: trimmed,
        category: newSegmentCategory.trim() || 'Geral',
        description: newSegmentDesc.trim() || '',
        enabled: true,
        questions: [],
      },
    };
    onChange(updated);
    setSelectedSegmentKey(trimmed);
    setIsCreatingSegment(false);
    setNewSegmentName('');
    setNewSegmentCategory('');
    setNewSegmentDesc('');
  };

  const handleSaveEditSegment = () => {
    if (!editingSegmentKey || !editSegmentName.trim()) return;
    const oldKey = editingSegmentKey;
    const newKey = editSegmentName.trim();

    const updated = { ...segments };
    const segData: SegmentConfig = updated[oldKey] || { questions: [], name: oldKey, category: 'Geral', description: '', enabled: true };

    if (oldKey !== newKey) {
      delete updated[oldKey];
      updated[newKey] = {
        ...segData,
        name: newKey,
        category: editSegmentCategory.trim() || segData.category || 'Geral',
        description: editSegmentDesc.trim() || segData.description || '',
      };
    } else {
      updated[oldKey] = {
        ...segData,
        name: newKey,
        category: editSegmentCategory.trim() || segData.category || 'Geral',
        description: editSegmentDesc.trim() || segData.description || '',
      };
    }

    onChange(updated);
    setSelectedSegmentKey(newKey);
    setEditingSegmentKey(null);
  };

  const handleDeleteSegment = (key: string) => {
    if (
      confirm(
        `Tem certeza de que deseja excluir o segmento "${key}"?\n\nImportante: Respostas de clientes já recebidas anteriormente continuarão salvas em histórico e não serão perdidas.`
      )
    ) {
      const updated = { ...segments };
      delete updated[key];
      onChange(updated);
      const remaining = Object.keys(updated);
      setSelectedSegmentKey(remaining[0] || '');
    }
  };

  const handleToggleSegmentEnabled = (key: string) => {
    const updated = { ...segments };
    if (updated[key]) {
      updated[key] = {
        ...updated[key],
        enabled: updated[key].enabled === false ? true : false,
      };
      onChange(updated);
    }
  };

  // Question CRUD functions
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const qList = [...(currentSegment.questions || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === qList.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = qList[index];
    qList[index] = qList[targetIdx];
    qList[targetIdx] = temp;

    const updated = {
      ...segments,
      [selectedSegmentKey]: {
        ...currentSegment,
        questions: qList,
      },
    };
    onChange(updated);
  };

  const handleToggleQuestionEnabled = (index: number) => {
    const qList = [...(currentSegment.questions || [])];
    const target = qList[index];
    qList[index] = { ...target, enabled: target.enabled === false ? true : false };

    const updated = {
      ...segments,
      [selectedSegmentKey]: {
        ...currentSegment,
        questions: qList,
      },
    };
    onChange(updated);
  };

  const handleToggleQuestionRequired = (index: number) => {
    const qList = [...(currentSegment.questions || [])];
    const target = qList[index];
    qList[index] = { ...target, required: !target.required };

    const updated = {
      ...segments,
      [selectedSegmentKey]: {
        ...currentSegment,
        questions: qList,
      },
    };
    onChange(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Tem certeza de que deseja remover esta pergunta deste segmento?')) {
      const qList = (currentSegment.questions || []).filter((_, i) => i !== index);
      const updated = {
        ...segments,
        [selectedSegmentKey]: {
          ...currentSegment,
          questions: qList,
        },
      };
      onChange(updated);
    }
  };

  const handleStartEditQuestion = (question: SegmentQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({ ...question });
    setIsCreatingQuestion(false);
  };

  const handleStartCreateQuestion = () => {
    setQuestionForm({
      id: `${selectedSegmentKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_q_${Date.now()}`,
      label: '',
      type: 'text',
      options: [],
      placeholder: '',
      helper: '',
      required: false,
      enabled: true,
    });
    setEditingQuestion(null);
    setIsCreatingQuestion(true);
  };

  const handleSaveQuestionForm = () => {
    if (!questionForm.label?.trim()) return;

    const qList = [...(currentSegment.questions || [])];

    if (isCreatingQuestion) {
      const newQ: SegmentQuestion = {
        id:
          questionForm.id ||
          `${selectedSegmentKey.toLowerCase().replace(/[^a-z0-9]/g, '_')}_q_${Date.now()}`,
        label: questionForm.label.trim(),
        type: questionForm.type || 'text',
        options: questionForm.options || [],
        placeholder: questionForm.placeholder?.trim() || '',
        helper: questionForm.helper?.trim() || '',
        required: Boolean(questionForm.required),
        enabled: questionForm.enabled ?? true,
        otherLabel: questionForm.otherLabel?.trim() || undefined,
      };
      qList.push(newQ);
    } else if (editingQuestion) {
      const idx = qList.findIndex((q) => q.id === editingQuestion.id);
      if (idx >= 0) {
        qList[idx] = {
          ...qList[idx],
          label: questionForm.label.trim(),
          type: questionForm.type || qList[idx].type,
          options: questionForm.options || qList[idx].options,
          placeholder: questionForm.placeholder ?? qList[idx].placeholder,
          helper: questionForm.helper ?? qList[idx].helper,
          required: questionForm.required ?? qList[idx].required,
          enabled: questionForm.enabled ?? qList[idx].enabled,
          otherLabel: questionForm.otherLabel?.trim() || undefined,
        };
      }
    }

    const updated = {
      ...segments,
      [selectedSegmentKey]: {
        ...currentSegment,
        questions: qList,
      },
    };
    onChange(updated);
    setEditingQuestion(null);
    setIsCreatingQuestion(false);
    setQuestionForm({});
    setQuestionOptionInput('');
  };

  const handleAddFormOption = () => {
    if (!questionOptionInput.trim()) return;
    const currentOpts = questionForm.options || [];
    if (!currentOpts.includes(questionOptionInput.trim())) {
      setQuestionForm({
        ...questionForm,
        options: [...currentOpts, questionOptionInput.trim()],
      });
    }
    setQuestionOptionInput('');
  };

  const handleRemoveFormOption = (index: number) => {
    const currentOpts = questionForm.options || [];
    setQuestionForm({
      ...questionForm,
      options: currentOpts.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: GERADOR DE PERGUNTAS COM IA (GEMINI) */}
      <div className="bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/50 rounded-2xl border border-blue-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100/70">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Gerador de Perguntas com IA (Gemini)
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Google Gemini 2.5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Gere automaticamente 10 perguntas genéricas, profissionais e relevantes para qualquer segmento comercial antes de salvá-las.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAiExpanded(!isAiExpanded)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            <span>{isAiExpanded ? 'Ocultar Painel' : 'Expandir Painel'}</span>
            {isAiExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {isAiExpanded && (
          <div className="p-5 sm:p-6 space-y-5 bg-white/80">
            {/* Command Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Comando em Linguagem Natural ou Segmento Comercial:
              </label>
              <textarea
                value={aiCommand}
                onChange={(e) => setAiCommand(e.target.value)}
                placeholder="Ex: Crie 10 perguntas estratégicas para lojas de móveis e eletrodomésticos, focando em formas de entrega, montagem, prazos e garantia..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
              />
            </div>

            {/* Target Segment & Count Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Segmento Alvo:</span>
                  <select
                    value={aiTargetSegment}
                    onChange={(e) => setAiTargetSegment(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {segmentKeys.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Quantidade:</span>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={5}>5 perguntas</option>
                    <option value={10}>10 perguntas (Recomendado)</option>
                    <option value={15}>15 perguntas</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateQuestions}
                disabled={isAiGenerating}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando com IA...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Gerar com IA (Gemini)</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{aiError}</span>
              </div>
            )}

            {/* Preview & Review Section for Generated Questions */}
            {generatedQuestions.length > 0 && (
              <div className="mt-4 pt-5 border-t border-blue-100 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                      <span>Revise as {generatedQuestions.length} Perguntas Geradas</span>
                      {detectedSegmentName && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                          {detectedSegmentName}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Você pode editar o título de cada pergunta, alterar o tipo, ajustar opções e excluir itens indesejados antes de aprovar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyGeneratedQuestions}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Check className="w-4 h-4" />
                    <span>Adicionar Perguntas Aprovadas ao Segmento</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {generatedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                            #{idx + 1}
                          </span>
                          <input
                            type="text"
                            value={q.label}
                            onChange={(e) =>
                              handleUpdateGeneratedQuestion(idx, 'label', e.target.value)
                            }
                            className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGeneratedQuestion(idx)}
                          title="Descartar esta pergunta"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question Configuration bar: Type, Options */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">Tipo:</span>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              handleUpdateGeneratedQuestion(
                                idx,
                                'type',
                                e.target.value as QuestionType
                              )
                            }
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Options pills if options exist */}
                        {['radio', 'checkbox', 'select'].includes(q.type) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(q.options || []).map((opt, oi) => (
                              <span
                                key={oi}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[11px] text-slate-700 border border-slate-200"
                              >
                                <span>{opt}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGeneratedOption(idx, oi)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}

                            <input
                              type="text"
                              placeholder="+ Opção"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddGeneratedOption(idx, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                              className="px-2 py-0.5 rounded border border-dashed border-slate-300 text-[11px] text-slate-700 w-24 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. BOTTOM SECTION: GERENCIAMENTO MANUAL DE SEGMENTOS E PERGUNTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Segments List Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Segmentos</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingSegment(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo</span>
              </button>
            </div>

            {/* List of Segments */}
            <div className="space-y-1.5 pt-3 max-h-[500px] overflow-y-auto">
              {segmentKeys.map((key) => {
                const seg = segments[key];
                const isSelected = selectedSegmentKey === key;
                const isEnabled = seg.enabled !== false;
                const qCount = seg.questions?.length || 0;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedSegmentKey(key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                        : isEnabled
                        ? 'bg-white border-slate-200/70 hover:bg-slate-50'
                        : 'bg-slate-50 border-slate-200/50 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {seg.name || key}
                        </span>
                        {!isEnabled && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">
                            Inativo
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {qCount} pergunta{qCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Toggle active */}
                      <button
                        type="button"
                        onClick={() => handleToggleSegmentEnabled(key)}
                        title={isEnabled ? 'Desativar segmento' : 'Ativar segmento'}
                        className={`p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer ${
                          isEnabled ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit segment name/category */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSegmentKey(key);
                          setEditSegmentName(seg.name || key);
                          setEditSegmentCategory(seg.category || '');
                          setEditSegmentDesc(seg.description || '');
                        }}
                        title="Editar segmento"
                        className="p-1 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete segment */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSegment(key)}
                        title="Excluir segmento"
                        className="p-1 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Questions for Selected Segment (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Perguntas de:</span>
                  <span className="text-blue-600">{currentSegment.name || selectedSegmentKey}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentSegment.description || 'Perguntas específicas apresentadas na etapa correspondente.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartCreateQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Pergunta Manual</span>
              </button>
            </div>

            {/* Questions list */}
            <div className="space-y-2.5 pt-4">
              {!currentSegment.questions || currentSegment.questions.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    Nenhuma pergunta cadastrada para este segmento ainda.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Gere automaticamente com o Gemini acima ou clique em "Nova Pergunta Manual".
                  </p>
                </div>
              ) : (
                currentSegment.questions.map((q, idx) => {
                  const isEnabled = q.enabled !== false;

                  return (
                    <div
                      key={q.id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isEnabled
                          ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                          : 'bg-slate-50 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        {/* Info & ordering */}
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(idx, 'down')}
                              disabled={idx === (currentSegment.questions?.length || 0) - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {q.label}
                              </span>
                              {q.required ? (
                                <span className="text-[9px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                  Obrigatória
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Opcional
                                </span>
                              )}
                              <span className="text-[9px] font-medium text-blue-600 bg-blue-50 border border-blue-200/50 px-1.5 py-0.5 rounded">
                                {QUESTION_TYPES.find((t) => t.value === q.type)?.label || q.type}
                              </span>
                              {!isEnabled && (
                                <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                  Oculta
                                </span>
                              )}
                            </div>

                            {q.helper && (
                              <p className="text-[11px] text-slate-500">{q.helper}</p>
                            )}

                            {q.options && q.options.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap pt-1">
                                {q.options.map((opt, oi) => (
                                  <span
                                    key={oi}
                                    className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
                                  >
                                    {opt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleQuestionRequired(idx)}
                            title={q.required ? 'Tornar Opcional' : 'Tornar Obrigatória'}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all cursor-pointer ${
                              q.required
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {q.required ? 'Obrigatória' : 'Opcional'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleQuestionEnabled(idx)}
                            title={isEnabled ? 'Ocultar pergunta' : 'Ativar pergunta'}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEditQuestion(q)}
                            title="Editar pergunta"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(idx)}
                            title="Excluir pergunta"
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create Segment */}
      {isCreatingSegment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Novo Segmento Comercial</h3>
              <button
                type="button"
                onClick={() => setIsCreatingSegment(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Segmento *
                </label>
                <input
                  type="text"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  placeholder="Ex: Clínicas e Saúde, Concessionárias..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={newSegmentCategory}
                  onChange={(e) => setNewSegmentCategory(e.target.value)}
                  placeholder="Ex: Saúde, Comércio, Serviços..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  value={newSegmentDesc}
                  onChange={(e) => setNewSegmentDesc(e.target.value)}
                  placeholder="Orientações sobre as perguntas deste segmento..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreatingSegment(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveNewSegment}
                disabled={!newSegmentName.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Criar Segmento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Segment */}
      {editingSegmentKey && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Editar Segmento</h3>
              <button
                type="button"
                onClick={() => setEditingSegmentKey(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Segmento *
                </label>
                <input
                  type="text"
                  value={editSegmentName}
                  onChange={(e) => setEditSegmentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={editSegmentCategory}
                  onChange={(e) => setEditSegmentCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={editSegmentDesc}
                  onChange={(e) => setEditSegmentDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingSegmentKey(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditSegment}
                disabled={!editSegmentName.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Question */}
      {(editingQuestion || isCreatingQuestion) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isCreatingQuestion ? 'Nova Pergunta para o Segmento' : 'Editar Pergunta'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsCreatingQuestion(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enunciado da Pergunta *
                </label>
                <input
                  type="text"
                  value={questionForm.label || ''}
                  onChange={(e) => setQuestionForm({ ...questionForm, label: e.target.value })}
                  placeholder="Ex: Quais são as principais especialidades ou serviços oferecidos?"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto de Ajuda / Instrução (Opcional)
                </label>
                <input
                  type="text"
                  value={questionForm.helper || ''}
                  onChange={(e) => setQuestionForm({ ...questionForm, helper: e.target.value })}
                  placeholder="Ex: Selecione todas as modalidades aplicáveis..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tipo de Resposta
                </label>
                <select
                  value={questionForm.type || 'text'}
                  onChange={(e) =>
                    setQuestionForm({
                      ...questionForm,
                      type: e.target.value as QuestionType,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options list for radio, checkbox, select */}
              {['radio', 'checkbox', 'select'].includes(questionForm.type || '') && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Opções de Resposta
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={questionOptionInput}
                      onChange={(e) => setQuestionOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFormOption();
                        }
                      }}
                      placeholder="Nova opção..."
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddFormOption}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>

                  {questionForm.options && questionForm.options.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {questionForm.options.map((opt, oi) => (
                        <span
                          key={oi}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFormOption(oi)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(questionForm.required)}
                    onChange={(e) => setQuestionForm({ ...questionForm, required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Obrigatória</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={questionForm.enabled ?? true}
                    onChange={(e) => setQuestionForm({ ...questionForm, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">Ativa</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsCreatingQuestion(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveQuestionForm}
                disabled={!questionForm.label?.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                Salvar Pergunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
