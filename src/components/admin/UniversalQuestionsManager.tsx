import React, { useState } from 'react';
import { UniversalQuestion, UniversalQuestionType, ManagedServiceConfig, ServiceId } from '../../types';
import { SegmentConfig, SegmentQuestion } from '../../constants/segments';
import { DEFAULT_SERVICES_CONFIG } from '../../constants/services';
import {
  FileQuestion,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  HelpCircle,
  Layers,
  Database,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';

interface UniversalQuestionsManagerProps {
  servicesConfig: Record<string, ManagedServiceConfig>;
  segmentsConfig: Record<string, SegmentConfig>;
  onUpdateServices: (updated: Record<string, ManagedServiceConfig>) => void;
  onUpdateSegments: (updated: Record<string, SegmentConfig>) => void;
  initialTarget?: 'service' | 'segment';
  initialServiceId?: string;
  initialSegmentKey?: string;
}

export const QUESTION_TYPES_METADATA: {
  type: UniversalQuestionType;
  label: string;
  description: string;
  hasOptions: boolean;
}[] = [
  { type: 'text', label: 'Texto Curto', description: 'Campo de texto simples em uma linha', hasOptions: false },
  { type: 'textarea', label: 'Texto Longo / Parágrafo', description: 'Área de texto para respostas detalhadas', hasOptions: false },
  { type: 'number', label: 'Número', description: 'Valores numéricos, quantidades ou prazos', hasOptions: false },
  { type: 'radio', label: 'Resposta Única (Radio)', description: 'O cliente seleciona apenas uma opção obrigatória', hasOptions: true },
  { type: 'checkbox', label: 'Múltipla Seleção (Checkbox)', description: 'O cliente pode marcar mais de uma opção', hasOptions: true },
  { type: 'yes_no', label: 'Sim ou Não', description: 'Seleção booleana direta entre Sim e Não', hasOptions: false },
  { type: 'date', label: 'Data', description: 'Seletor de data específica ou prazo final', hasOptions: false },
  { type: 'file', label: 'Upload de Arquivo', description: 'Envio de logotipo, fotos ou documentos em anexo', hasOptions: false },
  { type: 'select', label: 'Seleção Suspensa (Select)', description: 'Lista suspensa de opções', hasOptions: true },
];

export const UniversalQuestionsManager: React.FC<UniversalQuestionsManagerProps> = ({
  servicesConfig,
  segmentsConfig,
  onUpdateServices,
  onUpdateSegments,
  initialTarget = 'service',
  initialServiceId = 'google',
  initialSegmentKey,
}) => {
  const [scope, setScope] = useState<'service' | 'segment'>(initialTarget);

  const serviceKeys = Object.keys(servicesConfig || DEFAULT_SERVICES_CONFIG);
  const segmentKeys = Object.keys(segmentsConfig);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || serviceKeys[0] || 'google'
  );
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>(
    initialSegmentKey || segmentKeys[0] || 'Fotografia'
  );

  // Modal states for creating / editing questions
  const [editingQuestion, setEditingQuestion] = useState<UniversalQuestion | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  // Form states inside modal
  const [formLabel, setFormLabel] = useState('');
  const [formType, setFormType] = useState<UniversalQuestionType>('text');
  const [formHelper, setFormHelper] = useState('');
  const [formPlaceholder, setFormPlaceholder] = useState('');
  const [formRequired, setFormRequired] = useState(false);
  const [formEnabled, setFormEnabled] = useState(true);
  const [formOptions, setFormOptions] = useState<string[]>(['Opção 1', 'Opção 2']);
  const [newOptionInput, setNewOptionInput] = useState('');

  // Delete confirmation modal
  const [questionToDelete, setQuestionToDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  // Current questions list
  const currentService = servicesConfig[selectedServiceId] || DEFAULT_SERVICES_CONFIG[selectedServiceId];
  const currentSegment = segmentsConfig[selectedSegmentKey];

  const currentQuestions: UniversalQuestion[] = scope === 'service'
    ? (currentService?.questions || [])
    : (currentSegment?.questions || []).map((q: any) => ({
        id: q.id,
        label: q.label,
        type: (q.type as UniversalQuestionType) || 'text',
        placeholder: q.placeholder,
        helper: q.helper,
        required: q.required ?? false,
        enabled: q.enabled ?? true,
        options: q.options,
        order: q.order,
      }));

  // Reordering
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentQuestions.length) return;

    const reordered = [...currentQuestions];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    reordered.forEach((q, idx) => {
      q.order = idx + 1;
    });

    if (scope === 'service') {
      onUpdateServices({
        ...servicesConfig,
        [selectedServiceId]: {
          ...currentService,
          questions: reordered,
        },
      });
    } else {
      onUpdateSegments({
        ...segmentsConfig,
        [selectedSegmentKey]: {
          ...currentSegment,
          questions: reordered as SegmentQuestion[],
        },
      });
    }
  };

  // Toggle required
  const handleToggleRequired = (qId: string) => {
    const updated = currentQuestions.map((q) =>
      q.id === qId ? { ...q, required: !q.required } : q
    );
    if (scope === 'service') {
      onUpdateServices({
        ...servicesConfig,
        [selectedServiceId]: { ...currentService, questions: updated },
      });
    } else {
      onUpdateSegments({
        ...segmentsConfig,
        [selectedSegmentKey]: { ...currentSegment, questions: updated as SegmentQuestion[] },
      });
    }
  };

  // Toggle enabled
  const handleToggleEnabled = (qId: string) => {
    const updated = currentQuestions.map((q) =>
      q.id === qId ? { ...q, enabled: q.enabled === false ? true : false } : q
    );
    if (scope === 'service') {
      onUpdateServices({
        ...servicesConfig,
        [selectedServiceId]: { ...currentService, questions: updated },
      });
    } else {
      onUpdateSegments({
        ...segmentsConfig,
        [selectedSegmentKey]: { ...currentSegment, questions: updated as SegmentQuestion[] },
      });
    }
  };

  // Open modal for editing
  const handleOpenEdit = (q: UniversalQuestion) => {
    setEditingQuestion(q);
    setFormLabel(q.label);
    setFormType(q.type);
    setFormHelper(q.helper || '');
    setFormPlaceholder(q.placeholder || '');
    setFormRequired(Boolean(q.required));
    setFormEnabled(q.enabled !== false);
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ['Opção 1', 'Opção 2']);
  };

  // Open modal for adding
  const handleOpenAdd = () => {
    setIsCreatingQuestion(true);
    setEditingQuestion(null);
    setFormLabel('');
    setFormType('text');
    setFormHelper('');
    setFormPlaceholder('');
    setFormRequired(true);
    setFormEnabled(true);
    setFormOptions(['Opção 1', 'Opção 2']);
  };

  // Save Modal Form (Add or Edit)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) return;

    const hasOpts = ['radio', 'checkbox', 'select'].includes(formType);
    const validOptions = hasOpts ? formOptions.filter((o) => o.trim().length > 0) : undefined;

    if (editingQuestion) {
      // Edit existing
      const updatedList = currentQuestions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...q,
              label: formLabel.trim(),
              type: formType,
              helper: formHelper.trim() || undefined,
              placeholder: formPlaceholder.trim() || undefined,
              required: formRequired,
              enabled: formEnabled,
              options: validOptions,
            }
          : q
      );

      if (scope === 'service') {
        onUpdateServices({
          ...servicesConfig,
          [selectedServiceId]: { ...currentService, questions: updatedList },
        });
      } else {
        onUpdateSegments({
          ...segmentsConfig,
          [selectedSegmentKey]: { ...currentSegment, questions: updatedList as SegmentQuestion[] },
        });
      }
    } else {
      // Add new
      const newQ: UniversalQuestion = {
        id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        label: formLabel.trim(),
        type: formType,
        helper: formHelper.trim() || undefined,
        placeholder: formPlaceholder.trim() || undefined,
        required: formRequired,
        enabled: formEnabled,
        order: currentQuestions.length + 1,
        options: validOptions,
      };

      const updatedList = [...currentQuestions, newQ];

      if (scope === 'service') {
        onUpdateServices({
          ...servicesConfig,
          [selectedServiceId]: { ...currentService, questions: updatedList },
        });
      } else {
        onUpdateSegments({
          ...segmentsConfig,
          [selectedSegmentKey]: { ...currentSegment, questions: updatedList as SegmentQuestion[] },
        });
      }
    }

    setEditingQuestion(null);
    setIsCreatingQuestion(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!questionToDelete) return;
    const filtered = currentQuestions.filter((q) => q.id !== questionToDelete.id);

    if (scope === 'service') {
      onUpdateServices({
        ...servicesConfig,
        [selectedServiceId]: { ...currentService, questions: filtered },
      });
    } else {
      onUpdateSegments({
        ...segmentsConfig,
        [selectedSegmentKey]: { ...currentSegment, questions: filtered as SegmentQuestion[] },
      });
    }

    setQuestionToDelete(null);
  };

  // Options helpers inside modal
  const handleAddOption = () => {
    if (!newOptionInput.trim()) return;
    setFormOptions((prev) => [...prev, newOptionInput.trim()]);
    setNewOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    setFormOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateOption = (index: number, val: string) => {
    setFormOptions((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Sliders className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Gerenciamento Individual de Perguntas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure detalhadamente perguntas para qualquer um dos 13 Serviços da Localway ou para qualquer Segmento comercial. Suporte completo aos 8 tipos de respostas sem depender de IA.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-end sm:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Pergunta</span>
          </button>
        </div>

        {/* Scope Tabs & Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Escopo das Perguntas
            </label>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 w-full">
              <button
                type="button"
                onClick={() => setScope('service')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  scope === 'service'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Perguntas por Serviço ({serviceKeys.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('segment')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  scope === 'segment'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Perguntas por Segmento ({segmentKeys.length})</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              {scope === 'service' ? 'Selecione o Serviço' : 'Selecione o Segmento'}
            </label>
            {scope === 'service' ? (
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
              >
                {serviceKeys.map((key) => {
                  const svc = servicesConfig[key] || DEFAULT_SERVICES_CONFIG[key];
                  return (
                    <option key={key} value={key}>
                      {svc?.title || key} ({svc?.questions?.length || 0} perguntas)
                    </option>
                  );
                })}
              </select>
            ) : (
              <select
                value={selectedSegmentKey}
                onChange={(e) => setSelectedSegmentKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
              >
                {segmentKeys.map((key) => {
                  const seg = segmentsConfig[key];
                  return (
                    <option key={key} value={key}>
                      {seg.name || key} ({seg.questions?.length || 0} perguntas)
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {currentQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-3">
            <FileQuestion className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">
              Nenhuma pergunta cadastrada para este {scope === 'service' ? 'serviço' : 'segmento'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Clique no botão "Adicionar Pergunta" acima para criar perguntas personalizadas com qualquer um dos 8 tipos de resposta.
            </p>
          </div>
        ) : (
          currentQuestions.map((q, idx) => {
            const isEnabled = q.enabled !== false;
            const meta = QUESTION_TYPES_METADATA.find((t) => t.type === q.type) || {
              label: q.type,
              hasOptions: false,
            };

            return (
              <div
                key={q.id || idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === currentQuestions.length - 1}
                      className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-xs font-bold text-slate-400 pt-1 shrink-0">
                    #{idx + 1}
                  </span>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 leading-snug">
                        {q.label}
                      </span>
                      {q.required ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                          Obrigatória *
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          Opcional
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                        {meta.label}
                      </span>
                    </div>

                    {q.helper && (
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {q.helper}
                      </p>
                    )}

                    {q.options && q.options.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-400 font-medium">Opções:</span>
                        {q.options.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200/60"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Controls */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleRequired(q.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      q.required
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Alternar se a pergunta é obrigatória"
                  >
                    {q.required ? 'Obrigatória *' : 'Opcional'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(q.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                    }`}
                    title={isEnabled ? 'Desativar pergunta' : 'Ativar pergunta'}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(q)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Editar pergunta e opções"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuestionToDelete({ id: q.id, label: q.label })}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Excluir pergunta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Question */}
      {(isCreatingQuestion || editingQuestion) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingQuestion(null);
                  setIsCreatingQuestion(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enunciado da Pergunta *
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Qual é a principal prioridade do projeto?"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Resposta (8 Tipos Oficiais)
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as UniversalQuestionType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  >
                    {QUESTION_TYPES_METADATA.map((meta) => (
                      <option key={meta.type} value={meta.type}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formRequired}
                      onChange={(e) => setFormRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Obrigatória</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formEnabled}
                      onChange={(e) => setFormEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ativa no formulário</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Texto de Ajuda / Instrução (Helper)
                </label>
                <input
                  type="text"
                  value={formHelper}
                  onChange={(e) => setFormHelper(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Instrução curta para orientar o cliente sobre o que preencher..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placeholder / Exemplo de Preenchimento
                </label>
                <input
                  type="text"
                  value={formPlaceholder}
                  onChange={(e) => setFormPlaceholder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Digite aqui..."
                />
              </div>

              {/* Options Section for Radio / Checkbox / Select */}
              {['radio', 'checkbox', 'select'].includes(formType) && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Opções de Resposta ({formOptions.length})
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Edite ou adicione opções
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {formOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(idx)}
                          disabled={formOptions.length <= 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <input
                      type="text"
                      value={newOptionInput}
                      onChange={(e) => setNewOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder="Adicionar nova opção..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuestion(null);
                    setIsCreatingQuestion(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingQuestion ? 'Salvar Pergunta' : 'Adicionar Pergunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {questionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="p-2.5 rounded-2xl bg-red-50">
                <AlertCircle className="w-6 h-6" />
              </span>
              <div>
                <h4 className="font-bold text-base text-slate-900">Excluir Pergunta</h4>
                <p className="text-xs text-slate-500">Confirmação de segurança</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza que deseja excluir a pergunta:
              <br />
              <strong className="text-slate-800">"{questionToDelete.label}"</strong>?
              <br />
              Respostas já enviadas por clientes em submissões anteriores permanecerão salvas no histórico.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
