import React from 'react';
import { OnboardingData } from '../../types';
import { OnboardingFieldConfig } from '../../constants/formSchema';
import { RadioGroup, CheckboxGroup, TextInput } from '../FormControls';
import { Layers, Car, Languages, CreditCard } from 'lucide-react';

interface StepStructureProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  fieldsConfig?: OnboardingFieldConfig[];
}

export const StepStructure: React.FC<StepStructureProps> = ({
  data,
  onChange,
  errors,
  fieldsConfig,
}) => {
  const getField = (fieldId: string) => fieldsConfig?.find((f) => f.id === fieldId);
  const isFieldVisible = (fieldId: string) => {
    const f = getField(fieldId);
    return f ? f.enabled : true;
  };
  return (
    <div className="space-y-6" id="step-structure">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Estrutura e Facilidades
          </h2>
        </div>
      </div>

      {/* Estacionamento */}
      {isFieldVisible('estacionamento') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              {getField('estacionamento')?.label || 'Estacionamento'}
            </h3>
          </div>

          <RadioGroup
            label={getField('estacionamento')?.helper || "A empresa possui estacionamento ou opções para veículos?"}
            name="estacionamento-opcao"
            required={getField('estacionamento')?.required ?? true}
            options={getField('estacionamento')?.options?.length ? getField('estacionamento')!.options! : [
              'Estacionamento próprio gratuito',
              'Estacionamento próprio pago',
              'Convênio com estacionamento próximo',
              'Estacionamento fácil na rua',
              'Não possui estacionamento',
              'Outro',
            ]}
            value={data.estacionamento}
            onChange={(v) => onChange('estacionamento', v)}
            error={errors.estacionamento}
          />

          {data.estacionamento === 'Outro' && (
            <TextInput
              id="struct-outro-estacionamento"
              label="Como funciona o estacionamento?"
              placeholder="Descreva as opções para clientes..."
              value={data.outroEstacionamento}
              onChange={(e) => onChange('outroEstacionamento', e.target.value)}
            />
          )}
        </div>
      )}

      {/* Idiomas */}
      {isFieldVisible('idiomas') && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              {getField('idiomas')?.label || 'Idiomas de Atendimento'}
            </h3>
          </div>

          <CheckboxGroup
            label={getField('idiomas')?.helper || "Quais idiomas a equipe fala ou oferece suporte?"}
            options={getField('idiomas')?.options?.length ? getField('idiomas')!.options! : ['Português', 'Inglês', 'Espanhol', 'Outro']}
            selectedValues={data.idiomas}
            onChange={(v) => onChange('idiomas', v)}
            columns={2}
          />
        </div>
      )}

      {/* Formas de pagamento */}
      {isFieldVisible('formasPagamento') && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              {getField('formasPagamento')?.label || 'Formas de Pagamento Aceitas'}
            </h3>
          </div>

          <CheckboxGroup
            label={getField('formasPagamento')?.helper || "Selecione todas as modalidades aceitas pelo negócio:"}
            options={getField('formasPagamento')?.options?.length ? getField('formasPagamento')!.options! : [
              'Pix',
              'Cartão de Crédito',
              'Cartão de Débito',
              'Dinheiro',
              'Boleto Bancário',
              'Parcelamento sem juros',
              'Outro',
            ]}
            selectedValues={data.formasPagamento}
            onChange={(v) => onChange('formasPagamento', v)}
            columns={2}
            helper="Essas informações serão exibidas em seus canais e no Google para facilitar a decisão de compra."
          />

          {data.formasPagamento.includes('Outro') && (
            <TextInput
              id="struct-outro-pagamento"
              label="Qual outra forma de pagamento?"
              placeholder="Ex: Faturamento para empresas, convênios, etc."
              value={data.outroPagamento}
              onChange={(e) => onChange('outroPagamento', e.target.value)}
            />
          )}

          {/* Pergunta condicional de Bandeiras de Cartão */}
          {isFieldVisible('bandeirasCartao') && (data.formasPagamento.includes('Cartão de Crédito') ||
            data.formasPagamento.includes('Cartão de Débito')) && (
            <div className="mt-4 p-4 rounded-xl bg-blue-50/40 border border-blue-100/80 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <span>{getField('bandeirasCartao')?.label || 'Quais bandeiras de cartão a sua empresa aceita?'}</span>
              </h4>
              <CheckboxGroup
                label=""
                options={getField('bandeirasCartao')?.options?.length ? getField('bandeirasCartao')!.options! : [
                  'Visa',
                  'Mastercard',
                  'Elo',
                  'American Express',
                  'Hipercard',
                  'Outra',
                ]}
                selectedValues={data.bandeirasCartao || []}
                onChange={(v) => onChange('bandeirasCartao', v)}
                columns={3}
                helper={getField('bandeirasCartao')?.helper}
              />

              {(data.bandeirasCartao || []).includes('Outra') && (
                <TextInput
                  id="struct-outra-bandeira"
                  label="Qual outra bandeira?"
                  placeholder="Ex: Cabal, Banricard, Alelo..."
                  value={data.outraBandeiraCartao || ''}
                  onChange={(e) => onChange('outraBandeiraCartao', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
