import React from 'react';
import { motion } from 'motion/react';
import { LocalwayLogo } from './LocalwayLogo';
import { ArrowRight } from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';

interface WelcomeCoverProps {
  onStart: () => void;
  onOpenAdmin: (tab?: 'submissions' | 'fields' | 'segments' | 'settings') => void;
  onOpenManageQuestions: () => void;
  isAuthenticated: boolean;
  hasDraft?: boolean;
}

export const WelcomeCover: React.FC<WelcomeCoverProps> = ({
  onStart,
  onOpenAdmin,
  onOpenManageQuestions,
  isAuthenticated,
  hasDraft,
}) => {
  return (
    <div
      className="relative min-h-[92vh] w-full flex flex-col justify-between px-6 sm:px-12 py-8 sm:py-12 overflow-hidden bg-[#FAFAFA] select-none"
      id="welcome-cover-screen"
    >
      {/* ================= FLOATING AMBIENT DOTS & HAIRLINES ================= */}
      {/* Left blue floating dot */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          x: [-3, 3, -3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-[6%] top-[24%] w-3.5 h-3.5 rounded-full bg-[#3B82F6] pointer-events-none shadow-sm"
      />

      {/* Top right red floating dot */}
      <motion.div
        animate={{
          y: [5, -5, 5],
          x: [2, -2, 2],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-[8%] top-[17%] w-3 h-3 rounded-full bg-[#EF4444] pointer-events-none opacity-90 shadow-sm"
      />

      {/* Bottom left green floating dot */}
      <motion.div
        animate={{
          y: [-4, 5, -4],
          x: [3, -2, 3],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute left-[9%] bottom-[16%] w-2.5 h-2.5 rounded-full bg-[#22C55E] pointer-events-none shadow-sm"
      />

      {/* Bottom right yellow floating dot */}
      <motion.div
        animate={{
          y: [4, -4, 4],
          x: [-2, 2, -2],
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute right-[8%] bottom-[15%] w-3.5 h-3.5 rounded-full bg-[#EAB308] pointer-events-none shadow-sm"
      />

      {/* Subtle red accent hairline on left edge */}
      <div className="absolute left-0 top-[66%] w-12 sm:w-16 h-[1.5px] bg-[#EF4444]/60 pointer-events-none" />

      {/* Subtle green accent hairline on right edge */}
      <div className="absolute right-0 top-[43%] w-16 sm:w-20 h-[1.5px] bg-[#22C55E]/60 pointer-events-none" />

      {/* ================= TOP HEADER ================= */}
      <div className="w-full flex items-center justify-between z-10">
        <LocalwayLogo size="hero" />

        {/* Elegant, discrete user profile menu dropdown */}
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
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="w-full max-w-4xl mx-auto my-auto py-12 sm:py-20 z-10">
        {/* 4 Brand Colored Dots (Purely decorative) */}
        <div className="mb-6 flex items-center gap-1.5 select-none pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-xs" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-6">
          Vamos começar o seu<br />
          onboarding
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-10 font-normal">
          Precisamos de algumas informações para conhecer melhor a sua empresa e iniciar o serviço contratado com a Localway.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={onStart}
            id="start-onboarding-btn"
            className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-black text-white font-semibold text-base shadow-sm hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>{hasDraft ? 'Continuar preenchimento' : 'Começar o onboarding'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          {hasDraft && (
            <span className="text-xs text-slate-400">
              Detectamos rascunho salvo anteriormente.
            </span>
          )}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="w-full text-center sm:text-left text-xs text-slate-400 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 pt-6 border-t border-slate-100">
        <span>Localway • Presença Digital e Resultado</span>
        <span>© {new Date().getFullYear()} Localway • Todos os direitos reservados</span>
      </div>
    </div>
  );
};
