import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, MessageSquare, Download, Sparkles, Building } from 'lucide-react';
import { LocalwayLogo } from '../LocalwayLogo';
import { GoogleAccentDots } from '../GoogleAccentDots';
import { OnboardingData } from '../../types';

interface StepSuccessProps {
  data: OnboardingData;
  onNewOnboarding: () => void;
}

export const StepSuccess: React.FC<StepSuccessProps> = ({
  data,
  onNewOnboarding,
}) => {
  const protocolNumber = `LW-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto px-4 py-8 text-center"
      id="step-success"
    >
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-12 relative overflow-hidden">
        {/* Subtle Google accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-xs border border-emerald-100">
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
        </div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <GoogleAccentDots size="xs" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-600">
            Onboarding Concluído com Sucesso
          </span>
          <GoogleAccentDots size="xs" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
          Informações recebidas com sucesso!
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
          Agradecemos a dedicação no preenchimento,{' '}
          <strong className="text-slate-800 font-semibold">{data.responsavelNome || data.nomeFantasia || 'cliente'}</strong>. Nossos especialistas já iniciaram a análise de todos os seus dados.
        </p>

        {/* Protocol box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left max-w-md mx-auto mb-8 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Protocolo de Envio:</span>
            <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {protocolNumber}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Empresa:</span>
            <span className="font-semibold text-slate-800">{data.nomeFantasia || 'Não informada'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status no Google Sheets:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado na planilha oficial
            </span>
          </div>
        </div>

        {/* Next steps timeline info */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 text-left max-w-md mx-auto mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Próximos Passos com a Localway:</span>
          </div>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
            <li>Nossa equipe técnica revisará os dados e organizará os acessos necessários.</li>
            <li>Entraremos em contato via WhatsApp para confirmar o início das configurações.</li>
            <li>Você receberá prévias e relatórios de progresso em cada etapa concluída.</li>
          </ol>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
          <a
            id="btn-whatsapp-equipe"
            href="https://wa.me/5585921602624?text=Ol%C3%A1%2C%20acabei%20de%20finalizar%20o%20onboarding."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 fill-white/20" />
            <span>Falar com a equipe Localway</span>
          </a>
          <p className="text-[11px] text-slate-400">
            Atendimento direto com nossos especialistas via WhatsApp (+55 85 92160-2624)
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2">
          <LocalwayLogo size="sm" showBadgeBorder />
        </div>
      </div>
    </motion.div>
  );
};
