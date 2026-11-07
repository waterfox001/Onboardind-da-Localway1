import React, { useState } from 'react';
import { SERVICES_LIST } from '../../constants/services';
import { ServiceId } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  ShoppingBag,
  CreditCard,
  QrCode,
  Globe,
  Share2,
  Search,
  MessageSquare,
  Bot,
  ShieldCheck,
  Palette,
} from 'lucide-react';

interface ServicesManagerProps {
  // Can be extended with custom active services configuration
  onSave?: (services: any) => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = () => {
  // Maintain local toggle states for service availability
  const [servicesState, setServicesState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('localway_admin_services_config');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const initial: Record<string, boolean> = {};
    SERVICES_LIST.forEach((s) => {
      initial[s.id] = true;
    });
    return initial;
  });

  const toggleService = (id: string) => {
    const updated = {
      ...servicesState,
      [id]: !servicesState[id],
    };
    setServicesState(updated);
    try {
      localStorage.setItem('localway_admin_services_config', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const getServiceBadge = (id: ServiceId) => {
    switch (id) {
      case 'plaquinha':
        return 'QR Code & NFC';
      case 'ecommerce':
        return 'Loja Virtual';
      case 'catalogo':
        return 'Cardápio / Catálogo';
      case 'google':
        return 'Google Maps & Meu Negócio';
      case 'trafego':
        return 'Meta & Google Ads';
      case 'automacoes':
        return 'Chatbots & Sistemas';
      default:
        return 'Digital';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Sliders className="w-4 h-4" />
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Serviços Especializados da Localway
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gerencie o portfólio de serviços contratáveis. Cada serviço contratado pelo cliente desbloqueia automaticamente seu respectivo módulo dinâmico no onboarding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES_LIST.map((service) => {
          const isEnabled = servicesState[service.id] !== false;

          return (
            <div
              key={service.id}
              className={`p-5 rounded-2xl border transition-all ${
                isEnabled
                  ? 'bg-white border-slate-200/90 shadow-xs'
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{service.title}</h3>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      {getServiceBadge(service.id)}
                    </span>
                    {!isEnabled && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Oculto na seleção
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {service.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleService(service.id)}
                  title={isEnabled ? 'Ocultar serviço do formulário' : 'Ativar serviço'}
                  className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Special details callout for key services */}
              {service.id === 'plaquinha' && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-blue-700 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 shrink-0" />
                  <span>Coleta destino do link (Google, Insta, Whats, Mini Site) e ponto de instalação.</span>
                </div>
              )}

              {service.id === 'ecommerce' && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-blue-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>Coleta quantidade de produtos, controle de estoque, variações de cor/tamanho e envios.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
