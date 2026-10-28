import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup } from '../../FormControls';
import { ShieldCheck, Info } from 'lucide-react';

interface ModuleBrandRegistryProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleBrandRegistry: React.FC<ModuleBrandRegistryProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-registro-marca">
      {/* Header com cor do serviço Registro de Marca (#9F1239 - Rose/Wine) */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Registro de Marca
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Proteção jurídica, exclusividade de uso e propriedade intelectual da sua marca junto ao INPI.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs text-slate-700 shadow-xs">
          <Info className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-rose-950 font-semibold block mb-0.5">
              Importância do Registro de Marca
            </strong>
            O registro formal perante o INPI garante que concorrentes não possam utilizar o mesmo nome ou identidade visual no seu segmento de atuação em todo o território nacional.
          </div>
        </div>

        <RadioGroup
          label="A sua marca já possui registro no INPI?"
          name="marca-ja-possui-registro"
          required
          options={['Sim', 'Não', 'Não sei']}
          value={data.marcaJaPossuiRegistro}
          onChange={(v) => onChange('marcaJaPossuiRegistro', v)}
          error={errors.marcaJaPossuiRegistro}
        />

        <TextInput
          id="marca-nome-registrar"
          label="Qual é o nome exato da marca que deseja registrar?"
          required
          placeholder={data.nomeFantasia || 'Ex: Localway / Minha Empresa'}
          value={data.marcaNomeRegistrar}
          onChange={(e) => onChange('marcaNomeRegistrar', e.target.value)}
          error={errors.marcaNomeRegistrar}
          helper="Nome fonético e ortográfico que passará pelo exame de viabilidade marcária."
        />

        <TextArea
          id="marca-variacoes-nome"
          label="Há variações do nome ou expressões adicionais que acompanham a marca?"
          placeholder="Ex: Slogan acompanhante, abreviações, siglas ou nomes de submarcas/linhas de produtos..."
          value={data.marcaVariacoesNome}
          onChange={(e) => onChange('marcaVariacoesNome', e.target.value)}
          rows={3}
          helper="Detalhe elementos complementares que também fazem parte da identidade da marca."
        />
      </div>
    </div>
  );
};
