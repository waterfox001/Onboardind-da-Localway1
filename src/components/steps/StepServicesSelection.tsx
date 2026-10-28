import React from 'react';
import { OnboardingData, ServiceId } from '../../types';
import { SERVICES_LIST } from '../../constants/services';
import {
  MapPin,
  Globe,
  ShoppingBag,
  TrendingUp,
  Palette,
  Smartphone,
  Search,
  Cpu,
  MessageSquare,
  Mail,
  FileSignature,
  ShieldCheck,
  AtSign,
  Check,
  Sparkles,
} from 'lucide-react';

interface StepServicesSelectionProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const StepServicesSelection: React.FC<StepServicesSelectionProps> = ({
  data,
  onChange,
  errors,
}) => {
  const toggleService = (id: ServiceId) => {
    const current = [...data.servicosContratados];
    if (current.includes(id)) {
      onChange(
        'servicosContratados',
        current.filter((s) => s !== id)
      );
    } else {
      onChange('servicosContratados', [...current, id]);
    }
  };

  const getIcon = (id: ServiceId) => {
    switch (id) {
      case 'google':
        return <MapPin className="w-5 h-5" />;
      case 'site':
        return <Globe className="w-5 h-5" />;
      case 'ecommerce':
        return <ShoppingBag className="w-5 h-5" />;
      case 'trafego':
        return <TrendingUp className="w-5 h-5" />;
      case 'identidade':
        return <Palette className="w-5 h-5" />;
      case 'minisite':
        return <Smartphone className="w-5 h-5" />;
      case 'seo':
        return <Search className="w-5 h-5" />;
      case 'automacoes':
        return <Cpu className="w-5 h-5" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5" />;
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'assinatura_email':
        return <FileSignature className="w-5 h-5" />;
      case 'registro_marca':
        return <ShieldCheck className="w-5 h-5" />;
      case 'registro_dominio':
        return <AtSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6" id="step-services-selection">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Quais serviços você contratou com a Localway?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Selecione todos os serviços inclusos no seu projeto. Os módulos correspondentes serão abertos automaticamente.
            </p>
          </div>
        </div>

        {data.servicosContratados.length > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {data.servicosContratados.length}{' '}
            {data.servicosContratados.length === 1 ? 'serviço selecionado' : 'serviços selecionados'}
          </span>
        )}
      </div>

      {errors.servicosContratados && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errors.servicosContratados}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {SERVICES_LIST.map((svc) => {
          const isSelected = data.servicosContratados.includes(svc.id);

          return (
            <button
              type="button"
              key={svc.id}
              onClick={() => toggleService(svc.id)}
              id={`service-card-${svc.id}`}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative cursor-pointer active:scale-[0.99] ${
                isSelected
                  ? `${svc.borderLight} ${svc.bgLight} ring-2 ${svc.ringColor} shadow-xs`
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="p-2.5 rounded-xl transition-colors"
                  style={{
                    backgroundColor: isSelected ? svc.themeColor : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                  }}
                >
                  {getIcon(svc.id)}
                </div>

                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center border transition-all"
                  style={{
                    backgroundColor: isSelected ? svc.themeColor : '#FFFFFF',
                    borderColor: isSelected ? svc.themeColor : '#CBD5E1',
                    color: isSelected ? '#FFFFFF' : 'transparent',
                  }}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {svc.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
