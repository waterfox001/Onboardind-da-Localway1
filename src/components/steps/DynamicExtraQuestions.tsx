import React from 'react';
import { OnboardingData, UniversalQuestion } from '../../types';
import { evaluateCondition } from '../../constants/formSchema';
import { TextInput, TextArea, RadioGroup, CheckboxGroup, Select } from '../FormControls';
import { Plus, Trash2, Upload } from 'lucide-react';

interface DynamicExtraQuestionsProps {
  questions: UniversalQuestion[];
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors?: Record<string, string>;
  /**
   * Optional set of storageKeys already rendered natively by the module UI
   * so they aren't duplicated in the extra questions section.
   */
  nativeKeys?: Set<string>;
}

export const DynamicExtraQuestions: React.FC<DynamicExtraQuestionsProps> = ({
  questions,
  data,
  onChange,
  errors = {},
  nativeKeys,
}) => {
  const customQuestions = (questions || [])
    .filter((q) => {
      if (q.enabled === false) return false;
      const resolvedKey = q.storageKey || q.key || q.id;
      if (nativeKeys && nativeKeys.has(resolvedKey)) return false;
      return evaluateCondition(q.conditional, data as Record<string, any>);
    })
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  if (customQuestions.length === 0) return null;

  const getVal = (q: UniversalQuestion) => {
    const k = q.storageKey || q.key;
    if (k && k in data) return (data as any)[k];
    return data.respostasPersonalizadas?.[q.id];
  };

  const setVal = (q: UniversalQuestion, val: any) => {
    const k = q.storageKey || q.key;
    if (k && k in data) {
      onChange(k as keyof OnboardingData, val);
    } else {
      onChange('respostasPersonalizadas', {
        ...(data.respostasPersonalizadas || {}),
        [q.id]: val,
      });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      {customQuestions.map((q) => {
        const val = getVal(q);
        const err = errors[q.id] || errors[q.storageKey || ''];

        if (q.type === 'textarea') {
          return (
            <TextArea
              key={q.id}
              id={`dyn-${q.id}`}
              label={q.label}
              required={q.required}
              placeholder={q.placeholder}
              helper={q.helper}
              value={val || ''}
              onChange={(e) => setVal(q, e.target.value)}
              error={err}
              rows={3}
            />
          );
        }

        if (q.type === 'yes_no') {
          return (
            <RadioGroup
              key={q.id}
              label={q.label}
              name={`dyn-yn-${q.id}`}
              required={q.required}
              options={['Sim', 'Não']}
              value={val || ''}
              onChange={(v) => setVal(q, v)}
              helper={q.helper}
              error={err}
              horizontal
            />
          );
        }

        if (q.type === 'radio') {
          return (
            <RadioGroup
              key={q.id}
              label={q.label}
              name={`dyn-radio-${q.id}`}
              required={q.required}
              options={q.options || []}
              value={val || ''}
              onChange={(v) => setVal(q, v)}
              helper={q.helper}
              error={err}
            />
          );
        }

        if (q.type === 'checkbox') {
          return (
            <div key={q.id} className="space-y-1.5">
              <CheckboxGroup
                label={q.label}
                options={q.options || []}
                selectedValues={Array.isArray(val) ? val : []}
                onChange={(v) => setVal(q, v)}
                helper={q.helper}
                columns={2}
              />
              {err && <span className="text-xs font-medium text-red-600">{err}</span>}
            </div>
          );
        }

        if (q.type === 'select') {
          return (
            <Select
              key={q.id}
              id={`dyn-${q.id}`}
              label={q.label}
              required={q.required}
              options={q.options || []}
              value={val || ''}
              onChange={(e) => setVal(q, e.target.value)}
              helper={q.helper}
              error={err}
            />
          );
        }

        if (q.type === 'file') {
          return (
            <div key={q.id} className="space-y-2 p-4 rounded-xl border border-slate-200/90 bg-slate-50/70">
              <label className="block text-sm font-semibold text-slate-800">
                {q.label}
                {q.required && <span className="text-blue-600 ml-1">*</span>}
              </label>
              {q.helper && <p className="text-xs text-slate-500">{q.helper}</p>}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="text"
                  value={val || ''}
                  onChange={(e) => setVal(q, e.target.value)}
                  placeholder={q.placeholder || 'Cole o link do arquivo ou selecione um anexo ao lado'}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Anexar</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setVal(q, `Arquivo selecionado: ${f.name}`);
                    }}
                  />
                </label>
              </div>
              {err && <span className="text-xs font-medium text-red-600">{err}</span>}
            </div>
          );
        }

        if (q.type === 'repeatable') {
          const items: string[] = Array.isArray(val) ? val : [''];
          return (
            <div key={q.id} className="space-y-2 p-4 rounded-xl border border-slate-200/90 bg-slate-50/50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">
                  {q.label}
                  {q.required && <span className="text-blue-600 ml-1">*</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setVal(q, [...items, ''])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Adicionar</span>
                </button>
              </div>
              {q.helper && <p className="text-xs text-slate-500">{q.helper}</p>}
              <div className="space-y-2">
                {items.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={entry}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = e.target.value;
                        setVal(q, copy);
                      }}
                      placeholder={q.placeholder || 'Digite uma resposta...'}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setVal(q, items.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {err && <span className="text-xs font-medium text-red-600">{err}</span>}
            </div>
          );
        }

        const inputType =
          q.type === 'number'
            ? 'number'
            : q.type === 'date'
            ? 'date'
            : q.type === 'url'
            ? 'url'
            : 'text';

        return (
          <TextInput
            key={q.id}
            id={`dyn-${q.id}`}
            type={inputType}
            label={q.label}
            required={q.required}
            placeholder={q.placeholder}
            helper={q.helper}
            value={val || ''}
            onChange={(e) => setVal(q, e.target.value)}
            error={err}
          />
        );
      })}
    </div>
  );
};
