import React from 'react';
import { LocalwayLogo } from './LocalwayLogo';
import { GoogleAccentDots } from './GoogleAccentDots';
import { StepDefinition } from '../types';
import { UserProfileMenu } from './UserProfileMenu';

interface HeaderProgressProps {
  currentStepIndex: number;
  totalSteps: number;
  currentStep: StepDefinition;
  onResetToCover?: () => void;
  onOpenAdmin?: (tab?: 'submissions' | 'fields' | 'segments' | 'settings') => void;
  onOpenManageQuestions?: () => void;
  isAuthenticated?: boolean;
}

export const HeaderProgress: React.FC<HeaderProgressProps> = ({
  currentStepIndex,
  totalSteps,
  currentStep,
  onResetToCover,
  onOpenAdmin,
  onOpenManageQuestions,
  isAuthenticated = false,
}) => {
  const percentage = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Localway (Minimalista no canto) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onResetToCover}
              className="text-left focus:outline-none rounded-xl p-1 -m-1 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Voltar para a tela inicial"
            >
              <LocalwayLogo size="sm" showBadgeBorder />
            </button>
            <div className="hidden sm:flex items-center pointer-events-none select-none">
              <GoogleAccentDots size="xs" />
            </div>
          </div>

          {/* Indicador de Etapa & User Profile Menu */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-800">
                <span className="text-blue-600 font-bold">
                  Etapa {currentStepIndex + 1} de {totalSteps}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-medium">{percentage}%</span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-[200px]">
                {currentStep.title}
              </p>
            </div>

            {onOpenManageQuestions && onOpenAdmin && (
              <UserProfileMenu
                onOpenManageQuestions={onOpenManageQuestions}
                onOpenAdminTab={(tab) => onOpenAdmin(tab)}
                isAuthenticated={isAuthenticated}
                onLogout={() => {
                  localStorage.removeItem('localway_admin_auth');
                  window.location.reload();
                }}
                onLoginRequest={() => onOpenAdmin('segments')}
              />
            )}
          </div>
        </div>

        {/* Barra de Progresso Suave */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </header>
  );
};
