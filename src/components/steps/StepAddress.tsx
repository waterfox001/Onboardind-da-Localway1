import React from 'react';
import { OnboardingData } from '../../types';
import { TextInput, Select } from '../FormControls';
import { MapPin } from 'lucide-react';

interface StepAddressProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const StepAddress: React.FC<StepAddressProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="step-address">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Endereço Comercial
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <TextInput
            id="addr-rua"
            label="Rua / Avenida"
            required
            placeholder="Ex: Av. Paulista"
            value={data.ruaAvenida}
            onChange={(e) => onChange('ruaAvenida', e.target.value)}
            error={errors.ruaAvenida}
          />
        </div>

        <TextInput
          id="addr-numero"
          label="Número"
          required
          placeholder="Ex: 1000"
          value={data.numero}
          onChange={(e) => onChange('numero', e.target.value)}
          error={errors.numero}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="addr-complemento"
          label="Complemento"
          placeholder="Ex: Sala 402, Bloco B, Próximo ao metrô"
          value={data.complemento}
          onChange={(e) => onChange('complemento', e.target.value)}
        />

        <TextInput
          id="addr-bairro"
          label="Bairro"
          required
          placeholder="Ex: Bela Vista"
          value={data.bairro}
          onChange={(e) => onChange('bairro', e.target.value)}
          error={errors.bairro}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <TextInput
            id="addr-cidade"
            label="Cidade"
            required
            placeholder="Ex: São Paulo"
            value={data.cidade}
            onChange={(e) => onChange('cidade', e.target.value)}
            error={errors.cidade}
          />
        </div>

        <Select
          id="addr-estado"
          label="Estado (UF)"
          required
          options={ESTADOS_BRASIL}
          value={data.estado}
          onChange={(e) => onChange('estado', e.target.value)}
          error={errors.estado}
        />
      </div>
    </div>
  );
};
