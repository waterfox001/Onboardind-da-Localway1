import React from 'react';
import { OnboardingData } from '../../../types';
import { TextInput, TextArea, RadioGroup } from '../../FormControls';
import { MapPin, AlertCircle } from 'lucide-react';
import { GoogleAccentDots } from '../../GoogleAccentDots';

interface ModuleGoogleProfileProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleGoogleProfile: React.FC<ModuleGoogleProfileProps> = ({
  data,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6" id="module-google-profile">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Perfil da Empresa no Google (Google Meu Negócio)
            </h2>
            <GoogleAccentDots size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure as informações que aparecerão no Google Maps e nas pesquisas locais.
          </p>
        </div>
      </div>

      {/* Pergunta se já possui perfil */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <RadioGroup
          label="A empresa já possui perfil cadastrado no Google?"
          name="google-ja-possui"
          required
          options={['Sim', 'Não', 'Não sei informar']}
          value={data.googleJaPossuiPerfil}
          onChange={(v) => onChange('googleJaPossuiPerfil', v)}
          error={errors.googleJaPossuiPerfil}
          horizontal
        />

        {data.googleJaPossuiPerfil === 'Sim' && (
          <div className="space-y-3 pt-2">
            <TextInput
              id="google-link-perfil"
              label="Informe o link do perfil atual ou como ele pode ser encontrado no Google:"
              placeholder="https://maps.app.goo.gl/... ou Nome exato como aparece na busca"
              value={data.googleLinkPerfil}
              onChange={(e) => onChange('googleLinkPerfil', e.target.value)}
            />

            <TextInput
              id="google-correcoes-perfil"
              label="Existe algo que precisa ser corrigido com urgência no perfil?"
              placeholder="Ex: Telefone errado, endereço antigo, avaliações indevidas..."
              value={data.googleCorrecoesPerfil}
              onChange={(e) => onChange('googleCorrecoesPerfil', e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="google-nome-comercial"
          label="Nome comercial a aparecer no Google"
          placeholder={data.nomeFantasia || 'Ex: Restaurante Sabor & Arte'}
          value={data.googleNomeComercial}
          onChange={(e) => onChange('googleNomeComercial', e.target.value)}
          helper="Se for igual ao nome fantasia, pode deixar em branco ou confirmar"
        />

        <TextInput
          id="google-categoria-principal"
          label="Categoria Principal no Google"
          required
          placeholder="Ex: Restaurante Italiano, Salão de Beleza, Dentista..."
          value={data.googleCategoriaPrincipal}
          onChange={(e) => onChange('googleCategoriaPrincipal', e.target.value)}
          error={errors.googleCategoriaPrincipal}
          helper="A categoria mais importante para o ranqueamento local"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="google-categorias-secundarias"
          label="Categorias Secundárias"
          placeholder="Ex: Pizzaria, Bar, Entrega de Refeições..."
          value={data.googleCategoriasSecundarias}
          onChange={(e) => onChange('googleCategoriasSecundarias', e.target.value)}
          helper="Outras atividades secundárias que sua empresa exerce"
        />

        <TextInput
          id="google-area-atendimento"
          label="Área de Atendimento"
          placeholder="Ex: Toda a cidade de São Paulo, Bairros Moema e Jardins..."
          value={data.googleAreaAtendimento}
          onChange={(e) => onChange('googleAreaAtendimento', e.target.value)}
          helper="Regiões geográficas que você atende ou faz entregas"
        />
      </div>

      <TextArea
        id="google-principais-servicos"
        label="Principais serviços ou produtos oferecidos"
        required
        placeholder="Liste os serviços ou produtos mais buscados pelos clientes..."
        value={data.googlePrincipaisServicos}
        onChange={(e) => onChange('googlePrincipaisServicos', e.target.value)}
        error={errors.googlePrincipaisServicos}
        rows={3}
      />

      <TextArea
        id="google-descricao-servicos"
        label="Descrição detalhada dos serviços"
        placeholder="Descreva particularidades do atendimento, diferenciais e especialidades..."
        value={data.googleDescricaoServicos}
        onChange={(e) => onChange('googleDescricaoServicos', e.target.value)}
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TextInput
          id="google-destaque"
          label="Principais produtos/serviços que devem ser destacados"
          placeholder="Ex: Rodízio de massas, Alinhadores invisíveis, Cursos..."
          value={data.googlePrincipaisProdutosServicos}
          onChange={(e) => onChange('googlePrincipaisProdutosServicos', e.target.value)}
        />

        <TextInput
          id="google-info-adicionais"
          label="Informações adicionais para o perfil"
          placeholder="Ex: Aceita pets, entrada acessível, Wi-Fi grátis..."
          value={data.googleInfoAdicionais}
          onChange={(e) => onChange('googleInfoAdicionais', e.target.value)}
        />
      </div>
    </div>
  );
};
