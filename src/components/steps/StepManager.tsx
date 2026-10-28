import React from 'react';
import { OnboardingData } from '../../types';
import { TextInput } from '../FormControls';
import { UserCheck } from 'lucide-react';

interface StepManagerProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const StepManager: React.FC<StepManagerProps> = ({
  data,
  onChange,
  errors,
}) => {
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="manager-nome"
          label="Nome Completo do Responsável"
          required
          placeholder="Ex: Carlos Oliveira"
          value={data.responsavelNome}
          onChange={(e) => onChange('responsavelNome', e.target.value)}
          error={errors.responsavelNome}
        />

        <TextInput
          id="manager-cargo"
          label="Cargo / Função na Empresa"
          required
          placeholder="Ex: Proprietário, Diretor Comercial, Gerente..."
          value={data.responsavelCargo}
          onChange={(e) => onChange('responsavelCargo', e.target.value)}
          error={errors.responsavelCargo}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="manager-whatsapp"
          label="WhatsApp Direto do Responsável"
          required
          placeholder="(11) 90000-0000"
          value={data.responsavelWhatsapp}
          onChange={(e) => onChange('responsavelWhatsapp', e.target.value)}
          error={errors.responsavelWhatsapp}
          helper="Para envio de relatórios e mensagens diretas da equipe"
        />

        <TextInput
          id="manager-email"
          type="email"
          label="E-mail Corporativo ou Pessoal"
          required
          placeholder="carlos@suaempresa.com.br"
          value={data.responsavelEmail}
          onChange={(e) => onChange('responsavelEmail', e.target.value)}
          error={errors.responsavelEmail}
          helper="Para convites de acessos e envios formais"
        />
      </div>
    </div>
  );
};
