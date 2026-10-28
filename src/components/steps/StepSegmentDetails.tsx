import React from 'react';
import { OnboardingData } from '../../types';
import { SEGMENTS_CONFIG, SegmentConfig } from '../../constants/segments';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../FormControls';
import { Briefcase } from 'lucide-react';

interface StepSegmentDetailsProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  segmentsConfig?: Record<string, SegmentConfig>;
}

export const StepSegmentDetails: React.FC<StepSegmentDetailsProps> = ({
  data,
  onChange,
  segmentsConfig,
}) => {
  const allConfigs = segmentsConfig || SEGMENTS_CONFIG;
  const currentSegment = data.segmento || 'Fotografia';
  const config = allConfigs[currentSegment] || allConfigs['Fotografia'] || SEGMENTS_CONFIG['Fotografia'];

  const handleResponseChange = (questionId: string, val: any) => {
    onChange('segmentoRespostas', {
      ...data.segmentoRespostas,
      [questionId]: val,
    });
  };

  return (
    <div className="space-y-6" id="step-segment-details">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Detalhes de Atuação: {config.name}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {config.description}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {config.questions.map((q) => {
          const val = data.segmentoRespostas[q.id];

          if (q.type === 'checkbox') {
            const selectedArray = Array.isArray(val) ? val : [];
            const isOtherSelected = q.otherLabel && selectedArray.includes(q.otherLabel);

            return (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
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
                      value={data.segmentoRespostas[`${q.id}_outro`] || ''}
                      onChange={(e) => handleResponseChange(`${q.id}_outro`, e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          }

          if (q.type === 'radio') {
            const isOtherSelected = q.otherLabel && val === q.otherLabel;

            return (
              <div key={q.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80">
                <RadioGroup
                  label={q.label}
                  name={`seg-radio-${q.id}`}
                  options={q.options || []}
                  value={val || ''}
                  onChange={(v) => handleResponseChange(q.id, v)}
                  helper={q.helper}
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
                      value={data.segmentoRespostas[`${q.id}_outro`] || ''}
                      onChange={(e) => handleResponseChange(`${q.id}_outro`, e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                )}
              </div>
            );
          }

          if (q.type === 'textarea') {
            return (
              <TextArea
                key={q.id}
                id={`seg-${q.id}`}
                label={q.label}
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
              label={q.label}
              placeholder={q.placeholder}
              value={val || ''}
              onChange={(e) => handleResponseChange(q.id, e.target.value)}
              helper={q.helper}
            />
          );
        })}
      </div>
    </div>
  );
};
