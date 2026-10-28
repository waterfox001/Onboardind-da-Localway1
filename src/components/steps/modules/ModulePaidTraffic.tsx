import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup, Select } from '../../FormControls';
import { TrendingUp } from 'lucide-react';

interface ModulePaidTrafficProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModulePaidTraffic: React.FC<ModulePaidTrafficProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-paid-traffic">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Tráfego Pago (Anúncios Online)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina os objetivos de campanha, segmentação geográfica e público-alvo para anúncios no Google e Meta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="traffic-objetivo"
          label="Qual é o principal objetivo dos anúncios?"
          required
          options={[
            'Vendas e contatos no WhatsApp',
            'Vendas no site / Loja virtual',
            'Agendamentos de serviços',
            'Captação de leads e orçamentos',
            'Reconhecimento da marca / Mais seguidores',
            'Outro',
          ]}
          value={data.trafegoObjetivo}
          onChange={(e) => onChange('trafegoObjetivo', e.target.value)}
          error={errors.trafegoObjetivo}
        />

        {data.trafegoObjetivo === 'Outro' ? (
          <TextInput
            id="traffic-outro-objetivo"
            label="Qual outro objetivo?"
            placeholder="Especifique a meta das campanhas..."
            value={data.trafegoOutroObjetivo}
            onChange={(e) => onChange('trafegoOutroObjetivo', e.target.value)}
          />
        ) : (
          <TextInput
            id="traffic-produto-prioritario"
            label="Qual produto ou serviço deve ser anunciado primeiro?"
            required
            placeholder="Ex: Alinhamento dental, Rodízio premium, Consultoria..."
            value={data.trafegoProdutoServicoPrimeiro}
            onChange={(e) => onChange('trafegoProdutoServicoPrimeiro', e.target.value)}
            error={errors.trafegoProdutoServicoPrimeiro}
          />
        )}
      </div>

      {data.trafegoObjetivo === 'Outro' && (
        <TextInput
          id="traffic-produto-prioritario-alt"
          label="Qual produto ou serviço deve ser anunciado primeiro?"
          required
          placeholder="Ex: Alinhamento dental, Rodízio premium, Consultoria..."
          value={data.trafegoProdutoServicoPrimeiro}
          onChange={(e) => onChange('trafegoProdutoServicoPrimeiro', e.target.value)}
          error={errors.trafegoProdutoServicoPrimeiro}
        />
      )}

      {/* Região e Raio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="traffic-cidade"
          label="Cidade(s) onde os anúncios devem rodar"
          required
          placeholder="Ex: Campinas / SP ou Grande São Paulo"
          value={data.trafegoCidade}
          onChange={(e) => onChange('trafegoCidade', e.target.value)}
          error={errors.trafegoCidade}
        />

        <TextInput
          id="traffic-bairros"
          label="Bairros específicos ou raio de atendimento"
          placeholder="Ex: Raio de 10km da sede ou Bairros Centro, Cambuí e Taquaral"
          value={data.trafegoBairrosRegioes}
          onChange={(e) => onChange('trafegoBairrosRegioes', e.target.value)}
        />
      </div>

      {/* Público-alvo */}
      <TextArea
        id="traffic-publico-alvo"
        label="Quem é o público-alvo dos anúncios?"
        required
        placeholder="Ex: Homens e mulheres de 25 a 55 anos, moradores da região, interessados em bem-estar e estética, classe B e C..."
        value={data.trafegoPublicoAlvo}
        onChange={(e) => onChange('trafegoPublicoAlvo', e.target.value)}
        error={errors.trafegoPublicoAlvo}
        rows={3}
        helper="Informe idade aproximada, gênero, poder aquisitivo ou perfil ideal de cliente."
      />

      {/* Histórico de anúncios */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <RadioGroup
          label="A empresa já realizou anúncios pagos antes?"
          name="traffic-ja-anuncia"
          required
          options={['Sim', 'Não']}
          value={data.trafegoJaAnuncia}
          onChange={(v) => onChange('trafegoJaAnuncia', v)}
          error={errors.trafegoJaAnuncia}
          horizontal
        />

        {data.trafegoJaAnuncia === 'Sim' && (
          <div className="space-y-4 pt-2">
            <CheckboxGroup
              label="Onde a empresa já anunciou anteriormente?"
              options={['Instagram Ads', 'Facebook Ads', 'Google Ads', 'TikTok Ads', 'Outro']}
              selectedValues={data.trafegoPlataformas}
              onChange={(v) => onChange('trafegoPlataformas', v)}
              columns={3}
            />

            <TextInput
              id="traffic-campanhas-atuais"
              label="Existe alguma campanha ativa no momento ou conta existente?"
              placeholder="Ex: Conta de anúncios do Facebook com campanhas ativas, etc."
              value={data.trafegoCampanhasAtuais}
              onChange={(e) => onChange('trafegoCampanhasAtuais', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="traffic-whatsapp-contatos"
          label="WhatsApp que deve receber os contatos dos anúncios"
          placeholder={data.whatsapp || '(11) 90000-0000'}
          value={data.trafegoWhatsappContatos}
          onChange={(e) => onChange('trafegoWhatsappContatos', e.target.value)}
          helper="Para onde os clientes que clicarem no anúncio serão direcionados"
        />

        <TextInput
          id="traffic-periodo-promocao"
          label="Existe algum período promocional ou oferta especial?"
          placeholder="Ex: Black Friday, Inauguração, Desconto de 15% até dia 30..."
          value={data.trafegoPeriodoPromocao}
          onChange={(e) => onChange('trafegoPeriodoPromocao', e.target.value)}
        />
      </div>
    </div>
  );
};
