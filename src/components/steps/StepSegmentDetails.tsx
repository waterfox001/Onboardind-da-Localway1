import React from 'react';
import { OnboardingData } from '../../types';
import { SEGMENTS_CONFIG, SegmentConfig } from '../../constants/segments';
import { evaluateCondition } from '../../constants/formSchema';
import { TextInput, TextArea, RadioGroup, CheckboxGroup, Select } from '../FormControls';
import { Briefcase, Upload } from 'lucide-react';

interface StepSegmentDetailsProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  segmentsConfig?: Record<string, SegmentConfig>;
  inline?: boolean;
}

export const StepSegmentDetails: React.FC<StepSegmentDetailsProps> = ({
  data,
  onChange,
  segmentsConfig,
  inline = false,
}) => {
  const allConfigs = segmentsConfig || SEGMENTS_CONFIG || {};
  const currentSegment = data.segmento || '';
  if (!currentSegment && inline) return null;

  const resolvedSegment = currentSegment || 'Fotografia';
  const config =
    allConfigs[resolvedSegment] ||
    (resolvedSegment === 'Outro'
      ? {
          name: data.outroSegmento || 'Outro Segmento',
          description: 'Informações específicas da sua área de atuação.',
          questions: [],
        }
      : allConfigs['Fotografia'] ||
        SEGMENTS_CONFIG['Fotografia'] || {
          name: resolvedSegment || 'Geral',
          description: 'Informações específicas da área de atuação.',
          questions: [],
        });

  const questions = (Array.isArray(config.questions) ? config.questions : []).filter((q: any) => {
    if (q.enabled === false) return false;
    if (q.conditional) {
      return evaluateCondition(q.conditional, {
        ...data,
        ...(data.segmentoRespostas || {}),
      });
    }
    return true;
  });

  const handleResponseChange = (questionId: string, val: any) => {
    onChange('segmentoRespostas', {
      ...(data.segmentoRespostas || {}),
      [questionId]: val,
    });
  };

  if (inline && questions.length === 0) {
    return null;
  }

  return (
    <div
      className={
        inline
          ? 'p-4 sm:p-5 rounded-2xl bg-blue-50/40 border border-blue-200/80 space-y-4 animate-fadeIn'
          : 'space-y-6'
      }
      id={inline ? 'inline-segment-details' : 'step-segment-details'}
    >
      <div
        className={`flex items-center gap-3 ${
          inline ? 'pb-2 border-b border-blue-100' : 'pb-2 border-b border-slate-100'
        }`}
      >
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div>
          <h3 className={`${inline ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'} font-bold text-slate-900`}>
            Perguntas do Segmento: {config.name || resolvedSegment}
          </h3>
          <p className="text-xs text-slate-500">
            {config.description || 'Preencha os detalhes da sua atuação para personalizarmos os serviços.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Segmento selecionado: <strong>{resolvedSegment}</strong>
            </p>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Não há perguntas adicionais obrigatórias para este segmento. Você já pode prosseguir abaixo.
            </p>
          </div>
        ) : (
          questions.map((q: any) => {
            const val = data.segmentoRespostas?.[q.id];

            if (q.type === 'checkbox') {
              const selectedArray = Array.isArray(val) ? val : [];
              const isOtherSelected = q.otherLabel && selectedArray.includes(q.otherLabel);

              return (
                <div key={q.id} className="p-4 rounded-xl bg-white border border-slate-200/80">
                  <CheckboxGroup
                    label={q.label}
                    options={q.options || []}
                    selectedValues={selectedArray}
                    onChange={(v) => handleResponseChange(q.id, v)}
                    helper={q.helper}
                    columns={1}
                  />
                  {isOtherSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 animate-fadeIn">
                      <label
                        htmlFor={`seg-${q.id}-outro`}
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Qual?
                      </label>
                      <input
                        id={`seg-${q.id}-outro`}
                        type="text"
                        placeholder={q.otherPlaceholder || 'Especifique a opção que não estava na lista...'}
                        value={data.segmentoRespostas?.[`${q.id}_outro`] || ''}
                        onChange={(e) => handleResponseChange(`${q.id}_outro`, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            }

            if (q.type === 'radio' || q.type === 'yes_no') {
              const opts = q.type === 'yes_no' ? ['Sim', 'Não'] : q.options || [];
              const isOtherSelected = q.otherLabel && val === q.otherLabel;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-white border border-slate-200/80">
                  <RadioGroup
                    label={q.label}
                    name={`seg-radio-${q.id}`}
                    options={opts}
                    value={val || ''}
                    required={q.required}
                    onChange={(v) => handleResponseChange(q.id, v)}
                    helper={q.helper}
                    horizontal={q.type === 'yes_no'}
                  />
                  {isOtherSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 animate-fadeIn">
                      <label
                        htmlFor={`seg-${q.id}-outro`}
                        className="block text-xs font-semibold text-slate-700 mb-1.5"
                      >
                        Qual?
                      </label>
                      <input
                        id={`seg-${q.id}-outro`}
                        type="text"
                        placeholder={q.otherPlaceholder || 'Especifique a opção que não estava na lista...'}
                        value={data.segmentoRespostas?.[`${q.id}_outro`] || ''}
                        onChange={(e) => handleResponseChange(`${q.id}_outro`, e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                      />
                    </div>
                  )}
                </div>
              );
            }

            if (q.type === 'select') {
              return (
                <Select
                  key={q.id}
                  id={`seg-${q.id}`}
                  label={q.label}
                  required={q.required}
                  options={q.options || []}
                  value={val || ''}
                  onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  helper={q.helper}
                />
              );
            }

            if (q.type === 'file') {
              return (
                <div key={q.id} className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                  <label className="block text-sm font-semibold text-slate-800">{q.label}</label>
                  {q.helper && <p className="text-xs text-slate-500">{q.helper}</p>}
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      type="text"
                      value={val || ''}
                      onChange={(e) => handleResponseChange(q.id, e.target.value)}
                      placeholder={q.placeholder || 'Cole o link ou anexe o arquivo'}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Anexar</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleResponseChange(q.id, `Arquivo selecionado: ${f.name}`);
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }

            if (q.type === 'textarea') {
              return (
                <TextArea
                  key={q.id}
                  id={`seg-${q.id}`}
                  label={q.label}
                  required={q.required}
                  placeholder={q.placeholder}
                  value={val || ''}
                  onChange={(e) => handleResponseChange(q.id, e.target.value)}
                  helper={q.helper}
                  rows={3}
                />
              );
            }

            return (
              <TextInput
                key={q.id}
                id={`seg-${q.id}`}
                type={q.type === 'number' ? 'number' : q.type === 'date' ? 'date' : q.type === 'url' ? 'url' : 'text'}
                label={q.label}
                required={q.required}
                placeholder={q.placeholder}
                value={val || ''}
                onChange={(e) => handleResponseChange(q.id, e.target.value)}
                helper={q.helper}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
