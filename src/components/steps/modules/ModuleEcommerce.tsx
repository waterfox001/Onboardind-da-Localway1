import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../../FormControls';
import { ShoppingBag } from 'lucide-react';

interface ModuleEcommerceProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleEcommerce: React.FC<ModuleEcommerceProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-ecommerce">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Loja Virtual / E-commerce
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Informações sobre catálogo, logística, métodos de pagamento e operação da loja.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="ecom-produtos-vendidos"
          label="Quais tipos de produtos serão vendidos?"
          required
          placeholder="Ex: Roupas femininas, cosméticos naturais, eletrônicos..."
          value={data.ecommerceProdutosVendidos}
          onChange={(e) => onChange('ecommerceProdutosVendidos', e.target.value)}
          error={errors.ecommerceProdutosVendidos}
        />

        <TextInput
          id="ecom-quantidade-produtos"
          label="Quantidade aproximada de produtos iniciais"
          placeholder="Ex: 50 a 100 produtos cadastrados"
          value={data.ecommerceQuantidadeProdutos}
          onChange={(e) => onChange('ecommerceQuantidadeProdutos', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <RadioGroup
          label="Já possui fotos profissionais dos produtos?"
          name="ecom-possui-fotos"
          required
          options={['Sim', 'Não']}
          value={data.ecommercePossuiFotos}
          onChange={(v) => onChange('ecommercePossuiFotos', v)}
          error={errors.ecommercePossuiFotos}
          horizontal
        />

        <RadioGroup
          label="Já possui cadastro dos produtos pronto (planilha ou sistema)?"
          name="ecom-possui-cadastro"
          required
          options={['Sim', 'Não']}
          value={data.ecommercePossuiCadastro}
          onChange={(v) => onChange('ecommercePossuiCadastro', v)}
          error={errors.ecommercePossuiCadastro}
          horizontal
        />
      </div>

      <div className="space-y-3">
        <CheckboxGroup
          label="Quais formas de pagamento a loja virtual deve aceitar?"
          options={['Pix automático', 'Cartão de Crédito com parcelamento', 'Boleto Bancário']}
          selectedValues={data.ecommerceFormasPagamento}
          onChange={(v) => onChange('ecommerceFormasPagamento', v)}
          columns={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="ecom-entrega"
          label="Como será feita a entrega dos produtos?"
          placeholder="Ex: Correios (Sedex/PAC), Transportadora Melhor Envio, Motoboy local, Retirada..."
          value={data.ecommerceEntrega}
          onChange={(e) => onChange('ecommerceEntrega', e.target.value)}
        />

        <TextInput
          id="ecom-regioes-atendidas"
          label="Quais regiões a loja vai atender?"
          placeholder="Ex: Todo o Brasil, Estado de São Paulo, Região Metropolitana..."
          value={data.ecommerceRegioesAtendidas}
          onChange={(e) => onChange('ecommerceRegioesAtendidas', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="ecom-dominio"
          label="Já possui domínio registrado para a loja?"
          placeholder="Ex: Sim (lojasuaempresa.com.br) ou Não registrado ainda"
          value={data.ecommercePossuiDominio}
          onChange={(e) => onChange('ecommercePossuiDominio', e.target.value)}
        />

        <TextInput
          id="ecom-sistema-pagamento"
          label="Já possui sistema ou gateway de pagamento contratado?"
          placeholder="Ex: Mercado Pago, PagSeguro, Asaas, Appmax, etc."
          value={data.ecommercePossuiSistemaPagamento}
          onChange={(e) => onChange('ecommercePossuiSistemaPagamento', e.target.value)}
        />
      </div>

      <TextInput
        id="ecom-referencia"
        label="Existe alguma loja virtual que você admira e gostaria de usar como referência?"
        placeholder="Link de uma loja online de referência..."
        value={data.ecommerceReferencia}
        onChange={(e) => onChange('ecommerceReferencia', e.target.value)}
      />
    </div>
  );
};
