import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  nextLabel,
  backLabel = 'Voltar',
}) => {
  return (
    <div className="w-full pt-8 pb-4 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-8">
      {/* Botão Voltar */}
      {!isFirstStep && onBack ? (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          id="btn-step-back"
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>{backLabel}</span>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Botão Continuar / Enviar */}
      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        id="btn-step-next"
        className={`w-full sm:w-auto min-w-[160px] min-h-[50px] px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-60 ${
          isLastStep
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Enviando suas informações...</span>
          </>
        ) : isLastStep ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>{nextLabel || 'Enviar informações'}</span>
          </>
        ) : (
          <>
            <span>{nextLabel || 'Continuar'}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
