import React, { useState } from 'react';
import { OnboardingFieldConfig, StepCategory } from '../../constants/formSchema';
import {
  Sliders,
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
  Filter,
  CheckSquare,
  Sparkles,
  HelpCircle,
  Building,
  MapPin,
  Clock,
  Layers,
  UserCheck,
  FolderUp,
  MessageCircleHeart,
  ChevronRight,
} from 'lucide-react';

interface OnboardingFieldsManagerProps {
  fields: OnboardingFieldConfig[];
  onChange: (updatedFields: OnboardingFieldConfig[]) => void;
}

const STEP_TABS: { id: StepCategory | 'all'; label: string; icon: any }[] = [
  { id: 'all', label: 'Todos os Campos', icon: Sliders },
  { id: 'company', label: '1. Empresa', icon: Building },
  { id: 'address', label: '2. Endereço', icon: MapPin },
  { id: 'hours', label: '3. Horários & Agendamento', icon: Clock },
  { id: 'structure', label: '4. Estrutura & Pagamentos', icon: Layers },
  { id: 'manager', label: '5. Responsável', icon: UserCheck },
  { id: 'materials', label: '6. Materiais', icon: FolderUp },
  { id: 'final_notes', label: '7. Observações', icon: MessageCircleHeart },
];

const FIELD_TYPES: { value: OnboardingFieldConfig['type']; label: string }[] = [
  { value: 'text', label: 'Texto Curto' },
  { value: 'textarea', label: 'Texto Longo / Parágrafo' },
  { value: 'email', label: 'E-mail' },
  { value: 'tel', label: 'Telefone / WhatsApp' },
  { value: 'radio', label: 'Escolha Única (Opções)' },
  { value: 'checkbox', label: 'Múltipla Escolha (Caixas)' },
  { value: 'select', label: 'Menu Suspenso (Dropdown)' },
];

