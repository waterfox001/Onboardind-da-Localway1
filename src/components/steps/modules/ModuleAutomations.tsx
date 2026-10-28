import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea } from '../../FormControls';
import { Cpu } from 'lucide-react';

interface ModuleAutomationsProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleAutomations: React.FC<ModuleAutomationsProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-automations">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Sistemas e Automações Inteligentes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Mapeamento dos processos, ferramentas a integrar e rotinas que serão automatizadas.
          </p>
        </div>
      </div>

      <TextArea
        id="auto-processo"
        label="Qual processo ou rotina você gostaria de automatizar?"
        required
        placeholder="Ex: Confirmação automática de agendamentos pelo WhatsApp, emissão de orçamentos, disparo de boas-vindas..."
        value={data.autoProcessoAutomatizar}
        onChange={(e) => onChange('autoProcessoAutomatizar', e.target.value)}
        error={errors.autoProcessoAutomatizar}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextArea
          id="auto-como-funciona"
          label="Como esse processo funciona hoje na sua empresa?"
          required
          placeholder="Ex: Fazemos manualmente por mensagem no celular, copiamos na planilha do Google..."
          value={data.autoComoFunciona}
          onChange={(e) => onChange('autoComoFunciona', e.target.value)}
          error={errors.autoComoFunciona}
          rows={3}
        />

        <TextArea
          id="auto-problema-resolver"
          label="Qual é o maior gargalo ou dor que você quer resolver?"
          required
          placeholder="Ex: Demora para responder clientes fora do horário, esquecimento de dados, perda de vendas..."
          value={data.autoProblemaResolver}
          onChange={(e) => onChange('autoProblemaResolver', e.target.value)}
          error={errors.autoProblemaResolver}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="auto-quem-utilizara"
          label="Quem vai utilizar essa ferramenta no dia a dia?"
          placeholder="Ex: Equipe de recepção (2 pessoas), Vendedores, Clientes finais..."
          value={data.autoQuemUtilizara}
          onChange={(e) => onChange('autoQuemUtilizara', e.target.value)}
        />

        <TextInput
          id="auto-sistemas-integrar"
          label="Existe algum sistema ou app que precisa ser integrado?"
          placeholder="Ex: WhatsApp Business API, CRM Pipedrive/RD Station, Planilhas, ERP..."
          value={data.autoSistemaIntegrar}
          onChange={(e) => onChange('autoSistemaIntegrar', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextArea
          id="auto-informacoes-armazenar"
          label="Quais informações precisam ser coletadas ou salvas?"
          placeholder="Ex: Nome, telefone, data agendada, status do pedido, comprovante Pix..."
          value={data.autoInformacoesArmazenar}
          onChange={(e) => onChange('autoInformacoesArmazenar', e.target.value)}
          rows={3}
        />

        <TextArea
          id="auto-acoes-executar"
          label="Quais ações devem disparar automaticamente?"
          placeholder="Ex: Enviar lembrete 2h antes, atualizar status para 'confirmado', avisar no grupo..."
          value={data.autoAcoesExecutar}
          onChange={(e) => onChange('autoAcoesExecutar', e.target.value)}
          rows={3}
        />
      </div>

      <TextInput
        id="auto-exemplo-referencia"
        label="Existe algum exemplo ou ferramenta de referência do que você imagina?"
        placeholder="Ex: Um fluxo similar ao do aplicativo X ou agendador Y..."
        value={data.autoExemploReferencia}
        onChange={(e) => onChange('autoExemploReferencia', e.target.value)}
      />
    </div>
  );
};
