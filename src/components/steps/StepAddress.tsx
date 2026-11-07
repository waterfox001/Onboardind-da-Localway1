import React from 'react';
import { OnboardingData } from '../../types';
import { OnboardingFieldConfig } from '../../constants/formSchema';
import { TextInput, Select } from '../FormControls';
import { MapPin } from 'lucide-react';

interface StepAddressProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  fieldsConfig?: OnboardingFieldConfig[];
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const StepAddress: React.FC<StepAddressProps> = ({
  data,
  onChange,
  errors,
  fieldsConfig,
}) => {
  const getField = (key: string) => fieldsConfig?.find((f) => f.key === key);
  const isEnabled = (key: string) => {
    const f = getField(key);
    return f ? f.enabled : true;
  };
  const getLabel = (key: string, fallback: string) => getField(key)?.label || fallback;
  const getPlaceholder = (key: string, fallback?: string) => getField(key)?.placeholder || fallback;
  const isRequired = (key: string, fallback: boolean) => {
    const f = getField(key);
    return f ? f.required : fallback;
  };
  const getHelper = (key: string) => getField(key)?.helper;

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
          <p className="text-xs sm:text-sm text-slate-500">
            Localização da sede, consultório, loja física ou ponto de atendimento.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isEnabled('ruaAvenida') && (
          <div className={isEnabled('numero') ? 'sm:col-span-2' : 'sm:col-span-3'}>
            <TextInput
              id="addr-rua"
              label={getLabel('ruaAvenida', 'Rua / Avenida')}
              required={isRequired('ruaAvenida', true)}
              placeholder={getPlaceholder('ruaAvenida', 'Ex: Av. Paulista')}
              helper={getHelper('ruaAvenida')}
              value={data.ruaAvenida}
              onChange={(e) => onChange('ruaAvenida', e.target.value)}
              error={errors.ruaAvenida}
            />
          </div>
        )}

        {isEnabled('numero') && (
          <div className={isEnabled('ruaAvenida') ? '' : 'sm:col-span-3'}>
            <TextInput
              id="addr-numero"
              label={getLabel('numero', 'Número')}
              required={isRequired('numero', true)}
              placeholder={getPlaceholder('numero', 'Ex: 1000')}
              helper={getHelper('numero')}
              value={data.numero}
              onChange={(e) => onChange('numero', e.target.value)}
              error={errors.numero}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEnabled('complemento') && (
          <TextInput
            id="addr-complemento"
            label={getLabel('complemento', 'Complemento')}
            required={isRequired('complemento', false)}
            placeholder={getPlaceholder('complemento', 'Ex: Sala 402, Bloco B, Próximo ao metrô')}
            helper={getHelper('complemento')}
            value={data.complemento}
            onChange={(e) => onChange('complemento', e.target.value)}
          />
        )}

        {isEnabled('bairro') && (
          <TextInput
            id="addr-bairro"
            label={getLabel('bairro', 'Bairro')}
            required={isRequired('bairro', true)}
            placeholder={getPlaceholder('bairro', 'Ex: Bela Vista')}
            helper={getHelper('bairro')}
            value={data.bairro}
            onChange={(e) => onChange('bairro', e.target.value)}
            error={errors.bairro}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isEnabled('cidade') && (
          <div className={isEnabled('estado') ? 'sm:col-span-2' : 'sm:col-span-3'}>
            <TextInput
              id="addr-cidade"
              label={getLabel('cidade', 'Cidade')}
              required={isRequired('cidade', true)}
              placeholder={getPlaceholder('cidade', 'Ex: São Paulo')}
              helper={getHelper('cidade')}
              value={data.cidade}
              onChange={(e) => onChange('cidade', e.target.value)}
              error={errors.cidade}
            />
          </div>
        )}

        {isEnabled('estado') && (
          <Select
            id="addr-estado"
            label={getLabel('estado', 'Estado (UF)')}
            required={isRequired('estado', true)}
            options={getField('estado')?.options || ESTADOS_BRASIL}
            value={data.estado}
            onChange={(e) => onChange('estado', e.target.value)}
            error={errors.estado}
          />
        )}
      </div>
    </div>
  );
};