export const OnboardingFieldsManager: React.FC<OnboardingFieldsManagerProps> = ({
  fields,
  onChange,
}) => {
  const [selectedTab, setSelectedTab] = useState<StepCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingField, setEditingField] = useState<OnboardingFieldConfig | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New / Editing form state
  const [fieldForm, setFieldForm] = useState<Partial<OnboardingFieldConfig>>({});
  const [optionInput, setOptionInput] = useState('');

  const filteredFields = fields.filter((f) => {
    const matchesTab = selectedTab === 'all' || f.stepId === selectedTab;
    const matchesSearch =
      !searchQuery ||
      f.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.helper && f.helper.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const handleToggleEnabled = (id: string) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    onChange(updated);
  };

  const handleToggleRequired = (id: string) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, required: !f.required } : f));
    onChange(updated);
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex((f) => f.id === id);
    if (index < 0) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIdx];
    newFields[targetIdx] = temp;

    // reindex order
    newFields.forEach((f, i) => {
      f.order = i + 1;
    });

    onChange(newFields);
  };

  const handleStartEdit = (field: OnboardingFieldConfig) => {
    setEditingField(field);
    setFieldForm({ ...field });
    setIsCreatingNew(false);
  };

  const handleStartCreate = () => {
    const stepTarget = selectedTab === 'all' ? 'company' : selectedTab;
    setFieldForm({
      id: `custom_${Date.now()}`,
      label: '',
      type: 'text',
      placeholder: '',
      helper: '',
      required: false,
      enabled: true,
      stepId: stepTarget,
      order: fields.length + 1,
      options: [],
    });
    setEditingField(null);
    setIsCreatingNew(true);
  };

  const handleSaveFieldForm = () => {
    if (!fieldForm.label?.trim()) return;

    if (isCreatingNew) {
      const fieldKey = fieldForm.key || fieldForm.id || `custom_${Date.now()}`;
      const newField: OnboardingFieldConfig = {
        id: fieldForm.id || fieldKey,
        key: fieldKey,
        label: fieldForm.label.trim(),
        type: fieldForm.type || 'text',
        placeholder: fieldForm.placeholder?.trim() || '',
        helper: fieldForm.helper?.trim() || '',
        required: Boolean(fieldForm.required),
        enabled: fieldForm.enabled ?? true,
        stepId: (fieldForm.stepId as StepCategory) || 'company',
        category: STEP_TABS.find((t) => t.id === fieldForm.stepId)?.label || 'Campos Personalizados',
        order: fields.length + 1,
        options: fieldForm.options || [],
      };
      onChange([...fields, newField]);
    } else if (editingField) {
      const updated = fields.map((f) => {
        if (f.id === editingField.id) {
          return {
            ...f,
            label: fieldForm.label!.trim(),
            type: fieldForm.type || f.type,
            placeholder: fieldForm.placeholder ?? f.placeholder,
            helper: fieldForm.helper ?? f.helper,
            required: fieldForm.required ?? f.required,
            enabled: fieldForm.enabled ?? f.enabled,
            stepId: (fieldForm.stepId as StepCategory) || f.stepId,
            options: fieldForm.options || f.options,
          };
        }
        return f;
      });
      onChange(updated);
    }

    setEditingField(null);
    setIsCreatingNew(false);
    setFieldForm({});
    setOptionInput('');
  };

  const handleDeleteCustomField = (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este campo? As respostas anteriores continuarão salvas no histórico.')) {
      onChange(fields.filter((f) => f.id !== id));
      if (editingField?.id === id) {
        setEditingField(null);
      }
    }
  };

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    const currentOptions = fieldForm.options || [];
    if (!currentOptions.includes(optionInput.trim())) {
      setFieldForm({
        ...fieldForm,
        options: [...currentOptions, optionInput.trim()],
      });
    }
    setOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = fieldForm.options || [];
    setFieldForm({
      ...fieldForm,
      options: currentOptions.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header card with explanation & New button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Catálogo Geral de Campos do Onboarding
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalize títulos, textos de ajuda, obrigatoriedade e visibilidade dos campos. Ocultar um campo não apaga dados preenchidos anteriormente.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Campo Personalizado</span>
        </button>
      </div>

      {/* Step Tabs Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STEP_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          const count =
            tab.id === 'all'
              ? fields.length
              : fields.filter((f) => f.stepId === tab.id).length;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar campo por nome, identificador ou texto de ajuda..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fields List */}
      <div className="space-y-2.5">
        {filteredFields.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum campo encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Tente ajustar a busca ou trocar a etapa selecionada.</p>
          </div>
        ) : (
          filteredFields.map((field, idx) => {
            const isEditing = editingField?.id === field.id;

            return (
              <div
                key={field.id}
                className={`bg-white rounded-2xl border transition-all ${
                  isEditing
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                    : field.enabled
                    ? 'border-slate-200/90 shadow-xs hover:border-slate-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                } p-4 sm:p-5`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(field.id, 'up')}
                        disabled={idx === 0}
                        title="Subir ordem"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(field.id, 'down')}
                        disabled={idx === filteredFields.length - 1}
                        title="Descer ordem"
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {field.label}
                        </span>
                        {field.required ? (
                          <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
                            Obrigatório
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Opcional
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200/50 px-2 py-0.5 rounded-md">
                          {FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type}
                        </span>
                        {!field.enabled && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            Oculto no onboarding
                          </span>
                        )}
                      </div>

                      {field.helper && (
                        <p className="text-xs text-slate-500 line-clamp-1">{field.helper}</p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                        <span>
                          Etapa:{' '}
                          <strong className="text-slate-600 font-semibold">
                            {STEP_TABS.find((t) => t.id === field.stepId)?.label || field.stepId}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">id: {field.id}</span>
                        {field.options && field.options.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{field.options.length} opções configuradas</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Toggle Required */}
                    <button
                      type="button"
                      onClick={() => handleToggleRequired(field.id)}
                      title={field.required ? 'Tornar Opcional' : 'Tornar Obrigatório'}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        field.required
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {field.required ? 'Obrigatório' : 'Opcional'}
                    </button>

                    {/* Toggle Active / Hidden */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(field.id)}
                      title={field.enabled ? 'Ocultar do onboarding' : 'Ativar no onboarding'}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        field.enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {field.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => handleStartEdit(field)}
                      title="Editar campo completo"
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete custom button if custom */}
                    {field.id.startsWith('custom_') && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomField(field.id)}
                        title="Excluir campo personalizado"
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / Create Modal */}
      {(editingField || isCreatingNew) && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 sm:p-7 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {isCreatingNew ? 'Novo Campo do Onboarding' : 'Editar Campo'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    As configurações serão salvas e refletirão diretamente no fluxo do cliente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingField(null);
                  setIsCreatingNew(false);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
              {/* Título / Rótulo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Campo (Label) *
                </label>
                <input
                  type="text"
                  value={fieldForm.label || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
                  placeholder="Ex: Nome da Empresa, Responsável..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Descrição / Texto de Ajuda */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto de Ajuda ou Descrição
                </label>
                <textarea
                  value={fieldForm.helper || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, helper: e.target.value })}
                  placeholder="Ex: Como a empresa é conhecida pelo público..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Placeholder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Texto de Exemplo (Placeholder)
                </label>
                <input
                  type="text"
                  value={fieldForm.placeholder || ''}
                  onChange={(e) => setFieldForm({ ...fieldForm, placeholder: e.target.value })}
                  placeholder="Ex: Digite aqui..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Etapa e Tipo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Etapa em que aparece
                  </label>
                  <select
                    value={fieldForm.stepId || 'company'}
                    onChange={(e) =>
                      setFieldForm({ ...fieldForm, stepId: e.target.value as StepCategory })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="company">1. Dados da Empresa</option>
                    <option value="address">2. Endereço Comercial</option>
                    <option value="hours">3. Horários & Agendamento</option>
                    <option value="structure">4. Estrutura & Pagamentos</option>
                    <option value="manager">5. Responsável pelo Projeto</option>
                    <option value="materials">6. Envio de Materiais</option>
                    <option value="final_notes">7. Observações Finais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Resposta
                  </label>
                  <select
                    value={fieldForm.type || 'text'}
                    onChange={(e) =>
                      setFieldForm({
                        ...fieldForm,
                        type: e.target.value as OnboardingFieldConfig['type'],
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Se o tipo requer opções (radio, checkbox, select) */}
              {['radio', 'checkbox', 'select'].includes(fieldForm.type || '') && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Opções de Resposta
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                      placeholder="Adicionar nova opção..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  {fieldForm.options && fieldForm.options.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fieldForm.options.map((opt, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs"
                        >
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(i)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">
                      Nenhuma opção definida ainda.
                    </p>
                  )}
                </div>
              )}

              {/* Toggles: Obrigatório e Ativo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={Boolean(fieldForm.required)}
                    onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Campo Obrigatório
                    </span>
                    <span className="text-[10px] text-slate-500">
                      O cliente precisará preencher para avançar
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={fieldForm.enabled ?? true}
                    onChange={(e) => setFieldForm({ ...fieldForm, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Ativo no Onboarding
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Se desmarcado, fica oculto aos clientes
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingField(null);
                  setIsCreatingNew(false);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFieldForm}
                disabled={!fieldForm.label?.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Campo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
