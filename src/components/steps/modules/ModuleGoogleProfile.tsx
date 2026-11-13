import React from 'react';
import { OnboardingData, ManagedServiceConfig } from '../../../types';
import { TextInput, TextArea, RadioGroup } from '../../FormControls';
import { SharedCatalogSection } from '../../SharedCatalogSection';
import { DynamicExtraQuestions } from '../DynamicExtraQuestions';
import { MapPin, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { GoogleAccentDots } from '../../GoogleAccentDots';

interface ModuleGoogleProfileProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  serviceConfig?: ManagedServiceConfig;
}

const NATIVE_GOOGLE_KEYS = new Set([
  'googleJaPossuiPerfil',
  'googleLinkPerfil',
  'formaAtendimento',
  'googleAreaAtendimento',
  'googleItensDestaqueIds',
  'googleInfoAdicionais',
]);

export const ModuleGoogleProfile: React.FC<ModuleGoogleProfileProps> = ({
  data,
  onChange,
  errors,
  serviceConfig,
}) => {
  const getQuestion = (storageKey: string) =>
    serviceConfig?.questions?.find((q) => q.storageKey === storageKey || q.key === storageKey);

  const isEnabled = (storageKey: string) => {
    const q = getQuestion(storageKey);
    return q ? q.enabled !== false : true;
  };

  const hasProfile =
    typeof data.googleJaPossuiPerfil === 'string' &&
    data.googleJaPossuiPerfil.startsWith('Sim');

  const needsRecovery =
    data.googleJaPossuiPerfil === 'Sim, mas perdemos o acesso e precisamos recuperá-lo';

  const showAreaAtendimento =
    Boolean(data.enderecoSemLocalFisico) ||
    (Boolean(data.formaAtendimento) &&
      data.formaAtendimento !== 'Atendemos clientes em nosso estabelecimento');

  const q1 = getQuestion('googleJaPossuiPerfil');
  const q2 = getQuestion('googleLinkPerfil');
  const q3 = getQuestion('formaAtendimento');
  const q4 = getQuestion('googleAreaAtendimento');
  const q5 = getQuestion('googleItensDestaqueIds');
  const q6 = getQuestion('googleInfoAdicionais');

  const formattedAddress = data.enderecoSemLocalFisico
    ? `Atendimento sem ponto físico fixo (${data.cidade || '-'}${data.estado ? '/' + data.estado : ''})`
    : data.ruaAvenida
    ? `${data.ruaAvenida}${data.numero ? ', ' + data.numero : ''} - ${data.bairro || ''}, ${data.cidade || ''}/${data.estado || ''}`
    : 'Não informado';

  return (
    <div className="space-y-6" id="module-google-profile">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              {serviceConfig?.title || 'Perfil da Empresa no Google'}
            </h2>
            <GoogleAccentDots size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {serviceConfig?.tagline ||
              'Presença no Google Maps e pesquisas locais utilizando os dados gerais da empresa.'}
          </p>
        </div>
      </div>

      {/* Automatic Reuse Summary Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Dados gerais reaproveitados automaticamente neste perfil</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-emerald-900/90">
          <div>
            <span className="text-emerald-700/80 block">Nome / WhatsApp:</span>
            <strong className="font-semibold">
              {data.nomeFantasia || '-'} • {data.whatsapp || data.telefone || '-'}
            </strong>
          </div>
          <div className="sm:col-span-2">
            <span className="text-emerald-700/80 block">Localização / Horários:</span>
            <strong className="font-semibold">{formattedAddress}</strong>
          </div>
        </div>
      </div>

      {/* Pergunta 1 — Situação Atual */}
      {isEnabled('googleJaPossuiPerfil') && (
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <RadioGroup
            label={q1?.label || 'Sua empresa já possui um Perfil da Empresa no Google cadastrado?'}
            name="google-ja-possui"
            required={q1?.required ?? true}
            options={
              q1?.options?.length
                ? q1.options
                : [
                    'Sim, já temos e somos administradores',
                    'Sim, mas perdemos o acesso e precisamos recuperá-lo',
                    'Não possuímos perfil ou não temos certeza',
                  ]
            }
            value={data.googleJaPossuiPerfil}
            onChange={(v) => onChange('googleJaPossuiPerfil', v)}
            error={errors.googleJaPossuiPerfil}
          />

          {needsRecovery && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold">Orientação de Recuperação de Acesso</strong>
                <p className="leading-relaxed">
                  Nossa equipe auxiliará no processo de solicitação de propriedade ou nova verificação junto ao Google. Caso localize o link do perfil na busca, informe abaixo para agilizar.
                </p>
              </div>
            </div>
          )}

          {/* Pergunta 2 — Link do Perfil (somente se já possui) */}
          {hasProfile && isEnabled('googleLinkPerfil') && (
            <div className="pt-2 border-t border-slate-200/70 animate-fadeIn">
              <TextInput
                id="google-link-perfil"
                type="url"
                label={q2?.label || 'Informe o link do seu Perfil da Empresa no Google'}
                placeholder={
                  q2?.placeholder || 'https://maps.app.goo.gl/... ou link direto do Google Maps'
                }
                helper={
                  q2?.helper ||
                  'Cole o link do perfil atual para nossa equipe acessar ou solicitar administração.'
                }
                required={q2?.required}
                value={data.googleLinkPerfil}
                onChange={(e) => onChange('googleLinkPerfil', e.target.value)}
                error={errors.googleLinkPerfil}
              />
            </div>
          )}
        </div>
      )}

      {/* Pergunta 3 — Forma de Atendimento (reaproveita do cadastro geral) */}
      {isEnabled('formaAtendimento') && (
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
          {data.formaAtendimento && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 text-[11px] font-semibold">
              <Info className="w-3.5 h-3.5" />
              <span>Reaproveitado do onboarding geral — confirme ou ajuste se necessário</span>
            </div>
          )}

          <RadioGroup
            label={q3?.label || 'Como funciona o atendimento da sua empresa?'}
            name="google-forma-atendimento"
            required={q3?.required ?? true}
            options={
              q3?.options?.length
                ? q3.options
                : [
                    'Atendemos clientes em nosso estabelecimento',
                    'Atendemos somente na região dos clientes',
                    'Trabalhamos das duas formas',
                  ]
            }
            value={data.formaAtendimento || ''}
            onChange={(v) => onChange('formaAtendimento', v)}
            error={errors.formaAtendimento}
          />

          {/* Pergunta 4 — Área de Atendimento (condicional) */}
          {showAreaAtendimento && isEnabled('googleAreaAtendimento') && (
            <div className="pt-3 border-t border-slate-200/70 animate-fadeIn">
              <TextInput
                id="google-area-atendimento"
                label={q4?.label || 'Quais bairros, cidades ou regiões sua empresa atende?'}
                placeholder={
                  q4?.placeholder ||
                  'Ex: Toda a cidade e região metropolitana, bairros Centro, Aldeota...'
                }
                helper={
                  q4?.helper ||
                  'Regiões de cobertura para exibirmos nas pesquisas do Google Maps.'
                }
                required={q4?.required}
                value={data.googleAreaAtendimento}
                onChange={(e) => onChange('googleAreaAtendimento', e.target.value)}
                error={errors.googleAreaAtendimento}
              />
            </div>
          )}
        </div>
      )}

      {/* Pergunta 5 — Principais Produtos e Serviços (até 3, reaproveitando cadastro compartilhado) */}
      {isEnabled('googleItensDestaqueIds') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
          <SharedCatalogSection
            data={data}
            onChange={onChange}
            mode="picker"
            targetService="google"
            filterType="all"
            selectedIdsField="googleItensDestaqueIds"
            maxItems={3}
            title={
              q5?.label ||
              'Quais produtos ou serviços você gostaria de destacar no seu Perfil da Empresa no Google?'
            }
            subtitle={
              q5?.helper ||
              'Selecione até 3 itens do seu cadastro compartilhado ou adicione abaixo (opcional — não é obrigatório preencher os 3).'
            }
          />
        </div>
      )}

      {/* Complementos opcionais específicos do Google */}
      {isEnabled('googleInfoAdicionais') && (
        <TextArea
          id="google-info-adicionais"
          label={q6?.label || 'Informações complementares específicas para o Perfil no Google (opcional)'}
          placeholder={
            q6?.placeholder ||
            'Ex: Correções urgentes no perfil antigo, acessibilidade, diferenciais de atendimento...'
          }
          helper={q6?.helper}
          required={q6?.required}
          value={data.googleInfoAdicionais}
          onChange={(e) => onChange('googleInfoAdicionais', e.target.value)}
          rows={3}
        />
      )}

      {/* Perguntas customizadas adicionadas pelo Admin */}
      <DynamicExtraQuestions
        questions={serviceConfig?.questions || []}
        data={data}
        onChange={onChange}
        errors={errors}
        nativeKeys={NATIVE_GOOGLE_KEYS}
      />
    </div>
  );
};
