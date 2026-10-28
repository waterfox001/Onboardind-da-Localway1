import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../../FormControls';
import { Globe } from 'lucide-react';

interface ModuleWebsiteProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleWebsite: React.FC<ModuleWebsiteProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-website">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Site Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina os objetivos, estrutura, referências e páginas essenciais do seu novo site.
          </p>
        </div>
      </div>

      {/* Pergunta se já possui site */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <RadioGroup
          label="A empresa já possui um site no ar?"
          name="site-ja-possui"
          required
          options={['Sim', 'Não']}
          value={data.siteJaPossui}
          onChange={(v) => onChange('siteJaPossui', v)}
          error={errors.siteJaPossui}
          horizontal
        />

        {data.siteJaPossui === 'Sim' && (
          <div className="space-y-4 pt-2">
            <TextInput
              id="site-link-atual"
              label="Qual é o link do site atual?"
              placeholder="https://www.seusite.com.br"
              value={data.siteLinkAtual}
              onChange={(e) => onChange('siteLinkAtual', e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextArea
                id="site-manter-atual"
                label="O que você gostaria de manter do site atual?"
                placeholder="Ex: Textos institucionais, fotos da equipe, depoimentos..."
                value={data.siteManterAtual}
                onChange={(e) => onChange('siteManterAtual', e.target.value)}
                rows={3}
              />

              <TextArea
                id="site-mudar-atual"
                label="O que você gostaria de mudar no site novo?"
                placeholder="Ex: Layout mais moderno, velocidade de carregamento, botões diretos pro WhatsApp..."
                value={data.siteMudarAtual}
                onChange={(e) => onChange('siteMudarAtual', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Objetivos do novo site */}
      <div className="space-y-3">
        <CheckboxGroup
          label="Quais são os principais objetivos do novo site?"
          options={[
            'Gerar contatos no WhatsApp',
            'Apresentar a empresa e autoridade',
            'Vender serviços e orçamentos',
            'Captar leads e cadastros',
            'Agendamentos online',
            'Outro',
          ]}
          selectedValues={data.siteObjetivos}
          onChange={(v) => onChange('siteObjetivos', v)}
          columns={2}
        />

        {data.siteObjetivos.includes('Outro') && (
          <TextInput
            id="site-outro-objetivo"
            label="Qual outro objetivo do site?"
            placeholder="Descreva o objetivo específico..."
            value={data.siteOutroObjetivo}
            onChange={(e) => onChange('siteOutroObjetivo', e.target.value)}
          />
        )}
      </div>

      {/* Páginas necessárias */}
      <div className="space-y-3 pt-2">
        <CheckboxGroup
          label="Quais seções ou páginas o site precisa ter?"
          options={[
            'Início (Home)',
            'Sobre a empresa',
            'Serviços',
            'Produtos',
            'Contato e Localização',
            'Depoimentos / Avaliações',
            'Blog / Artigos',
            'Agendamento',
            'Outro',
          ]}
          selectedValues={data.sitePaginasNecessarias}
          onChange={(v) => onChange('sitePaginasNecessarias', v)}
          columns={3}
        />

        {data.sitePaginasNecessarias.includes('Outro') && (
          <TextInput
            id="site-outra-pagina"
            label="Quais outras páginas ou seções?"
            placeholder="Ex: Galeria de antes e depois, calculador de frete..."
            value={data.siteOutraPagina}
            onChange={(e) => onChange('siteOutraPagina', e.target.value)}
          />
        )}
      </div>

      {/* Referências e Informação obrigatória */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <TextInput
          id="site-referencia"
          label="Existe algum site que você gosta e gostaria de usar como referência?"
          placeholder="Ex: https://empresa-exemplo.com.br"
          value={data.siteReferencia}
          onChange={(e) => onChange('siteReferencia', e.target.value)}
          helper="Cole o link ou nome da empresa de referência"
        />

        <TextInput
          id="site-info-obrigatoria"
          label="Existe alguma informação que NÃO pode faltar no site?"
          placeholder="Ex: Selos, CRM médico, número de registro, garantia..."
          value={data.siteInfoObrigatoria}
          onChange={(e) => onChange('siteInfoObrigatoria', e.target.value)}
        />
      </div>
    </div>
  );
};
