import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, CheckboxGroup } from '../../FormControls';
import { Smartphone } from 'lucide-react';

interface ModuleMiniSiteProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleMiniSite: React.FC<ModuleMiniSiteProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-mini-site">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Mini Site (Página de Links / Bio)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Página rápida e responsiva para colocar na bio do Instagram, WhatsApp e links promocionais.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <CheckboxGroup
          label="Quais botões e informações devem aparecer na sua página de links?"
          options={[
            'Botão de WhatsApp Direto',
            'Link do Instagram',
            'Endereço & Como Chegar (Google Maps)',
            'Cardápio Digital / Catálogo PDF',
            'Agendamento Online',
            'Link para Site Principal',
            'Outro',
          ]}
          selectedValues={data.minisiteInformacoes}
          onChange={(v) => onChange('minisiteInformacoes', v)}
          columns={2}
        />

        {data.minisiteInformacoes.includes('Outro') && (
          <TextInput
            id="minisite-outra-info"
            label="Qual outro botão ou link deseja incluir?"
            placeholder="Ex: Canal no YouTube, Grupo VIP de ofertas..."
            value={data.minisiteOutraInfo}
            onChange={(e) => onChange('minisiteOutraInfo', e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="minisite-whatsapp"
          label="WhatsApp do botão principal"
          placeholder={data.whatsapp || '(11) 90000-0000'}
          value={data.minisiteWhatsapp}
          onChange={(e) => onChange('minisiteWhatsapp', e.target.value)}
          helper="Para onde os clientes que clicarem no botão serão levados"
        />

        <TextInput
          id="minisite-instagram"
          label="Usuário do Instagram"
          placeholder={data.instagram || '@suaempresa'}
          value={data.minisiteInstagram}
          onChange={(e) => onChange('minisiteInstagram', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="minisite-site"
          label="Site (se houver)"
          placeholder={data.site || 'https://suaempresa.com.br'}
          value={data.minisiteSite}
          onChange={(e) => onChange('minisiteSite', e.target.value)}
        />

        <TextInput
          id="minisite-endereco"
          label="Endereço simplificado para o botão de rota"
          placeholder={`${data.ruaAvenida || ''} ${data.numero ? ', ' + data.numero : ''} - ${data.bairro || ''}`}
          value={data.minisiteEndereco}
          onChange={(e) => onChange('minisiteEndereco', e.target.value)}
        />
      </div>

      <TextArea
        id="minisite-info-adicional"
        label="Outras informações ou chamadas de ação para a bio"
        placeholder="Ex: Frase de destaque no topo, aviso de promoção da semana..."
        value={data.minisiteInfoAdicional}
        onChange={(e) => onChange('minisiteInfoAdicional', e.target.value)}
        rows={2}
      />
    </div>
  );
};
