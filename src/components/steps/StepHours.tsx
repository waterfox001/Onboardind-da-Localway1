import React from 'react';
import { OnboardingData, DayOfWeek } from '../../types';
import { RadioGroup, CheckboxGroup, TextInput } from '../FormControls';
import { Clock, Calendar, Plus, X } from 'lucide-react';

interface StepHoursProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
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

export const StepHours: React.FC<StepHoursProps> = ({
  data,
  onChange,
  errors,
}) => {
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

  return (
    <div className="space-y-6" id="step-hours">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Horário de Funcionamento
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={copyMondayToWeekdays}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Copiar horário de Seg para Sex
        </button>
      </div>

      {/* Grid com cada dia da semana */}
      <div className="space-y-3">
        {DAYS_LABELS.map(({ key, label }) => {
          const schedule = data.horarios[key];
          const isOpen = schedule.status === 'aberto';

          return (
            <div
              key={key}
              className={`p-3 sm:p-4 rounded-xl border transition-all ${
                isOpen ? 'border-slate-200/90 bg-white' : 'border-slate-100 bg-slate-50/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Nome do dia e status */}
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className={`text-sm font-semibold w-32 ${isOpen ? 'text-slate-900' : 'text-slate-500'}`}>
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

                {/* Campos de horários se aberto */}
                {isOpen ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
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

                    {/* Intervalo de almoço */}
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

      {/* Agendamento */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            A empresa trabalha com agendamento?
          </h3>
        </div>

        <RadioGroup
          label="Os clientes precisam ou costumam agendar horário?"
          name="trabalha-agendamento"
          required
          options={['Sim', 'Não']}
          value={data.trabalhaAgendamento}
          onChange={(v) => onChange('trabalhaAgendamento', v)}
          error={errors.trabalhaAgendamento}
          horizontal
        />

        {data.trabalhaAgendamento === 'Sim' && (
          <div className="space-y-4 p-4 rounded-2xl bg-blue-50/40 border border-blue-100">
            <CheckboxGroup
              label="Como os clientes fazem o agendamento?"
              options={['WhatsApp', 'Telefone', 'Site', 'Link externo', 'Outro']}
              selectedValues={data.formasAgendamento}
              onChange={(v) => onChange('formasAgendamento', v)}
            />

            {data.formasAgendamento.includes('Outro') && (
              <TextInput
                id="hours-outro-agendamento"
                label="Qual outra forma de agendamento?"
                placeholder="Informe como é feito o agendamento..."
                value={data.outroAgendamento}
                onChange={(e) => onChange('outroAgendamento', e.target.value)}
              />
            )}

            <TextInput
              id="hours-contato-link-agendamento"
              label="Informe o contato ou link utilizado para agendamento"
              placeholder="Ex: https://calendly.com/suaempresa ou número (11) 90000-0000"
              value={data.contatoLinkAgendamento}
              onChange={(e) => onChange('contatoLinkAgendamento', e.target.value)}
              helper="Link ou telefone que será configurado nos botões e chamadas de ação"
            />
          </div>
        )}
      </div>
    </div>
  );
};
