import React from 'react';
import { OnboardingData, ManagedServiceConfig } from '../../../types';
import { TextInput, TextArea, CheckboxGroup, RadioGroup } from '../../FormControls';
import { SharedCatalogSection } from '../../SharedCatalogSection';
import { DynamicExtraQuestions } from '../DynamicExtraQuestions';
import { Smartphone, CheckCircle2, Upload, Wifi, QrCode } from 'lucide-react';

interface ModuleMiniSiteProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  serviceConfig?: ManagedServiceConfig;
}

const NATIVE_MINISITE_KEYS = new Set([
  'minisiteInformacoes',
  'minisiteApresentacao',
  'minisiteItensDestaqueIds',
  'minisiteCatalogoPossui',
  'minisiteCatalogoLink',
  'minisiteCatalogoArquivo',
  'minisiteCoresDesejadas',
  'minisiteCoresEvitar',
  'minisiteReferenciaVisual',
  'minisiteRecursosAdicionais',
]);

export const ModuleMiniSite: React.FC<ModuleMiniSiteProps> = ({
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

  const selectedLinks = data.minisiteInformacoes || [];
  const selectedExtras = data.minisiteRecursosAdicionais || [];

  const q1 = getQuestion('minisiteInformacoes');
  const q2 = getQuestion('minisiteApresentacao');
  const q3 = getQuestion('minisiteItensDestaqueIds');
  const q4 = getQuestion('minisiteCatalogoPossui');
  const q5Colors = getQuestion('minisiteCoresDesejadas');
  const q5Avoid = getQuestion('minisiteCoresEvitar');
  const q6 = getQuestion('minisiteReferenciaVisual');
  const q7 = getQuestion('minisiteRecursosAdicionais');

  const hasAddress = Boolean(data.ruaAvenida || data.cidade) && !data.enderecoSemLocalFisico;

  return (
    <div className="space-y-6" id="module-mini-site">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {serviceConfig?.title || 'Mini Site'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {serviceConfig?.tagline ||
              'Página rápida para bio e links, reaproveitando automaticamente seus contatos e cadastro geral.'}
          </p>
        </div>
      </div>

      {/* Pergunta 1 — Links e Botões */}
      {isEnabled('minisiteInformacoes') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <CheckboxGroup
            label={q1?.label || 'Quais links e botões você deseja destacar no seu mini site?'}
            options={
              q1?.options?.length
                ? q1.options
                : [
                    'WhatsApp',
                    'Instagram',
                    'Facebook',
                    'Site oficial',
                    'Localização / Como chegar',
                    'Avaliações no Google',
                    'Catálogo / Cardápio',
                    'Outros',
                  ]
            }
            selectedValues={selectedLinks}
            onChange={(v) => onChange('minisiteInformacoes', v)}
            helper={
              q1?.helper ||
              'Os links já informados no onboarding geral serão reaproveitados automaticamente.'
            }
            columns={2}
          />
          {errors.minisiteInformacoes && (
            <span className="text-xs font-medium text-red-600 block">
              {errors.minisiteInformacoes}
            </span>
          )}

          {/* Reaproveitamento automático e solicitação apenas do que estiver faltando */}
          {selectedLinks.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-200/80">
              {selectedLinks.includes('WhatsApp') && data.whatsapp && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>WhatsApp reaproveitado do cadastro geral:</strong> {data.whatsapp}
                  </span>
                </div>
              )}

              {selectedLinks.includes('Instagram') && data.instagram && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Instagram reaproveitado do cadastro geral:</strong> {data.instagram}
                  </span>
                </div>
              )}
              {selectedLinks.includes('Instagram') && !data.instagram && (
                <TextInput
                  id="minisite-instagram"
                  label="Informe o Instagram para o botão do mini site"
                  placeholder="@suaempresa"
                  value={data.minisiteInstagram}
                  onChange={(e) => onChange('minisiteInstagram', e.target.value)}
                />
              )}

              {selectedLinks.includes('Facebook') && data.facebookOutras && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Facebook/Redes reaproveitado do cadastro geral:</strong>{' '}
                    {data.facebookOutras}
                  </span>
                </div>
              )}
              {selectedLinks.includes('Facebook') && !data.facebookOutras && (
                <TextInput
                  id="minisite-facebook"
                  type="url"
                  label="Informe o link do Facebook"
                  placeholder="https://facebook.com/suaempresa"
                  value={data.minisiteFacebook || ''}
                  onChange={(e) => onChange('minisiteFacebook', e.target.value)}
                />
              )}

              {selectedLinks.includes('Site oficial') && data.site && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Site oficial reaproveitado do cadastro geral:</strong> {data.site}
                  </span>
                </div>
              )}
              {selectedLinks.includes('Site oficial') && !data.site && (
                <TextInput
                  id="minisite-site"
                  type="url"
                  label="Informe o endereço do Site oficial"
                  placeholder="https://suaempresa.com.br"
                  value={data.minisiteSite}
                  onChange={(e) => onChange('minisiteSite', e.target.value)}
                />
              )}

              {selectedLinks.includes('Localização / Como chegar') && hasAddress && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Localização reaproveitada:</strong> {data.ruaAvenida},{' '}
                    {data.numero || 'S/N'} - {data.cidade}/{data.estado}
                  </span>
                </div>
              )}
              {selectedLinks.includes('Localização / Como chegar') && !hasAddress && (
                <TextInput
                  id="minisite-endereco"
                  label="Informe o link do Google Maps ou endereço para o botão Como Chegar"
                  placeholder="https://maps.app.goo.gl/... ou endereço completo"
                  value={data.minisiteEndereco}
                  onChange={(e) => onChange('minisiteEndereco', e.target.value)}
                />
              )}

              {selectedLinks.includes('Avaliações no Google') && data.googleLinkPerfil && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Link do Perfil no Google reaproveitado:</strong> {data.googleLinkPerfil}
                  </span>
                </div>
              )}
              {selectedLinks.includes('Avaliações no Google') && !data.googleLinkPerfil && (
                <TextInput
                  id="minisite-google-reviews"
                  type="url"
                  label="Link para avaliações no Google (se já tiver)"
                  placeholder="https://g.page/r/..."
                  value={data.minisiteGoogleReviews || ''}
                  onChange={(e) => onChange('minisiteGoogleReviews', e.target.value)}
                  helper="Caso esteja criando o perfil agora com a Localway, pode deixar em branco."
                />
              )}

              {selectedLinks.includes('Outros') && (
                <TextInput
                  id="minisite-outra-info"
                  label="Quais outros links ou botões deseja incluir?"
                  placeholder="Ex: Canal no YouTube, TikTok, Grupo VIP..."
                  value={data.minisiteOutraInfo}
                  onChange={(e) => onChange('minisiteOutraInfo', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Pergunta 2 — Apresentação */}
      {isEnabled('minisiteApresentacao') && (
        <TextArea
          id="minisite-apresentacao"
          label={
            q2?.label ||
            'Qual frase de apresentação, slogan ou descrição você gostaria de utilizar no mini site?'
          }
          placeholder={
            q2?.placeholder ||
            'Se não possuir slogan, deixe em branco que a Localway cria uma apresentação profissional para você.'
          }
          helper={q2?.helper}
          required={q2?.required}
          value={data.minisiteApresentacao || ''}
          onChange={(e) => onChange('minisiteApresentacao', e.target.value)}
          rows={3}
        />
      )}

      {/* Pergunta 3 — Produtos e Serviços em Destaque (até 3) */}
      {isEnabled('minisiteItensDestaqueIds') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 space-y-3">
          <SharedCatalogSection
            data={data}
            onChange={onChange}
            mode="picker"
            targetService="minisite"
            filterType="all"
            selectedIdsField="minisiteItensDestaqueIds"
            maxItems={3}
            title={q3?.label || 'Quais produtos ou serviços você deseja destacar no mini site?'}
            subtitle={
              q3?.helper ||
              'Escolha até 3 itens já cadastrados no cadastro compartilhado ou adicione novos abaixo.'
            }
          />
        </div>
      )}

      {/* Pergunta 4 — Catálogo Digital */}
      {isEnabled('minisiteCatalogoPossui') && (
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <RadioGroup
            label={
              q4?.label ||
              'Sua empresa possui catálogo digital, cardápio ou lista de produtos e serviços?'
            }
            name="minisite-catalogo-possui"
            required={q4?.required}
            options={
              q4?.options?.length
                ? q4.options
                : ['Sim, tenho um link', 'Sim, tenho um arquivo ou PDF', 'Não possuo']
            }
            value={data.minisiteCatalogoPossui || ''}
            onChange={(v) => onChange('minisiteCatalogoPossui', v)}
          />

          {data.minisiteCatalogoPossui === 'Sim, tenho um link' && (
            <div className="pt-2 animate-fadeIn">
              <TextInput
                id="minisite-catalogo-link"
                type="url"
                label="Informe o link do catálogo ou cardápio"
                placeholder="https://..."
                value={data.minisiteCatalogoLink || ''}
                onChange={(e) => onChange('minisiteCatalogoLink', e.target.value)}
              />
            </div>
          )}

          {data.minisiteCatalogoPossui === 'Sim, tenho um arquivo ou PDF' && (
            <div className="pt-2 space-y-2 animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-700">
                Envie ou informe o arquivo/PDF do catálogo
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  type="text"
                  value={data.minisiteCatalogoArquivo || ''}
                  onChange={(e) => onChange('minisiteCatalogoArquivo', e.target.value)}
                  placeholder="Nome do arquivo ou link de download do PDF"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Anexar PDF/Arquivo</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onChange('minisiteCatalogoArquivo', `Arquivo selecionado: ${f.name}`);
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pergunta 5 — Preferências Visuais & Pergunta 6 — Referência Visual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isEnabled('minisiteCoresDesejadas') && (
          <TextInput
            id="minisite-cores-desejadas"
            label={q5Colors?.label || 'Quais cores gostaria de utilizar no mini site?'}
            placeholder={q5Colors?.placeholder || 'Ex: Azul escuro e branco, tons neutros...'}
            value={data.minisiteCoresDesejadas || ''}
            onChange={(e) => onChange('minisiteCoresDesejadas', e.target.value)}
          />
        )}

        {isEnabled('minisiteCoresEvitar') && (
          <TextInput
            id="minisite-cores-evitar"
            label={q5Avoid?.label || 'Quais cores prefere evitar?'}
            placeholder={q5Avoid?.placeholder || 'Ex: Amarelo neon, roxo...'}
            value={data.minisiteCoresEvitar || ''}
            onChange={(e) => onChange('minisiteCoresEvitar', e.target.value)}
          />
        )}
      </div>

      {isEnabled('minisiteReferenciaVisual') && (
        <TextInput
          id="minisite-referencia-visual"
          type="url"
          label={q6?.label || 'Existe algum site ou mini site que você utiliza como referência?'}
          placeholder={q6?.placeholder || 'https://...'}
          value={data.minisiteReferenciaVisual || ''}
          onChange={(e) => onChange('minisiteReferenciaVisual', e.target.value)}
        />
      )}

      {/* Pergunta 7 — Recursos Adicionais (Wi-Fi, Pix, Horários, Endereço) */}
      {isEnabled('minisiteRecursosAdicionais') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
          <CheckboxGroup
            label={
              q7?.label ||
              'Quais recursos adicionais você gostaria de disponibilizar no mini site?'
            }
            options={
              q7?.options?.length
                ? q7.options
                : [
                    'Wi-Fi',
                    'Pix',
                    'Horários de funcionamento',
                    'Endereço e localização',
                    'Outros',
                  ]
            }
            selectedValues={selectedExtras}
            onChange={(v) => onChange('minisiteRecursosAdicionais', v)}
            columns={2}
          />

          {selectedExtras.includes('Wi-Fi') && (
            <div className="p-4 rounded-xl bg-white border border-blue-200/80 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Wifi className="w-4 h-4 text-blue-600" />
                <span>Dados do Wi-Fi para o Mini Site (preencha apenas se desejar publicar)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  id="minisite-wifi-rede"
                  label="Nome da rede Wi-Fi"
                  placeholder="Ex: Localway_Clientes"
                  value={data.minisiteWifiRede || ''}
                  onChange={(e) => onChange('minisiteWifiRede', e.target.value)}
                />
                <TextInput
                  id="minisite-wifi-senha"
                  label="Senha do Wi-Fi"
                  placeholder="Ex: bemvindo123"
                  value={data.minisiteWifiSenha || ''}
                  onChange={(e) => onChange('minisiteWifiSenha', e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedExtras.includes('Pix') && (
            <div className="p-4 rounded-xl bg-white border border-emerald-200/80 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Chave Pix para exibição rápida</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  id="minisite-pix-chave"
                  label="Chave Pix"
                  placeholder="CNPJ, telefone, e-mail ou chave aleatória"
                  value={data.minisitePixChave || ''}
                  onChange={(e) => onChange('minisitePixChave', e.target.value)}
                />
                <TextInput
                  id="minisite-pix-titular"
                  label="Nome do titular (opcional, para identificação)"
                  placeholder="Ex: Empresa Exemplo Ltda"
                  value={data.minisitePixTitular || ''}
                  onChange={(e) => onChange('minisitePixTitular', e.target.value)}
                />
              </div>
            </div>
          )}

          {selectedExtras.includes('Horários de funcionamento') && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2.5 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Horários de funcionamento:</strong> serão reutilizados automaticamente do seu cadastro geral.
              </span>
            </div>
          )}

          {selectedExtras.includes('Endereço e localização') && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-2.5 rounded-xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Endereço e localização:</strong>{' '}
                {hasAddress
                  ? `serão reutilizados automaticamente (${data.ruaAvenida}, ${data.cidade}/${data.estado}).`
                  : `será exibida a área de atendimento (${data.cidade || 'conforme cadastro geral'}).`}
              </span>
            </div>
          )}

          {selectedExtras.includes('Outros') && (
            <TextInput
              id="minisite-recursos-outros"
              label="Quais outros recursos deseja incluir no mini site?"
              placeholder="Descreva os recursos adicionais..."
              value={data.minisiteRecursosOutros || ''}
              onChange={(e) => onChange('minisiteRecursosOutros', e.target.value)}
            />
          )}
        </div>
      )}

      <DynamicExtraQuestions
        questions={serviceConfig?.questions || []}
        data={data}
        onChange={onChange}
        errors={errors}
        nativeKeys={NATIVE_MINISITE_KEYS}
      />
    </div>
  );
};
