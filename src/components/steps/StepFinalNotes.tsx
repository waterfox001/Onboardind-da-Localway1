import React from 'react';
import { OnboardingData } from '../../types';
import { TextArea } from '../FormControls';
import { MessageCircleHeart, Sparkles } from 'lucide-react';

interface StepFinalNotesProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const StepFinalNotes: React.FC<StepFinalNotesProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="step-final-notes">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <MessageCircleHeart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Observações Finais
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Alguma consideração extra ou detalhe especial para nossa equipe de especialistas?
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-100/60 text-blue-700 shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Sua experiência e visão sobre o seu próprio negócio são muito valiosas. Sinta-se à vontade para compartilhar qualquer expectativa, prazo específico, histórico de atendimento ou orientação que considere essencial.
        </p>
      </div>

      <TextArea
        id="final-observacoes"
        label="Existe mais alguma informação importante que gostaria de compartilhar conosco?"
        placeholder="Escreva aqui qualquer detalhe adicional, preferência de comunicação, alertas ou expectativas..."
        value={data.observacoesFinais}
        onChange={(e) => onChange('observacoesFinais', e.target.value)}
        rows={5}
      />
    </div>
  );
};
