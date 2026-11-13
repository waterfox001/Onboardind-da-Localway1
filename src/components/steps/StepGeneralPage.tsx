import React, { useState, useRef } from 'react';
import { OnboardingData, DayOfWeek } from '../../types';
import {
  FormSchemaState,
  FormCategoryConfig,
  OnboardingFieldConfig,
  DEFAULT_CATEGORIES_CONFIG,
  DEFAULT_ONBOARDING_FIELDS,
  evaluateCondition,
} from '../../constants/formSchema';
import { TextInput, TextArea, Select, RadioGroup, CheckboxGroup } from '../FormControls';
import { StepSegmentDetails } from './StepSegmentDetails';
import { SharedCatalogSection } from '../SharedCatalogSection';
import {
  Building2,
  MapPin,
  Clock,
  Layers,
  CreditCard,
  UserCheck,
  PackagePlus,
  FolderUp,
  MessageCircleHeart,
  Plus,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  CloudUpload,
  Trash2,
  Upload,
} from 'lucide-react';

interface StepGeneralPageProps {
  pageId: 'general_company' | 'general_structure';
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  schema: FormSchemaState;
}

const DAYS_LABELS: { key: DayOfWeek; label: string }[] = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export const StepGeneralPage: React.FC<StepGeneralPageProps> = ({
  pageId,
  data,
  onChange,
  errors,
  schema,
}) => {
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'success' | 'not_found' | 'error'>('idle');
  const [cepMessage, setCepMessage] = useState('');
  const lastLookedUpCep = useRef<string>('');

  const categories: FormCategoryConfig[] = (
    schema.categoriesConfig && schema.categoriesConfig.length > 0
      ? schema.categoriesConfig
      : DEFAULT_CATEGORIES_CONFIG
  )
    .filter((c) => c.pageId === pageId)
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  const allFields: OnboardingFieldConfig[] = (
    schema.onboardingFields && schema.onboardingFields.length > 0
      ? schema.onboardingFields
      : DEFAULT_ONBOARDING_FIELDS
  )
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const getFieldValue = (field: OnboardingFieldConfig) => {
    const k = field.key || field.id;
    if (k in data) return (data as any)[k];
    return data.respostasPersonalizadas?.[field.id];
  };

  const setFieldValue = (field: OnboardingFieldConfig, val: any) => {
    const k = field.key || field.id;
    if (k in data) {
      onChange(k as keyof OnboardingData, val);
    } else {
      onChange('respostasPersonalizadas', {
        ...(data.respostasPersonalizadas || {}),
        [field.id]: val,
      });
    }
  };

  // CEP Auto-Lookup via ViaCEP (never blocks manual editing)
  const formatCep = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const lookupCep = async (cepValue: string) => {
    const digits = cepValue.replace(/\D/g, '');
    if (digits.length !== 8) return;
    if (lastLookedUpCep.current === digits && cepStatus === 'success') return;
    lastLookedUpCep.current = digits;

    setCepStatus('loading');
    setCepMessage('Buscando endereço pelo CEP...');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.erro) {
        setCepStatus('not_found');
        setCepMessage('CEP não localizado automaticamente. Preencha os campos manualmente.');
        return;
      }

      if (json.logradouro) onChange('ruaAvenida', json.logradouro);
      if (json.bairro) onChange('bairro', json.bairro);
      if (json.localidade) onChange('cidade', json.localidade);
      if (json.uf) onChange('estado', json.uf);

      setCepStatus('success');
      setCepMessage('Endereço preenchido pelo CEP! Você pode editar qualquer campo livremente.');
    } catch {
      setCepStatus('error');
      setCepMessage('Não foi possível consultar o CEP agora. Preencha o endereço manualmente.');
    }
  };

  const handleCepChange = (rawValue: string) => {
    const formatted = formatCep(rawValue);
    onChange('cep', formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length < 8) {
      setCepStatus('idle');
      setCepMessage('');
    } else if (digits.length === 8 && digits !== lastLookedUpCep.current) {
      lookupCep(digits);
    }
  };

  // Hours helpers
  const updateDayStatus = (day: DayOfWeek, status: 'aberto' | 'fechado') => {
    onChange('horarios', {
      ...data.horarios,
      [day]: {
        ...data.horarios[day],
        status,
      },
    });
  };

  const updateDayHours = (
    day: DayOfWeek,
    field: 'abertura1' | 'fechamento1' | 'abertura2' | 'fechamento2' | 'temIntervalo',
    val: unknown
  ) => {
    onChange('horarios', {
      ...data.horarios,
      [day]: {
        ...data.horarios[day],
        [field]: val,
      },
    });
  };

  const copyMondayToWeekdays = () => {
    const monday = data.horarios.segunda;
    const updated = { ...data.horarios };
    (['terca', 'quarta', 'quinta', 'sexta'] as DayOfWeek[]).forEach((d) => {
      updated[d] = { ...monday };
    });
    onChange('horarios', updated);
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'MapPin':
        return <MapPin className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5" />;
      case 'PackagePlus':
        return <PackagePlus className="w-5 h-5" />;
      case 'FolderUp':
        return <FolderUp className="w-5 h-5" />;
      case 'MessageCircleHeart':
        return <MessageCircleHeart className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  const renderField = (field: OnboardingFieldConfig) => {
    if (!field.enabled) return null;

    // Evaluate conditional rule against OnboardingData + custom answers
    if (!evaluateCondition(field.conditional, data as Record<string, any>)) {
      return null;
    }

    const fieldKey = field.key || field.id;
    const val = getFieldValue(field);
    const err = errors[fieldKey] || errors[field.id];
    const colClass = field.colSpan === 1 ? 'sm:col-span-1' : 'sm:col-span-2';

    // 1. Segment Select + Inline Segment Questions
    if (field.type === 'segment_select') {
      const segKeys = Object.keys(schema.segmentsConfig || {});
      const segmentOptions = [...segKeys, ...(segKeys.includes('Outro') ? [] : ['Outro'])];

      return (
        <div key={field.id} className="sm:col-span-2 space-y-4">
          <Select
            id={`field-${field.id}`}
            label={field.label}
            required={field.required}
            options={segmentOptions}
            value={data.segmento}
            onChange={(e) => onChange('segmento', e.target.value)}
            error={errors.segmento || err}
            helper={field.helper}
            placeholderOption="Selecione o segmento de atuação..."
          />

          {data.segmento === 'Outro' && (
            <TextInput
              id="company-outro-segmento"
              label="Qual é o seu segmento de atuação?"
              required
              placeholder="Ex: Clínica Veterinária, Energia Solar, Marcenaria..."
              value={data.outroSegmento}
              onChange={(e) => onChange('outroSegmento', e.target.value)}
              error={errors.outroSegmento}
            />
          )}

          {data.segmento && (
            <StepSegmentDetails
              data={data}
              onChange={onChange}
              errors={errors}
              segmentsConfig={schema.segmentsConfig}
              inline
            />
          )}
        </div>
      );
    }

    // 2. No Physical Address Toggle
    if (field.type === 'no_physical_toggle') {
      const checked = Boolean(data.enderecoSemLocalFisico);
      return (
        <div key={field.id} className="sm:col-span-2 space-y-2">
          <label
            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
              checked
                ? 'border-blue-600 bg-blue-50/50 text-blue-950 shadow-2xs'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 text-slate-700'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange('enderecoSemLocalFisico', e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">{field.label}</span>
              {field.helper && <span className="text-xs text-slate-500 block">{field.helper}</span>}
            </div>
          </label>
          {checked && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-800">
              Endereço presencial dispensado. Informe abaixo apenas a cidade e o estado onde sua empresa atua.
            </div>
          )}
        </div>
      );
    }

    // 3. CEP field with ViaCEP auto-lookup
    if (fieldKey === 'cep') {
      return (
        <div key={field.id} className={colClass}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-cep" className="text-sm font-semibold text-slate-800">
              {field.label}
              {field.required && <span className="text-blue-600 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="field-cep"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder={field.placeholder || '00000-000'}
                value={data.cep || ''}
                onChange={(e) => handleCepChange(e.target.value)}
                className={`flex-1 min-h-[48px] px-4 py-3 rounded-xl border bg-white text-slate-900 text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all ${
                  err ? 'border-red-500 bg-red-50/20' : 'border-slate-200/90 hover:border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => lookupCep(data.cep || '')}
                disabled={(data.cep || '').replace(/\D/g, '').length !== 8 || cepStatus === 'loading'}
                className="min-h-[48px] px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                title="Consultar endereço pelo CEP"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{cepStatus === 'loading' ? 'Buscando...' : 'Buscar CEP'}</span>
              </button>
            </div>
            {err ? (
              <span className="text-xs font-medium text-red-600">{err}</span>
            ) : cepStatus === 'success' && cepMessage ? (
              <span className="text-xs text-emerald-700 inline-flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                {cepMessage}
              </span>
            ) : (cepStatus === 'not_found' || cepStatus === 'error') && cepMessage ? (
              <span className="text-xs text-amber-700 inline-flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {cepMessage}
              </span>
            ) : field.helper ? (
              <span className="text-xs text-slate-500">{field.helper}</span>
            ) : null}
          </div>
        </div>
      );
    }

    // 4. Schedule Grid (Horários de Funcionamento Seg a Dom)
    if (field.type === 'schedule_grid') {
      return (
        <div key={field.id} className="sm:col-span-2 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-sm font-semibold text-slate-800 block">{field.label}</span>
              {field.helper && <span className="text-xs text-slate-500 block">{field.helper}</span>}
            </div>
            <button
              type="button"
              onClick={copyMondayToWeekdays}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Copiar horário de Seg para Sex
            </button>
          </div>

          <div className="space-y-2.5">
            {DAYS_LABELS.map(({ key, label }) => {
              const schedule = data.horarios[key];
              const isOpen = schedule.status === 'aberto';

              return (
                <div
                  key={key}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                    isOpen ? 'border-slate-200/90 bg-white' : 'border-slate-100 bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center justify-between sm:justify-start gap-4">
                      <span
                        className={`text-sm font-semibold w-32 ${
                          isOpen ? 'text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </span>

                      <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => updateDayStatus(key, 'aberto')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            isOpen ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Aberto
                        </button>
                        <button
                          type="button"
                          onClick={() => updateDayStatus(key, 'fechado')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                            !isOpen ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          Fechado
                        </button>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            value={schedule.abertura1 || '08:00'}
                            onChange={(e) => updateDayHours(key, 'abertura1', e.target.value)}
                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-400">às</span>
                          <input
                            type="time"
                            value={schedule.fechamento1 || '18:00'}
                            onChange={(e) => updateDayHours(key, 'fechamento1', e.target.value)}
                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {schedule.temIntervalo ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-slate-400 font-medium">e</span>
                            <input
                              type="time"
                              value={schedule.abertura2 || '14:00'}
                              onChange={(e) => updateDayHours(key, 'abertura2', e.target.value)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-slate-400">às</span>
                            <input
                              type="time"
                              value={schedule.fechamento2 || '18:00'}
                              onChange={(e) => updateDayHours(key, 'fechamento2', e.target.value)}
                              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => updateDayHours(key, 'temIntervalo', false)}
                              title="Remover intervalo"
                              className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateDayHours(key, 'temIntervalo', true)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-1 rounded bg-slate-50 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Intervalo</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Fechado o dia todo</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 5. Shared Catalog Section (Cadastro Compartilhado)
    if (
      field.type === 'shared_catalog' ||
      field.type === 'products_catalog' ||
      field.type === 'services_catalog'
    ) {
      return (
        <div key={field.id} className="sm:col-span-2">
          <SharedCatalogSection
            data={data}
            onChange={onChange}
            mode="general"
            filterType={
              field.type === 'products_catalog'
                ? 'produto'
                : field.type === 'services_catalog'
                ? 'servico'
                : 'all'
            }
            title={field.label}
            subtitle={field.helper}
          />
        </div>
      );
    }

    // 6. Standard & Custom Field Types
    if (field.type === 'textarea') {
      return (
        <div key={field.id} className={colClass}>
          <TextArea
            id={`field-${field.id}`}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            helper={field.helper}
            value={val || ''}
            onChange={(e) => setFieldValue(field, e.target.value)}
            error={err}
            rows={3}
          />
        </div>
      );
    }

    if (field.type === 'select') {
      return (
        <div key={field.id} className={colClass}>
          <Select
            id={`field-${field.id}`}
            label={field.label}
            required={field.required}
            options={field.options || []}
            value={val || ''}
            onChange={(e) => setFieldValue(field, e.target.value)}
            helper={field.helper}
            error={err}
          />
        </div>
      );
    }

    if (field.type === 'radio' || field.type === 'yes_no') {
      const opts = field.type === 'yes_no' ? ['Sim', 'Não'] : field.options || [];
      const showEstacionamentoOutro =
        fieldKey === 'estacionamento' && String(val) === 'Outro';

      return (
        <div key={field.id} className="sm:col-span-2 space-y-3">
          <RadioGroup
            label={field.label}
            name={`radio-${field.id}`}
            required={field.required}
            options={opts}
            value={val || ''}
            onChange={(v) => setFieldValue(field, v)}
            helper={field.helper}
            error={err}
            horizontal={opts.length <= 3}
          />
          {showEstacionamentoOutro && (
            <TextInput
              id="field-outro-estacionamento"
              label="Especifique sobre o estacionamento"
              placeholder="Descreva como funciona o estacionamento..."
              value={data.outroEstacionamento}
              onChange={(e) => onChange('outroEstacionamento', e.target.value)}
            />
          )}
        </div>
      );
    }

    if (field.type === 'checkbox') {
      const arr = Array.isArray(val) ? val : [];
      const showOutroAgendamento =
        fieldKey === 'formasAgendamento' && arr.includes('Outro');
      const showOutroPagamento =
        fieldKey === 'formasPagamento' && (arr.includes('Outros') || arr.includes('Outro'));
      const showOutraBandeira =
        fieldKey === 'bandeirasCartao' && (arr.includes('Outra') || arr.includes('Outros'));

      return (
        <div key={field.id} className="sm:col-span-2 space-y-3">
          <CheckboxGroup
            label={field.required ? `${field.label} *` : field.label}
            options={field.options || []}
            selectedValues={arr}
            onChange={(v) => setFieldValue(field, v)}
            helper={field.helper}
            columns={2}
          />
          {err && <span className="text-xs font-medium text-red-600 block">{err}</span>}

          {showOutroAgendamento && (
            <TextInput
              id="field-outro-agendamento"
              label="Qual outra forma de agendamento?"
              placeholder="Informe como é feito o agendamento..."
              value={data.outroAgendamento}
              onChange={(e) => onChange('outroAgendamento', e.target.value)}
            />
          )}
          {showOutroPagamento && (
            <TextInput
              id="field-outro-pagamento"
              label="Quais outras formas de pagamento?"
              placeholder="Ex: Vale-alimentação, link de pagamento..."
              value={data.outroPagamento}
              onChange={(e) => onChange('outroPagamento', e.target.value)}
            />
          )}
          {showOutraBandeira && (
            <TextInput
              id="field-outra-bandeira"
              label="Quais outras bandeiras de cartão?"
              placeholder="Ex: Sodexo, Alelo, Banricompras..."
              value={data.outraBandeiraCartao}
              onChange={(e) => onChange('outraBandeiraCartao', e.target.value)}
            />
          )}
        </div>
      );
    }

    if (field.type === 'file') {
      return (
        <div key={field.id} className="sm:col-span-2 space-y-2 p-4 rounded-xl border border-slate-200/90 bg-slate-50/70">
          <label className="block text-sm font-semibold text-slate-800">
            {field.label}
            {field.required && <span className="text-blue-600 ml-1">*</span>}
          </label>
          {field.helper && <p className="text-xs text-slate-500">{field.helper}</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              value={val || ''}
              onChange={(e) => setFieldValue(field, e.target.value)}
              placeholder={field.placeholder || 'Cole o link do arquivo ou anexe ao lado'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
            />
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Selecionar arquivo</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFieldValue(field, `Arquivo selecionado: ${f.name}`);
                }}
              />
            </label>
          </div>
          {err && <span className="text-xs font-medium text-red-600">{err}</span>}
        </div>
      );
    }

    if (field.type === 'repeatable') {
      const items: string[] = Array.isArray(val) ? val : [''];
      return (
        <div key={field.id} className="sm:col-span-2 space-y-2 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-800">
              {field.label}
              {field.required && <span className="text-blue-600 ml-1">*</span>}
            </span>
            <button
              type="button"
              onClick={() => setFieldValue(field, [...items, ''])}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Adicionar</span>
            </button>
          </div>
          <div className="space-y-2">
            {items.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={entry}
                  onChange={(e) => {
                    const copy = [...items];
                    copy[idx] = e.target.value;
                    setFieldValue(field, copy);
                  }}
                  placeholder={field.placeholder || `Item ${idx + 1}...`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFieldValue(field, items.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const inputType =
      field.type === 'email'
        ? 'email'
        : field.type === 'tel'
        ? 'tel'
        : field.type === 'url'
        ? 'url'
        : field.type === 'number'
        ? 'number'
        : field.type === 'date'
        ? 'date'
        : 'text';

    return (
      <div key={field.id} className={colClass}>
        <TextInput
          id={`field-${field.id}`}
          type={inputType}
          label={field.label}
          required={field.required}
          placeholder={field.placeholder}
          helper={field.helper}
          value={val || ''}
          onChange={(e) => setFieldValue(field, e.target.value)}
          error={err}
        />
      </div>
    );
  };

  // Group fields by categoryId for this pageId
  const transferNowUrl = schema.settings?.transferNowUrl || 'https://www.transfernow.net';

  const getFieldsForCategory = (catId: string) => {
    return allFields.filter((f) => {
      if (f.categoryId) return f.categoryId === catId;
      // Fallback mapping by stepId if field doesn't specify categoryId
      const inferredPage = ['structure', 'manager', 'materials', 'final_notes', 'general_structure'].includes(
        f.stepId
      )
        ? 'general_structure'
        : 'general_company';
      if (inferredPage !== pageId) return false;
      if (f.stepId === 'company') return catId === 'cat_company';
      if (f.stepId === 'address') return catId === 'cat_address';
      if (f.stepId === 'hours') return catId === 'cat_hours';
      if (f.stepId === 'structure') return catId === 'cat_structure';
      if (f.stepId === 'manager') return catId === 'cat_manager';
      if (f.stepId === 'materials') return catId === 'cat_materials';
      if (f.stepId === 'final_notes') return catId === 'cat_final_notes';
      return catId === categories[0]?.id;
    });
  };

  const pageHeader =
    pageId === 'general_company'
      ? {
          icon: <Building2 className="w-5 h-5" />,
          title: 'Dados da Empresa, Endereço e Horários',
          subtitle: 'Página 1 de 2 do Onboarding Geral — informe os dados base uma única vez para todos os serviços.',
        }
      : {
          icon: <Layers className="w-5 h-5" />,
          title: 'Estrutura, Pagamento, Responsável e Materiais',
          subtitle: 'Página 2 de 2 do Onboarding Geral — complete a estrutura, produtos/serviços compartilhados e arquivos.',
        };

  return (
    <div className="space-y-8" id={`step-${pageId}`}>
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">{pageHeader.icon}</div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">{pageHeader.title}</h2>
          <p className="text-xs sm:text-sm text-slate-500">{pageHeader.subtitle}</p>
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => {
          const catFields = getFieldsForCategory(cat.id);
          const visibleRendered = catFields.map((f) => renderField(f)).filter(Boolean);
          if (visibleRendered.length === 0) return null;

          return (
            <section
              key={cat.id}
              id={`section-${cat.id}`}
              className="p-4 sm:p-6 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-5"
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/70">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 text-blue-600 shadow-2xs">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{cat.title}</h3>
                  {cat.subtitle && <p className="text-xs text-slate-500">{cat.subtitle}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{visibleRendered}</div>

              {/* Helpful TransferNow upload banner inside Materials category when user has materials */}
              {cat.id === 'cat_materials' && data.possuiMateriais === 'Sim' && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-white border border-blue-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
                        <CloudUpload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Envie arquivos pesados sem perder qualidade (TransferNow até 5GB grátis)
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Gere o link no TransferNow ou compartilhe sua pasta do Google Drive nos campos acima.
                        </span>
                      </div>
                    </div>
                    <a
                      href={transferNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <span>Abrir TransferNow</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
