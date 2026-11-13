import React from 'react';
import { OnboardingData, ManagedServiceConfig, WebsitePersonItem } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../../FormControls';
import { SharedCatalogSection } from '../../SharedCatalogSection';
import { DynamicExtraQuestions } from '../DynamicExtraQuestions';
import { Globe, CheckCircle2, Plus, Trash2, Upload, Users, Info } from 'lucide-react';

interface ModuleWebsiteProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  serviceConfig?: ManagedServiceConfig;
}

const NATIVE_SITE_KEYS = new Set([
  'siteHistoria',
  'siteApresentarResponsavel',
  'siteDiferenciais',
  'sitePublicoAlvo',
  'siteServicosSelecionadosIds',
  'siteComercializaProdutos',
  'siteProdutosSelecionadosIds',
  'siteProcessoAtendimento',
  'siteOrientacaoPreContratacao',
  'siteApresentarEquipeTipo',
  'sitePossuiVideos',
  'siteSecoesAdicionais',
  'siteDuvidasFrequentes',
  'siteObjetivoPrincipal',
]);

export const ModuleWebsite: React.FC<ModuleWebsiteProps> = ({
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

  const qHistoria = getQuestion('siteHistoria');
  const qResp = getQuestion('siteApresentarResponsavel');
  const qDif = getQuestion('siteDiferenciais');
  const qPub = getQuestion('sitePublicoAlvo');
  const qServ = getQuestion('siteServicosSelecionadosIds');
  const qComProd = getQuestion('siteComercializaProdutos');
  const qProd = getQuestion('siteProdutosSelecionadosIds');
  const qProc = getQuestion('siteProcessoAtendimento');
  const qOrient = getQuestion('siteOrientacaoPreContratacao');
  const qEquipe = getQuestion('siteApresentarEquipeTipo');
  const qVideos = getQuestion('sitePossuiVideos');
  const qSecoes = getQuestion('siteSecoesAdicionais');
  const qDuvidas = getQuestion('siteDuvidasFrequentes');
  const qObj = getQuestion('siteObjetivoPrincipal');

  const teamList: WebsitePersonItem[] = data.siteEquipePessoas || [];

  const handleAddPerson = () => {
    const next: WebsitePersonItem = {
      id: `person_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
      nome: '',
      funcao: '',
      fotoLink: '',
      useGeneralPhoto: false,
    };
    onChange('siteEquipePessoas', [...teamList, next]);
  };

  const handleUpdatePerson = (id: string, updates: Partial<WebsitePersonItem>) => {
    onChange(
      'siteEquipePessoas',
      teamList.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleRemovePerson = (id: string) => {
    onChange(
      'siteEquipePessoas',
      teamList.filter((p) => p.id !== id)
    );
  };

  const hasGeneralPhotos =
    data.possuiMateriais === 'Sim' ||
    Boolean(data.linkTransferNow) ||
    Boolean(data.linksMateriais);

  return (
    <div className="space-y-7" id="module-website">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {serviceConfig?.title || 'Site Institucional'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {serviceConfig?.tagline ||
              'Apresentação completa da empresa, serviços, produtos e botões de contato (sem carrinho ou checkout).'}
          </p>
        </div>
      </div>

      {/* Reused general data notice */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong>Informações gerais já vinculadas:</strong> Nome ({data.nomeFantasia || '-'}), WhatsApp ({data.whatsapp || '-'}), E-mail ({data.email || '-'}), endereço e horários serão utilizados automaticamente no site, sem precisar repetir.
        </div>
      </div>

      {/* A. HISTÓRIA E APRESENTAÇÃO */}
      <section className="space-y-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/70 pb-2">
          A. História e Apresentação
        </h3>

        {isEnabled('siteHistoria') && (
          <TextArea
            id="site-historia"
            label={qHistoria?.label || 'Conte um pouco sobre a história da sua empresa'}
            placeholder={
              qHistoria?.placeholder ||
              'Como surgiu, quando começou e como chegou até aqui...'
            }
            helper={qHistoria?.helper || 'Campo opcional para a seção Sobre Nós'}
            required={qHistoria?.required}
            value={data.siteHistoria || ''}
            onChange={(e) => onChange('siteHistoria', e.target.value)}
            rows={3}
          />
        )}

        {isEnabled('siteApresentarResponsavel') && (
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
            <RadioGroup
              label={
                qResp?.label ||
                'Quem é o proprietário ou profissional responsável pela empresa? Deseja apresentar essa pessoa no site?'
              }
              name="site-apresentar-resp"
              options={['Sim', 'Não']}
              value={data.siteApresentarResponsavel || ''}
              onChange={(v) => onChange('siteApresentarResponsavel', v)}
              horizontal
            />

            {data.siteApresentarResponsavel === 'Sim' && (
              <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
                {data.responsavelNome && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Reutilizando do cadastro geral:{' '}
                      <strong>
                        {data.responsavelNome}
                        {data.responsavelCargo ? ` (${data.responsavelCargo})` : ''}
                      </strong>{' '}
                      — edite abaixo apenas se for outra pessoa no site.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput
                    id="site-resp-nome"
                    label="Nome para exibição no site"
                    placeholder={data.responsavelNome || 'Nome completo'}
                    value={data.siteResponsavelNome ?? data.responsavelNome ?? ''}
                    onChange={(e) => onChange('siteResponsavelNome', e.target.value)}
                  />
                  <TextInput
                    id="site-resp-funcao"
                    label="Função / Especialidade"
                    placeholder={data.responsavelCargo || 'Ex: Sócio-fundador, Especialista...'}
                    value={data.siteResponsavelFuncao ?? data.responsavelCargo ?? ''}
                    onChange={(e) => onChange('siteResponsavelFuncao', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Foto do responsável (link, anexo ou reutilizar dos materiais gerais)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <input
                      type="text"
                      value={data.siteResponsavelFoto || ''}
                      onChange={(e) => onChange('siteResponsavelFoto', e.target.value)}
                      placeholder={
                        hasGeneralPhotos
                          ? 'Já enviada nos materiais gerais (ou cole link específico)'
                          : 'Cole o link da foto ou anexe ao lado'
                      }
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Anexar foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onChange('siteResponsavelFoto', `Arquivo selecionado: ${f.name}`);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isEnabled('siteDiferenciais') && (
          <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200/80">
            <CheckboxGroup
              label={qDif?.label || 'Quais são os principais diferenciais da sua empresa?'}
              options={
                qDif?.options?.length
                  ? qDif.options
                  : [
                      'Experiência e tradição',
                      'Atendimento personalizado',
                      'Qualidade',
                      'Agilidade',
                      'Praticidade',
                      'Preço competitivo',
                      'Profissionais especializados',
                      'Variedade de produtos e serviços',
                      'Outro',
                    ]
              }
              selectedValues={data.siteDiferenciais || []}
              onChange={(v) => onChange('siteDiferenciais', v)}
              columns={2}
            />
            {(data.siteDiferenciais || []).includes('Outro') && (
              <TextInput
                id="site-diferenciais-outro"
                label="Qual outro diferencial?"
                placeholder="Descreva..."
                value={data.siteDiferenciaisOutro || ''}
                onChange={(e) => onChange('siteDiferenciaisOutro', e.target.value)}
              />
            )}
            <TextArea
              id="site-diferenciais-desc"
              label="Descrição complementar sobre seus diferenciais (opcional)"
              placeholder="Detalhe o que torna sua empresa a melhor escolha para o cliente..."
              value={data.siteDiferenciaisDesc || ''}
              onChange={(e) => onChange('siteDiferenciaisDesc', e.target.value)}
              rows={2}
            />
          </div>
        )}

        {isEnabled('sitePublicoAlvo') && (
          <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200/80">
            <CheckboxGroup
              label={
                qPub?.label || 'Quem são os principais clientes que sua empresa deseja alcançar?'
              }
              options={
                qPub?.options?.length
                  ? qPub.options
                  : [
                      'Famílias',
                      'Turistas',
                      'Homens',
                      'Mulheres',
                      'Crianças',
                      'Empresas',
                      'Público de determinada faixa etária',
                      'Outros',
                    ]
              }
              selectedValues={data.sitePublicoAlvo || []}
              onChange={(v) => onChange('sitePublicoAlvo', v)}
              columns={2}
            />
            {(data.sitePublicoAlvo || []).includes('Outros') && (
              <TextInput
                id="site-publico-outro"
                label="Qual outro público?"
                placeholder="Especifique o público..."
                value={data.sitePublicoAlvoOutro || ''}
                onChange={(e) => onChange('sitePublicoAlvoOutro', e.target.value)}
              />
            )}
            <TextInput
              id="site-publico-desc"
              label="Complemento sobre o público-alvo (opcional)"
              placeholder="Ex: Empresas da construção civil, jovens universitários..."
              value={data.sitePublicoAlvoDesc || ''}
              onChange={(e) => onChange('sitePublicoAlvoDesc', e.target.value)}
            />
          </div>
        )}
      </section>

      {/* B. SERVIÇOS (sem limite) */}
      {isEnabled('siteServicosSelecionadosIds') && (
        <section className="space-y-3 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
            B. Serviços Apresentados no Site
          </h3>
          <SharedCatalogSection
            data={data}
            onChange={onChange}
            mode="picker"
            targetService="site"
            filterType="servico"
            selectedIdsField="siteServicosSelecionadosIds"
            title={qServ?.label || 'Quais serviços sua empresa oferece?'}
            subtitle={
              qServ?.helper ||
              'Selecione serviços do cadastro compartilhado ou adicione quantos desejar (sem limite).'
            }
          />
        </section>
      )}

      {/* C. PRODUTOS (condicional) */}
      {isEnabled('siteComercializaProdutos') && (
        <section className="space-y-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
            C. Produtos (Apresentação Institucional)
          </h3>

          <RadioGroup
            label={qComProd?.label || 'Sua empresa também comercializa produtos?'}
            name="site-comercializa-produtos"
            options={['Sim', 'Não']}
            value={data.siteComercializaProdutos || ''}
            onChange={(v) => onChange('siteComercializaProdutos', v)}
            helper={
              qComProd?.helper ||
              'Empresas que prestam apenas serviços podem marcar Não.'
            }
            horizontal
          />

          {data.siteComercializaProdutos === 'Sim' && isEnabled('siteProdutosSelecionadosIds') && (
            <div className="pt-2 border-t border-slate-100 animate-fadeIn">
              <SharedCatalogSection
                data={data}
                onChange={onChange}
                mode="picker"
                targetService="site"
                filterType="produto"
                selectedIdsField="siteProdutosSelecionadosIds"
                title={qProd?.label || 'Quais produtos deseja apresentar no site?'}
                subtitle={
                  qProd?.helper ||
                  'Selecione produtos já cadastrados ou adicione novos com preço/valor inicial e variações.'
                }
              />
            </div>
          )}
        </section>
      )}

      {/* D. ATENDIMENTO E CONTRATAÇÃO */}
      <section className="space-y-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/70 pb-2">
          D. Atendimento e Contratação
        </h3>

        {isEnabled('siteProcessoAtendimento') && (
          <div className="space-y-3">
            <CheckboxGroup
              label={
                qProc?.label ||
                'Como funciona o processo de atendimento ou contratação dos seus serviços e produtos?'
              }
              options={
                qProc?.options?.length
                  ? qProc.options
                  : [
                      'O cliente entra em contato pelo WhatsApp',
                      'O cliente agenda um horário',
                      'O cliente solicita um orçamento',
                      'O cliente vai até o estabelecimento',
                      'A empresa realiza entregas',
                      'O cliente solicita informações pelo site',
                      'Outro',
                    ]
              }
              selectedValues={data.siteProcessoAtendimento || []}
              onChange={(v) => onChange('siteProcessoAtendimento', v)}
              columns={2}
            />
            {(data.siteProcessoAtendimento || []).includes('Outro') && (
              <TextInput
                id="site-processo-outro"
                label="Qual outro processo de atendimento?"
                placeholder="Descreva..."
                value={data.siteProcessoAtendimentoOutro || ''}
                onChange={(e) => onChange('siteProcessoAtendimentoOutro', e.target.value)}
              />
            )}
          </div>
        )}

        {isEnabled('siteOrientacaoPreContratacao') && (
          <TextArea
            id="site-orientacao-pre"
            label={
              qOrient?.label ||
              'Existe alguma orientação importante que o cliente precisa conhecer antes de contratar um serviço ou adquirir um produto?'
            }
            placeholder={
              qOrient?.placeholder ||
              'Ex: Necessidade de agendamento, prazos, condições de entrega, documentação necessária...'
            }
            value={data.siteOrientacaoPreContratacao || ''}
            onChange={(e) => onChange('siteOrientacaoPreContratacao', e.target.value)}
            rows={3}
          />
        )}
      </section>

      {/* E. MATERIAIS E APRESENTAÇÃO */}
      <section className="space-y-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/70 pb-2">
          E. Materiais, Equipe e Vídeos
        </h3>

        {isEnabled('siteApresentarEquipeTipo') && (
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-4">
            <RadioGroup
              label={
                qEquipe?.label ||
                'Você gostaria de apresentar o proprietário, os profissionais ou a equipe no site?'
              }
              name="site-equipe-tipo"
              options={
                qEquipe?.options?.length
                  ? qEquipe.options
                  : [
                      'Somente o proprietário',
                      'Somente a equipe',
                      'Proprietário e equipe',
                      'Não desejo apresentar pessoas',
                    ]
              }
              value={data.siteApresentarEquipeTipo || ''}
              onChange={(v) => onChange('siteApresentarEquipeTipo', v)}
            />

            {data.siteApresentarEquipeTipo &&
              data.siteApresentarEquipeTipo !== 'Não desejo apresentar pessoas' && (
                <div className="space-y-3 pt-3 border-t border-slate-100 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Pessoas a apresentar no site</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAddPerson}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Pessoa</span>
                    </button>
                  </div>

                  {hasGeneralPhotos && (
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-800 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        As fotos já enviadas nos materiais gerais podem ser reutilizadas automaticamente.
                      </span>
                    </div>
                  )}

                  {teamList.map((person, idx) => (
                    <div
                      key={person.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">
                          Pessoa #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePerson(person.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          value={person.nome}
                          onChange={(e) => handleUpdatePerson(person.id, { nome: e.target.value })}
                          placeholder="Nome completo"
                          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900"
                        />
                        <input
                          type="text"
                          value={person.funcao}
                          onChange={(e) => handleUpdatePerson(person.id, { funcao: e.target.value })}
                          placeholder="Cargo ou especialidade"
                          className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <input
                          type="text"
                          value={person.fotoLink || ''}
                          onChange={(e) =>
                            handleUpdatePerson(person.id, { fotoLink: e.target.value })
                          }
                          placeholder={
                            person.useGeneralPhoto
                              ? 'Usar foto enviada nos materiais gerais'
                              : 'Link da foto ou anexe ao lado (opcional)'
                          }
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900"
                        />
                        <label className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer shrink-0">
                          <Upload className="w-3 h-3 text-blue-600" />
                          <span>Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                handleUpdatePerson(person.id, {
                                  fotoLink: `Arquivo selecionado: ${f.name}`,
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {isEnabled('sitePossuiVideos') && (
          <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-3">
            <RadioGroup
              label={qVideos?.label || 'Possui vídeos que gostaria de utilizar no site?'}
              name="site-possui-videos"
              options={
                qVideos?.options?.length
                  ? qVideos.options
                  : [
                      'Sim, tenho vídeos para compartilhar',
                      'Não tenho',
                      'Gostaria de produzir futuramente',
                    ]
              }
              value={data.sitePossuiVideos || ''}
              onChange={(v) => onChange('sitePossuiVideos', v)}
            />

            {data.sitePossuiVideos === 'Sim, tenho vídeos para compartilhar' && (
              <div className="space-y-2.5 pt-2 border-t border-slate-100 animate-fadeIn">
                <TextInput
                  id="site-videos-link"
                  type="url"
                  label="Link dos vídeos (YouTube, Google Drive, Instagram ou TransferNow)"
                  placeholder="https://..."
                  value={data.siteVideosLink || ''}
                  onChange={(e) => onChange('siteVideosLink', e.target.value)}
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {data.siteVideosArquivo
                      ? data.siteVideosArquivo
                      : 'Ou selecionar arquivo de vídeo'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onChange('siteVideosArquivo', `Arquivo selecionado: ${f.name}`);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        )}
      </section>

      {/* F. SEÇÕES COMPLEMENTARES */}
      <section className="space-y-4 p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200/70 pb-2">
          F. Seções Complementares e Objetivo
        </h3>

        {isEnabled('siteSecoesAdicionais') && (
          <div className="space-y-3 p-4 rounded-xl bg-white border border-slate-200/80">
            <CheckboxGroup
              label={
                qSecoes?.label ||
                'Quais seções adicionais você gostaria de ter no site, além da estrutura padrão da Localway?'
              }
              options={
                qSecoes?.options?.length
                  ? qSecoes.options
                  : [
                      'Sobre nós',
                      'Nossa equipe',
                      'Galeria de fotos',
                      'Perguntas frequentes',
                      'Depoimentos de clientes',
                      'Portfólio de trabalhos realizados',
                      'Blog',
                      'Outras',
                    ]
              }
              selectedValues={data.siteSecoesAdicionais || []}
              onChange={(v) => onChange('siteSecoesAdicionais', v)}
              columns={2}
            />
            {(data.siteSecoesAdicionais || []).includes('Outras') && (
              <TextInput
                id="site-secoes-outras"
                label="Quais outras seções adicionais?"
                placeholder="Ex: Parceiros, certificações, galeria antes/depois..."
                value={data.siteSecoesAdicionaisOutro || ''}
                onChange={(e) => onChange('siteSecoesAdicionaisOutro', e.target.value)}
              />
            )}
          </div>
        )}

        {isEnabled('siteDuvidasFrequentes') && (
          <TextArea
            id="site-duvidas-frequentes"
            label={
              qDuvidas?.label ||
              'Quais dúvidas seus clientes costumam ter antes de contratar ou comprar?'
            }
            placeholder={
              qDuvidas?.placeholder ||
              'Liste as dúvidas comuns para criarmos a seção de Perguntas Frequentes...'
            }
            value={data.siteDuvidasFrequentes || ''}
            onChange={(e) => onChange('siteDuvidasFrequentes', e.target.value)}
            rows={3}
          />
        )}

        {isEnabled('siteObjetivoPrincipal') && (
          <RadioGroup
            label={
              qObj?.label || 'Qual é o principal objetivo que você espera alcançar com o site?'
            }
            name="site-objetivo-principal"
            options={
              qObj?.options?.length
                ? qObj.options
                : [
                    'Receber contatos pelo WhatsApp',
                    'Receber pedidos de orçamento',
                    'Gerar agendamentos',
                    'Apresentar a empresa e seus serviços',
                    'Gerar vendas',
                    'Fortalecer a presença digital da empresa',
                  ]
            }
            value={data.siteObjetivoPrincipal || ''}
            onChange={(v) => onChange('siteObjetivoPrincipal', v)}
          />
        )}
      </section>

      <DynamicExtraQuestions
        questions={serviceConfig?.questions || []}
        data={data}
        onChange={onChange}
        errors={errors}
        nativeKeys={NATIVE_SITE_KEYS}
      />
    </div>
  );
};
