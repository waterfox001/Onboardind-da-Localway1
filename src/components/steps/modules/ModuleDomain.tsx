import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, RadioGroup } from '../../FormControls';
import { AtSign, MessageCircle, HelpCircle } from 'lucide-react';

interface ModuleDomainProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleDomain: React.FC<ModuleDomainProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-registro-dominio">
      {/* Header com cor do serviço Registro de Domínio */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
          <AtSign className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Registro de Domínio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina como deseja configurar o endereço do seu site na internet.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <RadioGroup
          label="Qual é a situação do domínio da sua empresa?"
          name="dominio-situacao"
          required
          options={[
            'Já possuo um domínio registrado',
            'Quero comprar / registrar um novo domínio',
            'Tenho dúvidas e quero entender com a Localway como funciona',
          ]}
          value={
            data.dominioJaPossui === 'Sim'
              ? 'Já possuo um domínio registrado'
              : data.dominioJaPossui === 'Duvidas'
              ? 'Tenho dúvidas e quero entender com a Localway como funciona'
              : data.dominioJaPossui === 'Não'
              ? 'Quero comprar / registrar um novo domínio'
              : ''
          }
          onChange={(v) => {
            if (v === 'Já possuo um domínio registrado') {
              onChange('dominioJaPossui', 'Sim');
            } else if (v === 'Quero comprar / registrar um novo domínio') {
              onChange('dominioJaPossui', 'Não');
            } else {
              onChange('dominioJaPossui', 'Duvidas');
            }
          }}
          error={errors.dominioJaPossui}
        />

        {/* 1. Já possui domínio */}
        {data.dominioJaPossui === 'Sim' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
            <TextInput
              id="dominio-atual"
              label="Qual é o seu domínio atual?"
              required
              placeholder="ex: suaempresa.com.br"
              value={data.dominioAtual}
              onChange={(e) => onChange('dominioAtual', e.target.value)}
              error={errors.dominioAtual}
            />
          </div>
        )}

        {/* 2. Quer comprar novo domínio */}
        {data.dominioJaPossui === 'Não' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
            <TextInput
              id="dominio-desejado"
              label="Qual nome de domínio você gostaria de registrar?"
              required
              placeholder="ex: suamarca ou nomedaempresa"
              value={data.dominioDesejado}
              onChange={(e) => onChange('dominioDesejado', e.target.value)}
              error={errors.dominioDesejado}
            />

            <div className="space-y-3">
              <RadioGroup
                label="Qual extensão de domínio você prefere?"
                name="dominio-extensao"
                required
                options={['.com.br', '.com', 'Ainda não sei (orientação da Localway)', 'Outra']}
                value={data.dominioExtensao}
                onChange={(v) => onChange('dominioExtensao', v)}
                error={errors.dominioExtensao}
              />

              {data.dominioExtensao === 'Outra' && (
                <TextInput
                  id="dominio-outra-extensao"
                  label="Qual outra extensão?"
                  placeholder="ex: .io, .adv.br, .med.br"
                  value={data.dominioOutraExtensao}
                  onChange={(e) => onChange('dominioOutraExtensao', e.target.value)}
                />
              )}
            </div>
          </div>
        )}

        {/* 3. Quer tirar dúvidas / entender com a Localway */}
        {data.dominioJaPossui === 'Duvidas' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Sem problemas! Nós cuidamos disso para você.
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Nossa equipe de especialistas da Localway irá pesquisar os melhores nomes e extensões disponíveis para o seu negócio e explicar pelo WhatsApp como funciona o registro oficial no Registro.br e valores anuais.
                </p>
              </div>
            </div>

            <TextInput
              id="dominio-duvidas-ideias"
              label="Alguma ideia inicial ou palavra-chave que gostaria no nome do site? (opcional)"
              placeholder="Ex: Gostaria que tivesse a palavra 'advocacia' ou 'estudio'..."
              value={data.dominioDesejado}
              onChange={(e) => onChange('dominioDesejado', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
