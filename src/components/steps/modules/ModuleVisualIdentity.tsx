import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../../FormControls';
import { Palette } from 'lucide-react';

interface ModuleVisualIdentityProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleVisualIdentity: React.FC<ModuleVisualIdentityProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-visual-identity">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Palette className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Identidade Visual & Branding
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina o estilo, paleta de cores e o posicionamento visual da sua marca.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <RadioGroup
          label="A empresa já possui logotipo e identidade visual?"
          name="id-ja-possui"
          required
          options={['Sim', 'Não']}
          value={data.identidadeJaPossui}
          onChange={(v) => onChange('identidadeJaPossui', v)}
          error={errors.identidadeJaPossui}
          horizontal
        />

        {data.identidadeJaPossui === 'Sim' && (
          <div className="space-y-3 pt-2">
            <TextInput
              id="id-elementos-manter"
              label="Existe algum elemento do logo atual que DEVE ser mantido?"
              placeholder="Ex: O símbolo do pássaro, a tipografia, a cor azul..."
              value={data.identidadeElementosManter}
              onChange={(e) => onChange('identidadeElementosManter', e.target.value)}
            />

            <RadioGroup
              label="Você possui os arquivos do logotipo em alta qualidade (vetor .AI/.EPS, PDF ou PNG transparente)?"
              name="id-alta-qualidade"
              options={['Sim', 'Não / Não tenho certeza']}
              value={data.identidadePossuiLogoAlta}
              onChange={(v) => onChange('identidadePossuiLogoAlta', v)}
              horizontal
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="id-cores-desejadas"
          label="Quais cores você gostaria que fossem usadas na marca?"
          placeholder="Ex: Azul marinho, dourado, branco e cinza escuro..."
          value={data.identidadeCoresDesejadas}
          onChange={(e) => onChange('identidadeCoresDesejadas', e.target.value)}
          helper="Cores que representam a energia do seu negócio"
        />

        <TextInput
          id="id-cores-evitar"
          label="Quais cores você NÃO gostaria de ver na sua marca?"
          placeholder="Ex: Vermelho, rosa forte, verde musgo..."
          value={data.identidadeCoresNaoDesejadas}
          onChange={(e) => onChange('identidadeCoresNaoDesejadas', e.target.value)}
        />
      </div>

      <TextInput
        id="id-marcas-referencia"
        label="Existe alguma marca ou empresa que você admira visualmente?"
        placeholder="Ex: Apple, Nubank, Starbucks, Nike, marca local X..."
        value={data.identidadeMarcasReferencia}
        onChange={(e) => onChange('identidadeMarcasReferencia', e.target.value)}
        helper="Pode citar empresas de qualquer setor que transmitam o clima desejado"
      />

      <div className="space-y-3 pt-2">
        <CheckboxGroup
          label="Como você gostaria que sua marca fosse percebida pelo público?"
          options={[
            'Moderna & Inovadora',
            'Sofisticada & Premium',
            'Acolhedora & Humana',
            'Tradicional & Confiável',
            'Tecnológica & Ágil',
            'Minimalista & Elegante',
            'Acessível & Popular',
            'Outro',
          ]}
          selectedValues={data.identidadePercepcao}
          onChange={(v) => onChange('identidadePercepcao', v)}
          columns={2}
        />

        {data.identidadePercepcao.includes('Outro') && (
          <TextInput
            id="id-outra-percepcao"
            label="Qual outro tom ou sensação visual?"
            placeholder="Descreva a sensação desejada..."
            value={data.identidadeOutraPercepcao}
            onChange={(e) => onChange('identidadeOutraPercepcao', e.target.value)}
          />
        )}
      </div>
    </div>
  );
};
