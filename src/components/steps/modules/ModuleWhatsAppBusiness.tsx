import React from 'react';
import { OnboardingData, WhatsAppCatalogItem } from '../../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../../FormControls';
import { MessageSquare, Plus, Trash2, Info, ShoppingBag } from 'lucide-react';

interface ModuleWhatsAppBusinessProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleWhatsAppBusiness: React.FC<ModuleWhatsAppBusinessProps> = ({
  data,
  onChange,
  errors,
}) => {
  // Helpers for Catalog Items
  const catalogItems: WhatsAppCatalogItem[] = data.whatsCatalogoItens || [];

  const handleAddCatalogItem = () => {
    const newItem: WhatsAppCatalogItem = {
      id: String(Date.now()),
      nome: '',
      descricao: '',
      preco: '',
    };
    onChange('whatsCatalogoItens', [...catalogItems, newItem]);
  };

  const handleUpdateCatalogItem = (
    id: string,
    field: keyof WhatsAppCatalogItem,
    value: string
  ) => {
    const updated = catalogItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange('whatsCatalogoItens', updated);
  };

  const handleRemoveCatalogItem = (id: string) => {
    const updated = catalogItems.filter((item) => item.id !== id);
    onChange('whatsCatalogoItens', updated);
  };

  return (
    <div className="space-y-8" id="module-whatsapp-business">
      {/* Header com cor do serviço */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            WhatsApp Business Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure seu perfil comercial oficial, informações de contato e catálogo de produtos/serviços.
          </p>
        </div>
      </div>

      {/* 6.1 DADOS DO WHATSAPP BUSINESS */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            1. Dados do Perfil Comercial
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RadioGroup
            label="Você já possui uma conta no WhatsApp Business?"
            name="whats-ja-possui"
            required
            options={['Sim', 'Não', 'Estou usando o WhatsApp comum']}
            value={data.whatsJaPossuiBusiness}
            onChange={(v) => onChange('whatsJaPossuiBusiness', v)}
            error={errors.whatsJaPossuiBusiness}
          />

          <TextInput
            id="whats-numero"
            label="Número de WhatsApp da empresa (com DDD)"
            required
            placeholder="(85) 90000-0000"
            value={data.whatsNumero || data.whatsapp}
            onChange={(e) => onChange('whatsNumero', e.target.value)}
            error={errors.whatsNumero}
            helper="Número oficial onde os clientes entrarão em contato"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            id="whats-nome-comercial"
            label="Nome comercial que deve aparecer no perfil"
            required
            placeholder={data.nomeFantasia || 'Nome da sua empresa'}
            value={data.whatsNomeComercial}
            onChange={(e) => onChange('whatsNomeComercial', e.target.value)}
            error={errors.whatsNomeComercial}
            helper="Nome visível aos clientes no topo da conversa"
          />

          <TextInput
            id="whats-usuario"
            label="Nome de usuário desejado (opcional)"
            placeholder="@suaempresa"
            value={data.whatsUsuarioDesejado}
            onChange={(e) => onChange('whatsUsuarioDesejado', e.target.value)}
            helper="Recurso recente do WhatsApp. Se disponível, tentaremos registrar."
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="whats-descricao"
              className="text-sm font-semibold text-slate-800"
            >
              Descrição da empresa para o perfil do WhatsApp
              <span className="text-blue-600 ml-1" title="Campo obrigatório">*</span>
            </label>
            <span className="text-xs text-slate-400">
              {(data.whatsDescricaoPerfil || '').length}/512 caracteres
            </span>
          </div>
          <TextArea
            id="whats-descricao"
            label=""
            maxLength={512}
            rows={3}
            placeholder="Breve resumo da empresa, diferenciais e especialidades que o cliente lê ao abrir os dados do contato..."
            value={data.whatsDescricaoPerfil}
            onChange={(e) => onChange('whatsDescricaoPerfil', e.target.value)}
            error={errors.whatsDescricaoPerfil}
            helper="Texto conciso (máximo 512 caracteres) para o perfil comercial."
          />
        </div>

        {/* Endereço Físico */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <RadioGroup
            label="Possui endereço físico para exibir no perfil?"
            name="whats-endereco-fisico"
            required
            options={['Sim', 'Não']}
            value={data.whatsPossuiEnderecoFisico}
            onChange={(v) => onChange('whatsPossuiEnderecoFisico', v)}
            error={errors.whatsPossuiEnderecoFisico}
          />

          {data.whatsPossuiEnderecoFisico === 'Sim' && (
            <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-800">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Utilizaremos o endereço informado no início deste onboarding ({data.ruaAvenida ? `${data.ruaAvenida}, ${data.numero || 'S/N'}` : 'etapa de endereço'}).
                </span>
              </div>

              <TextInput
                id="whats-obs-localizacao"
                label="Observação sobre localização (opcional)"
                placeholder="Ex: Entrada ao lado da padaria / sala 204"
                value={data.whatsObsLocalizacao}
                onChange={(e) => onChange('whatsObsLocalizacao', e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Links para o perfil */}
        <div className="space-y-3">
          <CheckboxGroup
            label="Links para exibir no perfil do WhatsApp:"
            options={['Site', 'Instagram', 'Facebook', 'Outro link']}
            selectedValues={data.whatsLinks || []}
            onChange={(v) => onChange('whatsLinks', v)}
            columns={2}
            helper="Selecione quais canais você gostaria de vincular diretamente ao perfil."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(data.whatsLinks || []).includes('Site') && (
              <TextInput
                id="whats-link-site"
                label="Link do Site"
                placeholder={data.site || 'https://suaempresa.com.br'}
                value={data.whatsLinkSite}
                onChange={(e) => onChange('whatsLinkSite', e.target.value)}
              />
            )}
            {(data.whatsLinks || []).includes('Instagram') && (
              <TextInput
                id="whats-link-insta"
                label="Link do Instagram"
                placeholder={data.instagram || 'https://instagram.com/suaempresa'}
                value={data.whatsLinkInstagram}
                onChange={(e) => onChange('whatsLinkInstagram', e.target.value)}
              />
            )}
            {(data.whatsLinks || []).includes('Facebook') && (
              <TextInput
                id="whats-link-fb"
                label="Link do Facebook"
                placeholder="https://facebook.com/suaempresa"
                value={data.whatsLinkFacebook}
                onChange={(e) => onChange('whatsLinkFacebook', e.target.value)}
              />
            )}
            {(data.whatsLinks || []).includes('Outro link') && (
              <TextInput
                id="whats-link-outro"
                label="Outro link"
                placeholder="https://..."
                value={data.whatsLinkOutro}
                onChange={(e) => onChange('whatsLinkOutro', e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* 6.2 CATÁLOGO DO WHATSAPP BUSINESS */}
      <div className="pt-6 border-t border-slate-100 space-y-5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            2. Catálogo de Produtos e Serviços
          </h3>
        </div>

        <RadioGroup
          label="Deseja cadastrar produtos ou serviços no Catálogo do WhatsApp Business?"
          name="whats-deseja-catalogo"
          required
          options={['Sim', 'Não', 'Já possuo um catálogo']}
          value={data.whatsDesejaCatalogo}
          onChange={(v) => onChange('whatsDesejaCatalogo', v)}
          error={errors.whatsDesejaCatalogo}
        />

        {data.whatsDesejaCatalogo === 'Sim' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-4">
            {/* Aviso sobre fotos */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-700 shadow-xs">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-emerald-950 font-semibold block mb-0.5">
                  Importante sobre as fotos do catálogo:
                </strong>
                As fotos dos produtos/serviços poderão ser enviadas posteriormente pelo WhatsApp ou na etapa final de materiais deste onboarding. Aqui, informe apenas os dados textuais dos itens.
              </div>
            </div>

            {/* Lista de itens adicionados */}
            <div className="space-y-3">
              {catalogItems.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-dashed border-emerald-300 bg-white/70">
                  <p className="text-xs sm:text-sm text-slate-500 mb-3">
                    Nenhum item adicionado ao catálogo até o momento.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCatalogItem}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Primeiro Produto/Serviço
                  </button>
                </div>
              ) : (
                catalogItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Item #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCatalogItem(item.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <TextInput
                          id={`cat-nome-${item.id}`}
                          label="Nome do produto ou serviço"
                          required
                          placeholder="Ex: Corte Degrade / Consultoria / Vestido Midi"
                          value={item.nome}
                          onChange={(e) =>
                            handleUpdateCatalogItem(item.id, 'nome', e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <TextInput
                          id={`cat-preco-${item.id}`}
                          label="Preço (opcional)"
                          placeholder="Ex: R$ 45,00 / A partir de R$ 90"
                          value={item.preco}
                          onChange={(e) =>
                            handleUpdateCatalogItem(item.id, 'preco', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <TextInput
                        id={`cat-desc-${item.id}`}
                        label="Descrição do produto ou serviço"
                        required
                        placeholder="Ex: Detalhes, o que está incluso, material ou especificações..."
                        value={item.descricao}
                        onChange={(e) =>
                          handleUpdateCatalogItem(item.id, 'descricao', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))
              )}

              {catalogItems.length > 0 && (
                <div className="flex justify-start pt-1">
                  <button
                    type="button"
                    onClick={handleAddCatalogItem}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar outro produto/serviço
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
