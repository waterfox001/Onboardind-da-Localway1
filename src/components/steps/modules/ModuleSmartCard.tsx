import React from 'react';
import { OnboardingData } from '../../../types';
import { RadioGroup, TextInput, TextArea } from '../../FormControls';
import { QrCode, Star, Instagram, MessageSquare, Smartphone, Link } from 'lucide-react';

interface ModuleSmartCardProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleSmartCard: React.FC<ModuleSmartCardProps> = ({
  data,
  onChange,
  errors,
}) => {
  const destinationOptions = [
    {
      value: 'google',
      label: 'Avaliação no Google (Google Meu Negócio)',
      description: 'Direciona direto para a janela de 5 estrelas no Perfil da Empresa no Google',
      icon: Star,
      iconColor: 'text-amber-500',
    },
    {
      value: 'instagram',
      label: 'Seguir no Instagram',
      description: 'Abre o perfil comercial do Instagram da empresa',
      icon: Instagram,
      iconColor: 'text-rose-500',
    },
    {
      value: 'whatsapp',
      label: 'Conversa no WhatsApp',
      description: 'Inicia uma conversa diretamente com o WhatsApp da empresa',
      icon: MessageSquare,
      iconColor: 'text-emerald-500',
    },
    {
      value: 'minisite',
      label: 'Mini Site / Cardápio / Links Rápidos',
      description: 'Abre a página exclusiva com todos os links, catálogo e contatos',
      icon: Smartphone,
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6" id="module-smartcard">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
          <QrCode className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Plaquinha Inteligente QR Code / NFC
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure o destino para onde os clientes serão direcionados ao aproximar o celular (NFC) ou escanear o QR Code.
          </p>
        </div>
      </div>

      {/* Target Destination selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-800">
          Para onde a Plaquinha Inteligente deve direcionar o cliente? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {destinationOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = data.plaquinhaDestino === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => onChange('plaquinhaDestino', opt.value)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isSelected ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${opt.iconColor}`} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {errors.plaquinhaDestino && (
          <p className="text-xs text-red-600 font-medium">{errors.plaquinhaDestino}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <RadioGroup
          label="Quantidade de plaquinhas contratadas"
          name="plaquinha-qtd"
          required
          options={['1 Plaquinha', '2 Plaquinhas', '3 a 5 Plaquinhas', 'Mais de 5 (Personalizado)']}
          value={data.plaquinhaQuantidade}
          onChange={(v) => onChange('plaquinhaQuantidade', v)}
        />

        <RadioGroup
          label="Onde a plaquinha ficará posicionada?"
          name="plaquinha-local"
          required
          options={['Balcão / Recepção', 'Mesas de Atendimento', 'Caixa / Checkout', 'Outro local']}
          value={data.plaquinhaLocalInstalacao}
          onChange={(v) => onChange('plaquinhaLocalInstalacao', v)}
        />
      </div>

      <TextArea
        id="plaquinha-obs"
        label="Observações ou orientações para a produção da plaquinha (opcional)"
        placeholder="Ex: Se tiver mais de uma plaquinha, uma será para o Google e outra para o Instagram; logo com fundo escuro..."
        value={data.plaquinhaObservacoes}
        onChange={(e) => onChange('plaquinhaObservacoes', e.target.value)}
        rows={3}
      />
    </div>
  );
};
