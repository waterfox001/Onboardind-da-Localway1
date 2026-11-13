import React, { useState } from 'react';
import { ManagedServiceConfig, ServiceId, UniversalQuestion } from '../../types';
import { DEFAULT_SERVICES_CONFIG } from '../../constants/services';
import {
  Sliders,
  Eye,
  EyeOff,
  ShoppingBag,
  QrCode,
  Globe,
  Search,
  MessageSquare,
  ShieldCheck,
  Palette,
  Edit2,
  Check,
  HelpCircle,
  FileQuestion,
  Layers,
  Save,
  X,
  Plus,
} from 'lucide-react';

interface ServicesManagerProps {
  servicesConfig?: Record<string, ManagedServiceConfig>;
  onChange: (updated: Record<string, ManagedServiceConfig>) => void;
  onManageServiceQuestions?: (serviceId: ServiceId) => void;
}

export const ServicesManager: React.FC<ServicesManagerProps> = ({
  servicesConfig = DEFAULT_SERVICES_CONFIG,
  onChange,
  onManageServiceQuestions,
}) => {
  const [editingService, setEditingService] = useState<ManagedServiceConfig | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editShortTitle, setEditShortTitle] = useState('');
  const [editTagline, setEditTagline] = useState('');

  const servicesList = Object.values(servicesConfig || DEFAULT_SERVICES_CONFIG);

  const handleToggleService = (id: string) => {
    const current = servicesConfig[id] || DEFAULT_SERVICES_CONFIG[id];
    if (!current) return;

    const updated = {
      ...servicesConfig,
      [id]: {
        ...current,
        enabled: !current.enabled,
      },
    };
    onChange(updated);
  };

  const handleOpenEdit = (svc: ManagedServiceConfig) => {
    setEditingService(svc);
    setEditTitle(svc.title);
    setEditShortTitle(svc.shortTitle || svc.title);
    setEditTagline(svc.tagline);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const updated = {
      ...servicesConfig,
      [editingService.id]: {
        ...editingService,
        title: editTitle.trim() || editingService.title,
        shortTitle: editShortTitle.trim() || editingService.shortTitle,
        tagline: editTagline.trim() || editingService.tagline,
      },
    };
    onChange(updated);
    setEditingService(null);
  };

  const getServiceBadge = (id: ServiceId) => {
    switch (id) {
      case 'google':
        return 'Google Maps & Negócio';
      case 'site':
        return 'Web Institucional';
      case 'ecommerce':
        return 'Loja Virtual';
      case 'trafego':
        return 'Meta & Google Ads';
      case 'identidade':
        return 'Branding & Logo';
      case 'minisite':
        return 'Link na Bio';
      case 'seo':
        return 'Buscas Orgânicas';
      case 'automacoes':
        return 'Sistemas & Fluxos';
      case 'whatsapp':
        return 'WhatsApp Business';
      case 'email':
        return 'E-mail Corporativo';
      case 'assinatura_email':
        return 'Assinatura Padronizada';
      case 'registro_marca':
        return 'INPI & Proteção';
      case 'registro_dominio':
        return 'Registro.br';
      case 'plaquinha':
        return 'QR Code & NFC';
      case 'catalogo':
        return 'Catálogo Digital';
      default:
        return 'Digital';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Gerenciamento dos {servicesList.length} Serviços da Localway
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Ative, desative ou personalize o nome e a descrição de qualquer serviço. Serviços desativados não aparecem para o cliente no formulário público, mas suas perguntas e respostas históricas continuam 100% protegidas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {servicesList.filter((s) => s.enabled !== false).length} ativos de {servicesList.length}
          </span>
        </div>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {servicesList.map((svc) => {
          const isEnabled = svc.enabled !== false;
          const questionsCount = (svc.questions || []).length;

          return (
            <div
              key={svc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isEnabled
                  ? 'bg-white border-slate-200/90 hover:border-blue-300 shadow-xs'
                  : 'bg-slate-50/80 border-slate-200 opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                      {getServiceBadge(svc.id)}
                    </span>
                    {!isEnabled && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Desativado
                      </span>
                    )}
                  </div>

                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => handleToggleService(svc.id)}
                    title={isEnabled ? 'Desativar serviço' : 'Ativar serviço'}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {svc.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                    {svc.shortTitle}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {svc.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                  {questionsCount} {questionsCount === 1 ? 'pergunta' : 'perguntas'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(svc)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Editar título e tagline do serviço"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {onManageServiceQuestions && (
                    <button
                      type="button"
                      onClick={() => onManageServiceQuestions(svc.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                      title="Gerenciar perguntas deste serviço"
                    >
                      Gerenciar Perguntas
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                Editar Serviço: {editingService.title}
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título Completo do Serviço
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Site Profissional"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título Curto (Exibição em badges)
                </label>
                <input
                  type="text"
                  value={editShortTitle}
                  onChange={(e) => setEditShortTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Site Institucional"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline / Descrição Curta
                </label>
                <textarea
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                  placeholder="Ex: Página web completa e de alta performance"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
