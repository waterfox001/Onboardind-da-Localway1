import React, { useState } from 'react';
import { OnboardingData, SharedCatalogItem, ServiceId } from '../types';
import { PackagePlus, Plus, Trash2, Check, Tag, Wrench, ShoppingBag, Upload } from 'lucide-react';

interface SharedCatalogSectionProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  /**
   * 'general' = Cadastro compartilhado completo na Página 2
   * 'picker' = Seleção/adição rápida dentro de um módulo específico (google | site | minisite)
   */
  mode?: 'general' | 'picker';
  targetService?: 'google' | 'site' | 'minisite';
  filterType?: 'produto' | 'servico' | 'all';
  selectedIdsField?: 'googleItensDestaqueIds' | 'minisiteItensDestaqueIds' | 'siteServicosSelecionadosIds' | 'siteProdutosSelecionadosIds';
  maxItems?: number;
  title?: string;
  subtitle?: string;
}

const DESTINATION_LABELS: { id: 'google' | 'site' | 'minisite'; label: string }[] = [
  { id: 'google', label: 'Perfil no Google' },
  { id: 'site', label: 'Site Institucional' },
  { id: 'minisite', label: 'Mini Site' },
];

export const SharedCatalogSection: React.FC<SharedCatalogSectionProps> = ({
  data,
  onChange,
  mode = 'general',
  targetService,
  filterType = 'all',
  selectedIdsField,
  maxItems,
  title,
  subtitle,
}) => {
  const catalog = data.catalogoCompartilhado || [];
  const selectedIds: string[] = selectedIdsField ? ((data[selectedIdsField] as string[]) || []) : [];

  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<SharedCatalogItem>>({
    tipo: filterType === 'produto' ? 'produto' : 'servico',
    nome: '',
    descricao: '',
    tipoPreco: 'sob_consulta',
    preco: '',
    duracao: '',
    variacoes: '',
    fotoLink: '',
    destinos: targetService ? [targetService] : ['google', 'site', 'minisite'],
  });

  const activeDestinations: ('google' | 'site' | 'minisite')[] = React.useMemo(() => {
    const selected = data.servicosContratados || [];
    const available = DESTINATION_LABELS.filter(
      (d) => selected.length === 0 || selected.includes(d.id as ServiceId)
    ).map((d) => d.id);
    return available.length > 0 ? available : ['google', 'site', 'minisite'];
  }, [data.servicosContratados]);

  const visibleCatalog = catalog.filter((item) =>
    filterType === 'all' ? true : item.tipo === filterType
  );

  const toggleItemSelected = (itemId: string) => {
    if (!selectedIdsField) return;
    const isSelected = selectedIds.includes(itemId);
    if (isSelected) {
      onChange(
        selectedIdsField,
        selectedIds.filter((id) => id !== itemId) as any
      );
      // Also update destinos metadata on the shared item
      if (targetService) {
        onChange(
          'catalogoCompartilhado',
          catalog.map((c) =>
            c.id === itemId
              ? { ...c, destinos: (c.destinos || []).filter((d) => d !== targetService) }
              : c
          )
        );
      }
    } else {
      if (maxItems && selectedIds.length >= maxItems) {
        return;
      }
      onChange(selectedIdsField, [...selectedIds, itemId] as any);
      if (targetService) {
        onChange(
          'catalogoCompartilhado',
          catalog.map((c) =>
            c.id === itemId
              ? {
                  ...c,
                  destinos: Array.from(new Set([...(c.destinos || []), targetService])),
                }
              : c
          )
        );
      }
    }
  };

  const handleToggleDraftDestino = (dest: 'google' | 'site' | 'minisite') => {
    const cur = draft.destinos || [];
    if (cur.includes(dest)) {
      setDraft({ ...draft, destinos: cur.filter((d) => d !== dest) });
    } else {
      setDraft({ ...draft, destinos: [...cur, dest] });
    }
  };

  const handleToggleItemDestino = (itemId: string, dest: 'google' | 'site' | 'minisite') => {
    const updated = catalog.map((c) => {
      if (c.id !== itemId) return c;
      const has = (c.destinos || []).includes(dest);
      const nextDestinos = has
        ? (c.destinos || []).filter((d) => d !== dest)
        : [...(c.destinos || []), dest];
      return { ...c, destinos: nextDestinos };
    });
    onChange('catalogoCompartilhado', updated);
  };

  const handleAddCatalogItem = () => {
    if (!draft.nome?.trim()) return;
    const newItem: SharedCatalogItem = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      tipo: (draft.tipo as 'produto' | 'servico') || (filterType === 'produto' ? 'produto' : 'servico'),
      nome: draft.nome.trim(),
      descricao: (draft.descricao || '').trim(),
      tipoPreco: draft.tipoPreco || 'sob_consulta',
      preco: draft.tipoPreco === 'sob_consulta' ? '' : (draft.preco || '').trim(),
      duracao: (draft.duracao || '').trim(),
      variacoes: (draft.variacoes || '').trim(),
      fotoLink: (draft.fotoLink || '').trim(),
      destinos:
        draft.destinos && draft.destinos.length > 0
          ? draft.destinos
          : targetService
          ? [targetService]
          : activeDestinations,
    };

    const nextCatalog = [...catalog, newItem];
    onChange('catalogoCompartilhado', nextCatalog);

    if (selectedIdsField && (!maxItems || selectedIds.length < maxItems)) {
      onChange(selectedIdsField, [...selectedIds, newItem.id] as any);
    }

    setDraft({
      tipo: filterType === 'produto' ? 'produto' : 'servico',
      nome: '',
      descricao: '',
      tipoPreco: 'sob_consulta',
      preco: '',
      duracao: '',
      variacoes: '',
      fotoLink: '',
      destinos: targetService ? [targetService] : activeDestinations,
    });
    setIsAdding(false);
  };

  const handleRemoveItem = (itemId: string) => {
    onChange(
      'catalogoCompartilhado',
      catalog.filter((c) => c.id !== itemId)
    );
    if (selectedIdsField && selectedIds.includes(itemId)) {
      onChange(
        selectedIdsField,
        selectedIds.filter((id) => id !== itemId) as any
      );
    }
  };

  const formatPriceBadge = (item: SharedCatalogItem) => {
    if (item.tipoPreco === 'sob_consulta') return 'Sob consulta';
    if (item.tipoPreco === 'a_partir') {
      return item.preco ? `A partir de ${item.preco}` : 'Valor inicial / a partir de';
    }
    return item.preco || 'Preço opcional';
  };

  const limitReached = Boolean(maxItems && selectedIds.length >= maxItems);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {title && (
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{title}</span>
              {maxItems && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70">
                  {selectedIds.length}/{maxItems} selecionados
                </span>
              )}
            </h4>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={mode === 'picker' && limitReached}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>
              {filterType === 'produto'
                ? 'Adicionar Produto'
                : filterType === 'servico'
                ? 'Adicionar Serviço'
                : 'Adicionar Produto ou Serviço'}
            </span>
          </button>
        )}
      </div>

      {/* Existing items list */}
      {visibleCatalog.length > 0 && (
        <div className="space-y-2.5">
          {visibleCatalog.map((item) => {
            const isSelected = selectedIdsField
              ? selectedIds.includes(item.id) ||
                Boolean(targetService && (item.destinos || []).includes(targetService) && selectedIds.length === 0)
              : false;
            const explicitlySelected = selectedIdsField ? selectedIds.includes(item.id) : false;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  mode === 'picker' && explicitlySelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {mode === 'picker' && selectedIdsField && (
                      <button
                        type="button"
                        onClick={() => toggleItemSelected(item.id)}
                        disabled={!explicitlySelected && limitReached}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40 ${
                          explicitlySelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-300 hover:border-blue-500'
                        }`}
                        title={explicitlySelected ? 'Remover seleção' : 'Selecionar para este serviço'}
                      >
                        {explicitlySelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            item.tipo === 'produto'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {item.tipo === 'produto' ? (
                            <ShoppingBag className="w-3 h-3" />
                          ) : (
                            <Wrench className="w-3 h-3" />
                          )}
                          <span>{item.tipo === 'produto' ? 'Produto' : 'Serviço'}</span>
                        </span>

                        <span className="text-sm font-bold text-slate-900">{item.nome}</span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                          <Tag className="w-3 h-3" />
                          <span>{formatPriceBadge(item)}</span>
                        </span>

                        {item.duracao && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Duração: {item.duracao}
                          </span>
                        )}
                      </div>

                      {item.descricao && (
                        <p className="text-xs text-slate-600 leading-relaxed">{item.descricao}</p>
                      )}

                      {item.variacoes && (
                        <p className="text-[11px] text-slate-500">
                          <strong>Variações:</strong> {item.variacoes}
                        </p>
                      )}

                      {item.fotoLink && (
                        <p className="text-[11px] text-blue-600 truncate">
                          Foto/Referência: {item.fotoLink}
                        </p>
                      )}

                      {mode === 'general' && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">Usar em:</span>
                          {DESTINATION_LABELS.map((dest) => {
                            const active = (item.destinos || []).includes(dest.id);
                            return (
                              <button
                                key={dest.id}
                                type="button"
                                onClick={() => handleToggleItemDestino(item.id, dest.id)}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                                  active
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {dest.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {mode === 'picker' && !explicitlySelected && isSelected && (
                        <span className="text-[10px] text-blue-600 font-medium block">
                          Marcado no cadastro compartilhado — clique na caixa ao lado para confirmar seleção
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Remover item do catálogo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New item inline form */}
      {isAdding && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-blue-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Novo item para o cadastro compartilhado
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filterType === 'all' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo</label>
                <div className="inline-flex rounded-xl p-1 bg-white border border-slate-200 w-full">
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, tipo: 'servico' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      draft.tipo === 'servico' ? 'bg-blue-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    Serviço
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, tipo: 'produto' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      draft.tipo === 'produto' ? 'bg-amber-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    Produto
                  </button>
                </div>
              </div>
            )}

            <div className={filterType === 'all' ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do {draft.tipo === 'produto' ? 'Produto' : 'Serviço'} *
              </label>
              <input
                type="text"
                value={draft.nome || ''}
                onChange={(e) => setDraft({ ...draft, nome: e.target.value })}
                placeholder={
                  draft.tipo === 'produto'
                    ? 'Ex: Pomada Capilar Matte 120g'
                    : 'Ex: Corte Masculino / Aula Prática de Carro'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição breve (opcional)
            </label>
            <textarea
              rows={2}
              value={draft.descricao || ''}
              onChange={(e) => setDraft({ ...draft, descricao: e.target.value })}
              placeholder="Descreva os principais benefícios ou detalhes do item..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Formato do Preço</label>
              <select
                value={draft.tipoPreco || 'sob_consulta'}
                onChange={(e) => setDraft({ ...draft, tipoPreco: e.target.value as any })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              >
                <option value="sob_consulta">Sob consulta</option>
                <option value="fixo">Preço fixo</option>
                <option value="a_partir">Valor inicial (A partir de)</option>
              </select>
            </div>

            {draft.tipoPreco !== 'sob_consulta' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {draft.tipoPreco === 'a_partir' ? 'A partir de (R$)' : 'Valor (R$)'}
                </label>
                <input
                  type="text"
                  value={draft.preco || ''}
                  onChange={(e) => setDraft({ ...draft, preco: e.target.value })}
                  placeholder="Ex: R$ 89,90"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            )}

            {draft.tipo === 'servico' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duração aproximada (opcional)
                </label>
                <input
                  type="text"
                  value={draft.duracao || ''}
                  onChange={(e) => setDraft({ ...draft, duracao: e.target.value })}
                  placeholder="Ex: 45 min, 1h..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tamanhos, cores ou variações
                </label>
                <input
                  type="text"
                  value={draft.variacoes || ''}
                  onChange={(e) => setDraft({ ...draft, variacoes: e.target.value })}
                  placeholder="Ex: P, M, G | Preto, Branco"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link ou nome da foto (opcional)
              </label>
              <input
                type="text"
                value={draft.fotoLink || ''}
                onChange={(e) => setDraft({ ...draft, fotoLink: e.target.value })}
                placeholder="Cole link da foto ou anexe arquivo ao lado"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Selecionar arquivo de foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDraft({ ...draft, fotoLink: `Arquivo selecionado: ${file.name}` });
                    }
                  }}
                />
              </label>
            </div>
          </div>

          {mode === 'general' && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-xs font-semibold text-slate-700">
                Onde deseja reutilizar este item?
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {DESTINATION_LABELS.map((dest) => {
                  const checked = (draft.destinos || []).includes(dest.id);
                  return (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleToggleDraftDestino(dest.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        checked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                      <span>{dest.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddCatalogItem}
              disabled={!draft.nome?.trim()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Item no Catálogo</span>
            </button>
          </div>
        </div>
      )}

      {visibleCatalog.length === 0 && !isAdding && (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-xs text-slate-500 text-center">
          Nenhum item cadastrado ainda. Clique no botão acima caso deseje adicionar {filterType === 'produto' ? 'produtos' : filterType === 'servico' ? 'serviços' : 'produtos ou serviços'}.
        </div>
      )}
    </div>
  );
};
