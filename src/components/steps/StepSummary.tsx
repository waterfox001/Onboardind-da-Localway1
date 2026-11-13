import React from 'react';
import { OnboardingData, StepType } from '../../types';
import { SERVICES_LIST, DEFAULT_SERVICES_CONFIG } from '../../constants/services';
import { SEGMENTS_CONFIG } from '../../constants/segments';
import { FormSchemaState } from '../../constants/formSchema';
import {
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  Layers,
  UserCheck,
  Sparkles,
  FileText,
  Edit3,
  Briefcase,
  PackagePlus,
  Globe,
  Smartphone,
} from 'lucide-react';

interface StepSummaryProps {
  data: OnboardingData;
  onJumpToStep: (stepId: StepType) => void;
  schema?: FormSchemaState;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  data,
  onJumpToStep,
  schema,
}) => {
  const formatDay = (key: keyof OnboardingData['horarios'], label: string) => {
    const s = data.horarios[key];
    if (!s || s.status === 'fechado') return `${label}: Fechado`;
    let txt = `${label}: ${s.abertura1 || '08:00'} às ${s.fechamento1 || '18:00'}`;
    if (s.temIntervalo && s.abertura2) {
      txt += ` e ${s.abertura2} às ${s.fechamento2}`;
    }
    return txt;
  };

  const servicesConfigMap = schema?.servicesConfig || DEFAULT_SERVICES_CONFIG;
  const segmentsConfigMap = schema?.segmentsConfig || SEGMENTS_CONFIG;

  const selectedServicesObjects = SERVICES_LIST.filter((s) =>
    data.servicosContratados.includes(s.id)
  ).map((s) => ({
    ...s,
    title: servicesConfigMap[s.id]?.title || s.title,
  }));

  const catalogItems = data.catalogoCompartilhado || [];
  const resolveCatalogNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return [];
    return ids
      .map((id) => catalogItems.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => `${item!.nome}${item!.preco ? ` (${item!.preco})` : ''}`);
  };

  const googleHighlights = resolveCatalogNames(data.googleItensDestaqueIds);
  const minisiteHighlights = resolveCatalogNames(data.minisiteItensDestaqueIds);
  const siteServices = resolveCatalogNames(data.siteServicosSelecionadosIds);
  const siteProducts = resolveCatalogNames(data.siteProdutosSelecionadosIds);

  const customAnswersEntries = Object.entries(data.respostasPersonalizadas || {}).filter(
    ([, val]) =>
      val !== undefined &&
      val !== null &&
      (!Array.isArray(val) ? String(val).trim() !== '' : val.length > 0)
  );

  const getCustomFieldLabel = (fieldId: string): string => {
    const inGeneral = schema?.onboardingFields?.find((f) => f.id === fieldId || f.key === fieldId);
    if (inGeneral) return inGeneral.label;
    for (const svc of Object.values(servicesConfigMap)) {
      const q = svc.questions?.find((item) => item.id === fieldId || item.storageKey === fieldId);
      if (q) return q.label;
    }
    return fieldId;
  };

  return (
    <div className="space-y-6" id="step-summary">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Resumo final
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Revise todos os dados antes de finalizar. Clique em &ldquo;Editar&rdquo; em qualquer bloco para ajustar.
          </p>
        </div>
      </div>

      {/* Bloco: Dados da empresa */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Dados da empresa</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('general_company')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Nome Fantasia:</span>
            <span className="font-semibold text-slate-900">{data.nomeFantasia || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Segmento:</span>
            <span className="font-semibold text-slate-900">
              {data.segmento === 'Outro' ? data.outroSegmento || 'Outro' : data.segmento || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">WhatsApp:</span>
            <span className="font-semibold text-slate-900">{data.whatsapp || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Telefone:</span>
            <span className="font-semibold text-slate-900">{data.telefone || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">E-mail:</span>
            <span className="font-semibold text-slate-900">{data.email || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Site / Redes:</span>
            <span className="font-semibold text-slate-900 break-all">
              {[data.site, data.instagram, data.facebookOutras].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>
        </div>

        {data.descricaoEmpresa && (
          <div className="pt-2 text-xs border-t border-slate-50">
            <span className="text-slate-400 block mb-0.5">Descrição da Empresa:</span>
            <p className="text-slate-700 italic">{data.descricaoEmpresa}</p>
          </div>
        )}

        {/* Segment Details Inline Summary */}
        {(() => {
          const segConfig = data.segmento ? segmentsConfigMap[data.segmento] : null;
          if (!segConfig || !Array.isArray(segConfig.questions)) return null;
          const answered = segConfig.questions.filter((q) => {
            const resp = data.segmentoRespostas?.[q.id];
            return resp && (!Array.isArray(resp) || resp.length > 0);
          });
          if (answered.length === 0) return null;

          return (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>Perguntas do Segmento ({segConfig.name})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {answered.map((q) => {
                  const resp = data.segmentoRespostas[q.id];
                  const outroText = data.segmentoRespostas[`${q.id}_outro`];
                  const displayVal = Array.isArray(resp)
                    ? resp
                        .map((item: string) =>
                          q.otherLabel && item === q.otherLabel && outroText?.trim()
                            ? `${item}: "${outroText.trim()}"`
                            : item
                        )
                        .join(', ')
                    : q.otherLabel && resp === q.otherLabel && outroText?.trim()
                    ? `${resp}: "${outroText.trim()}"`
                    : String(resp);
                  return (
                    <div key={q.id} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 block text-[11px] mb-0.5">{q.label}</span>
                      <span className="font-semibold text-slate-800">{displayVal}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Address */}
        <div className="pt-3 border-t border-slate-100 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Endereço</span>
          </div>
          {data.enderecoSemLocalFisico ? (
            <p className="text-xs font-medium text-blue-700 bg-blue-50/70 px-3 py-2 rounded-xl border border-blue-100">
              Sem estabelecimento físico fixo aberto ao público • Atuação em: {data.cidade || '-'} / {data.estado || '-'}
            </p>
          ) : (
            <p className="text-xs font-medium text-slate-800">
              {data.cep ? `CEP ${data.cep} — ` : ''}
              {data.ruaAvenida || 'Rua não informada'}, nº {data.numero || 'S/N'}{' '}
              {data.complemento ? `(${data.complemento})` : ''} - {data.bairro || '-'},{' '}
              {data.cidade || '-'} / {data.estado || '-'}
            </p>
          )}
        </div>

        {/* Hours */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Horário de funcionamento</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
            <span>{formatDay('segunda', 'Seg')}</span>
            <span>{formatDay('terca', 'Ter')}</span>
            <span>{formatDay('quarta', 'Qua')}</span>
            <span>{formatDay('quinta', 'Qui')}</span>
            <span>{formatDay('sexta', 'Sex')}</span>
            <span>{formatDay('sabado', 'Sáb')}</span>
            <span>{formatDay('domingo', 'Dom')}</span>
          </div>
          <div className="text-xs flex flex-wrap items-center gap-2 pt-1">
            <span className="text-slate-400">Agendamento prévio:</span>
            <span className="font-semibold text-slate-900">{data.trabalhaAgendamento || 'Não informado'}</span>
            {data.formasAgendamento.length > 0 && (
              <span className="text-slate-500">({data.formasAgendamento.join(', ')})</span>
            )}
            {data.contatoLinkAgendamento && (
              <span className="text-blue-600 break-all">• Link: {data.contatoLinkAgendamento}</span>
            )}
          </div>
        </div>
      </div>

      {/* Bloco: Serviços contratados */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Serviços contratados ({selectedServicesObjects.length})</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('services')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedServicesObjects.map((s) => (
            <span
              key={s.id}
              className={`px-3 py-1.5 rounded-xl border font-semibold text-xs ${s.bgLight} ${s.textColor} ${s.borderLight}`}
            >
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {/* Blocos dos serviços selecionados */}
      {data.servicosContratados.includes('google') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{servicesConfigMap.google?.title || 'Perfil da Empresa no Google'}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep('module_google')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 block">Situação do Perfil:</span>
              <span className="font-semibold text-slate-900">{data.googleJaPossuiPerfil || '-'}</span>
            </div>
            {data.googleLinkPerfil && (
              <div>
                <span className="text-slate-400 block">Link do Perfil:</span>
                <span className="font-semibold text-blue-600 break-all">{data.googleLinkPerfil}</span>
              </div>
            )}
            {data.googleAreaAtendimento && (
              <div>
                <span className="text-slate-400 block">Área de Atendimento:</span>
                <span className="font-semibold text-slate-900">{data.googleAreaAtendimento}</span>
              </div>
            )}
            {googleHighlights.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Destaques no Google:</span>
                <span className="font-semibold text-slate-900">{googleHighlights.join(' • ')}</span>
              </div>
            )}
            {data.googleInfoAdicionais && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Complementos:</span>
                <span className="text-slate-700">{data.googleInfoAdicionais}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {data.servicosContratados.includes('site') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Globe className="w-4 h-4 text-orange-600" />
              <span>{servicesConfigMap.site?.title || 'Site Institucional'}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep('module_site')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <span className="text-slate-400 block">Objetivo Principal:</span>
              <span className="font-semibold text-slate-900">{data.siteObjetivoPrincipal || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Comercializa Produtos:</span>
              <span className="font-semibold text-slate-900">{data.siteComercializaProdutos || 'Não informado'}</span>
            </div>
            {siteServices.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Serviços para o Site:</span>
                <span className="font-semibold text-slate-900">{siteServices.join(' • ')}</span>
              </div>
            )}
            {siteProducts.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Produtos para o Site:</span>
                <span className="font-semibold text-slate-900">{siteProducts.join(' • ')}</span>
              </div>
            )}
            {data.siteDiferenciais && data.siteDiferenciais.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Diferenciais:</span>
                <span className="font-semibold text-slate-900">{data.siteDiferenciais.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {data.servicosContratados.includes('minisite') && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{servicesConfigMap.minisite?.title || 'Mini Site'}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToStep('module_minisite')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="sm:col-span-2">
              <span className="text-slate-400 block">Links e Botões em Destaque:</span>
              <span className="font-semibold text-slate-900">
                {data.minisiteInformacoes?.length > 0 ? data.minisiteInformacoes.join(', ') : '-'}
              </span>
            </div>
            {data.minisiteApresentacao && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Apresentação no Mini Site:</span>
                <span className="text-slate-700">{data.minisiteApresentacao}</span>
              </div>
            )}
            {minisiteHighlights.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Destaques Selecionados:</span>
                <span className="font-semibold text-slate-900">{minisiteHighlights.join(' • ')}</span>
              </div>
            )}
            {(data.minisiteWifiRede || data.minisitePixChave) && (
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">Recursos Extras:</span>
                <span className="font-semibold text-slate-900">
                  {[
                    data.minisiteWifiRede ? `Wi-Fi: ${data.minisiteWifiRede}` : '',
                    data.minisitePixChave ? `Pix: ${data.minisitePixChave}` : '',
                  ]
                    .filter(Boolean)
                    .join(' | ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bloco: Estrutura, catálogo e materiais */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Estrutura, catálogo e materiais</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('general_structure')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Tipo de Estabelecimento:</span>
            <span className="font-semibold text-slate-900">{data.tipoEstabelecimento || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Forma de Atendimento:</span>
            <span className="font-semibold text-slate-900">{data.formaAtendimento || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Estacionamento:</span>
            <span className="font-semibold text-slate-900">
              {data.estacionamento || (data.formaAtendimento === 'Atendimento 100% online' ? 'Não se aplica (Online)' : '-')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Formas de Pagamento:</span>
            <span className="font-semibold text-slate-900">
              {data.formasPagamento.length > 0 ? data.formasPagamento.join(', ') : 'Não informado'}
              {data.bandeirasCartao && data.bandeirasCartao.length > 0 && (
                <span className="text-slate-500 font-normal block mt-0.5">
                  Bandeiras: {data.bandeirasCartao.join(', ')}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Responsável */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Responsável pelo Projeto</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block">Nome:</span>
              <span className="font-semibold text-slate-900">{data.responsavelNome || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Cargo:</span>
              <span className="font-semibold text-slate-900">{data.responsavelCargo || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Contato:</span>
              <span className="font-semibold text-slate-900">
                {[data.responsavelWhatsapp, data.responsavelEmail].filter(Boolean).join(' • ') || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Cadastro Compartilhado */}
        {catalogItems.length > 0 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <PackagePlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Cadastro Compartilhado de Produtos e Serviços ({catalogItems.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {catalogItems.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800">{item.nome}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 uppercase">
                      {item.tipo === 'produto' ? 'Produto' : 'Serviço'}
                    </span>
                  </div>
                  {item.preco && <span className="text-emerald-700 font-semibold block mt-0.5">{item.preco}</span>}
                  {item.descricao && <p className="text-slate-500 mt-0.5 line-clamp-2">{item.descricao}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Materiais & Observações */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Materiais & Observações Finais</span>
          </div>
          <p>
            <span className="text-slate-400">Possui materiais agora:</span>{' '}
            <span className="font-semibold text-slate-800">{data.possuiMateriais || 'Não informado'}</span>
            {data.tiposMateriais?.length > 0 && ` (${data.tiposMateriais.join(', ')})`}
          </p>
          {data.linkTransferNow && (
            <p>
              <span className="text-slate-400">Link TransferNow:</span>{' '}
              <a
                href={data.linkTransferNow}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium break-all"
              >
                {data.linkTransferNow}
              </a>
            </p>
          )}
          {data.linksMateriais && (
            <p>
              <span className="text-slate-400">Link Nuvem:</span>{' '}
              <span className="text-slate-700 break-all">{data.linksMateriais}</span>
            </p>
          )}
          {data.observacoesMateriais && (
            <p>
              <span className="text-slate-400">Observações de materiais:</span>{' '}
              <span className="text-slate-700">{data.observacoesMateriais}</span>
            </p>
          )}
          {data.observacoesFinais && (
            <p>
              <span className="text-slate-400">Observações finais:</span>{' '}
              <span className="text-slate-700 italic">{data.observacoesFinais}</span>
            </p>
          )}
        </div>
      </div>

      {/* Perguntas personalizadas adicionadas pelo Admin */}
      {customAnswersEntries.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="font-bold text-sm text-slate-800 pb-2 border-b border-slate-100">
            Respostas Adicionais
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {customAnswersEntries.map(([k, v]) => (
              <div key={k} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] mb-0.5">{getCustomFieldLabel(k)}</span>
                <span className="font-semibold text-slate-800">
                  {Array.isArray(v) ? v.join(', ') : String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
