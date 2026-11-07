import React from 'react';
import { OnboardingData } from '../../types';
import { OnboardingFieldConfig } from '../../constants/formSchema';
import { TextInput } from '../FormControls';
import { UserCheck } from 'lucide-react';

interface StepManagerProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  fieldsConfig?: OnboardingFieldConfig[];
}

export const StepManager: React.FC<StepManagerProps> = ({
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
  const getHelper = (key: string, fallback?: string) => getField(key)?.helper || fallback;

  return (
    <div className="space-y-6" id="step-manager">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Responsável pelo Projeto
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Contato de quem acompanhará as etapas e aprovações com a Localway.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEnabled('responsavelNome') && (
          <TextInput
            id="manager-nome"
            label={getLabel('responsavelNome', 'Nome Completo do Responsável')}
            required={isRequired('responsavelNome', true)}
            placeholder={getPlaceholder('responsavelNome', 'Ex: Carlos Oliveira')}
            helper={getHelper('responsavelNome')}
            value={data.responsavelNome}
            onChange={(e) => onChange('responsavelNome', e.target.value)}
            error={errors.responsavelNome}
          />
        )}

        {isEnabled('responsavelCargo') && (
          <TextInput
            id="manager-cargo"
            label={getLabel('responsavelCargo', 'Cargo / Função na Empresa')}
            required={isRequired('responsavelCargo', true)}
            placeholder={getPlaceholder('responsavelCargo', 'Ex: Proprietário, Diretor Comercial, Gerente...')}
            helper={getHelper('responsavelCargo')}
            value={data.responsavelCargo}
            onChange={(e) => onChange('responsavelCargo', e.target.value)}
            error={errors.responsavelCargo}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEnabled('responsavelWhatsapp') && (
          <TextInput
            id="manager-whatsapp"
            label={getLabel('responsavelWhatsapp', 'WhatsApp Direto do Responsável')}
            required={isRequired('responsavelWhatsapp', true)}
            placeholder={getPlaceholder('responsavelWhatsapp', '(11) 90000-0000')}
            value={data.responsavelWhatsapp}
            onChange={(e) => onChange('responsavelWhatsapp', e.target.value)}
            error={errors.responsavelWhatsapp}
            helper={getHelper('responsavelWhatsapp', 'Para envio de relatórios e mensagens diretas da equipe')}
          />
        )}

        {isEnabled('responsavelEmail') && (
          <TextInput
            id="manager-email"
            type="email"
            label={getLabel('responsavelEmail', 'E-mail Corporativo ou Pessoal')}
            required={isRequired('responsavelEmail', true)}
            placeholder={getPlaceholder('responsavelEmail', 'carlos@suaempresa.com.br')}
            value={data.responsavelEmail}
            onChange={(e) => onChange('responsavelEmail', e.target.value)}
            error={errors.responsavelEmail}
            helper={getHelper('responsavelEmail', 'Para convites de acessos e envios formais')}
          />
        )}
      </div>
    </div>
  );
};
