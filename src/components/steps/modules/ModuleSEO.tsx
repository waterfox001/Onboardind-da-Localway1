import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea } from '../../FormControls';
import { Search } from 'lucide-react';

interface ModuleSEOProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleSEO: React.FC<ModuleSEOProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-seo">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            SEO & Otimização Orgânica nos Buscadores
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Defina palavras-chave estratégicas, regiões de foco e concorrentes para ranquear no Google.
          </p>
        </div>
      </div>

      <TextArea
        id="seo-produtos-servicos"
        label="Quais produtos ou serviços são mais importantes para o ranqueamento?"
        required
        placeholder="Liste por ordem de prioridade os termos e serviços mais lucrativos..."
        value={data.seoProdutosServicosImportantes}
        onChange={(e) => onChange('seoProdutosServicosImportantes', e.target.value)}
        error={errors.seoProdutosServicosImportantes}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="seo-cidades"
          label="Cidades e regiões prioritárias"
          required
          placeholder="Ex: São Paulo, Campinas, Grande ABC..."
          value={data.seoCidadesRegioes}
          onChange={(e) => onChange('seoCidadesRegioes', e.target.value)}
          error={errors.seoCidadesRegioes}
        />

        <TextInput
          id="seo-bairros"
          label="Bairros prioritários"
          placeholder="Ex: Pinheiros, Itaim Bibi, Vila Madalena..."
          value={data.seoBairros}
          onChange={(e) => onChange('seoBairros', e.target.value)}
        />
      </div>

      <TextArea
        id="seo-termos-pesquisa"
        label="Quais termos você acredita que seus clientes digitam no Google?"
        required
        placeholder="Ex: 'dentista em moema', 'pizzaria delivery perto de mim', 'manutenção de ar condicionado sp'..."
        value={data.seoTermosPesquisa}
        onChange={(e) => onChange('seoTermosPesquisa', e.target.value)}
        error={errors.seoTermosPesquisa}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="seo-concorrentes"
          label="Quais são os principais concorrentes diretos?"
          placeholder="Ex: Empresa X, Clínica Y, Loja Z..."
          value={data.seoPrincipaisConcorrentes}
          onChange={(e) => onChange('seoPrincipaisConcorrentes', e.target.value)}
        />

        <TextInput
          id="seo-sites-concorrentes"
          label="Links dos sites ou perfis desses concorrentes"
          placeholder="Ex: concorente1.com.br, instagram.com/concorrente2"
          value={data.seoSitesPerfisConcorrentes}
          onChange={(e) => onChange('seoSitesPerfisConcorrentes', e.target.value)}
        />
      </div>
    </div>
  );
};
