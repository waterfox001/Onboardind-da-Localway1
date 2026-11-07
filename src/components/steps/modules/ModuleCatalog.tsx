import React from 'react';
import { OnboardingData } from '../../../types';
import { RadioGroup, TextInput, TextArea } from '../../FormControls';
import { BookOpen } from 'lucide-react';

interface ModuleCatalogProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleCatalog: React.FC<ModuleCatalogProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-6" id="module-catalog">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Catálogo de Produtos e Serviços
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Estruturação e organização visual dos itens, descrições e valores para apresentação digital.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="cat-tipo-itens"
          label="Quais tipos de itens entrarão no catálogo?"
          required
          placeholder="Ex: Pratos do cardápio, procedimentos estéticos, peças de vestuário..."
          value={data.catalogoTipoItens}
          onChange={(e) => onChange('catalogoTipoItens', e.target.value)}
        />

        <TextInput
          id="cat-qtd-itens"
          label="Quantidade aproximada de itens no catálogo"
          placeholder="Ex: 20 a 40 itens organizados por categorias"
          value={data.catalogoQuantidadeItens}
          onChange={(e) => onChange('catalogoQuantidadeItens', e.target.value)}
        />
      </div>

      <RadioGroup
        label="Deseja exibir os preços no catálogo?"
        name="cat-precos"
        required
        options={['Sim, exibir todos os valores', 'Não, apenas apresentação sem preços (consultar via WhatsApp)', 'Alguns itens com valor e outros sob consulta']}
        value={data.catalogoPossuiPrecos}
        onChange={(v) => onChange('catalogoPossuiPrecos', v)}
      />
    </div>
  );
};
