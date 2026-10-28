import React from 'react';
import { OnboardingData } from '../../types';
import { TextInput, TextArea, RadioGroup, CheckboxGroup } from '../FormControls';
import { FolderUp, ExternalLink, CloudUpload, Info } from 'lucide-react';

interface StepMaterialsProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
  transferNowUrl?: string;
}

export const StepMaterials: React.FC<StepMaterialsProps> = ({
  data,
  onChange,
  errors,
  transferNowUrl = 'https://www.transfernow.net',
}) => {
  return (
    <div className="space-y-6" id="step-materials">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
          <FolderUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Envio de Materiais e Arquivos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Logotipos, fotos, vídeos, cardápios ou links de pastas na nuvem.
          </p>
        </div>
      </div>

      {/* Possui materiais */}
      <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
        <RadioGroup
          label="Você já possui materiais prontos para nos enviar agora?"
          name="possui-materiais"
          required
          options={['Sim', 'Não (Enviarei mais tarde por WhatsApp ou e-mail)']}
          value={data.possuiMateriais}
          onChange={(v) => onChange('possuiMateriais', v)}
          error={errors.possuiMateriais}
        />

        {data.possuiMateriais === 'Sim' && (
          <div className="space-y-4 pt-2">
            <CheckboxGroup
              label="Quais materiais você possui?"
              options={[
                'Logotipo (vetor, PDF ou PNG transparente)',
                'Fotos do local e fachada',
                'Fotos profissionais dos produtos',
                'Fotos da equipe',
                'Vídeos de divulgação',
                'Cardápio ou Catálogo (PDF/Word)',
                'Manual da marca e fontes',
                'Artes e postagens anteriores',
                'Outros arquivos',
              ]}
              selectedValues={data.tiposMateriais}
              onChange={(v) => onChange('tiposMateriais', v)}
              columns={2}
            />
          </div>
        )}
      </div>

      {/* TransferNow e Links na Nuvem */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-slate-50 border border-blue-100/80 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white mt-0.5">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Como nos enviar arquivos pesados (fotos, vídeos, pastas)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Para garantir que seus arquivos não percam qualidade de resolução, recomendamos o uso da ferramenta gratuita{' '}
              <strong className="text-blue-700">TransferNow</strong> ou o compartilhamento de um link do Google Drive / Dropbox.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <span>TransferNow (Gratuito até 5GB sem cadastro)</span>
            </div>
            <p className="text-xs text-slate-500">
              Basta anexar os arquivos, clicar em gerar link e colá-lo no campo abaixo.
            </p>
          </div>

          <a
            href={transferNowUrl}
            target="_blank"
            rel="noopener noreferrer"
            id="link-transfernow-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <span>Acessar TransferNow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <TextInput
            id="materials-transfernow-link"
            label="Link gerado no TransferNow"
            placeholder="https://www.transfernow.net/dl/..."
            value={data.linkTransferNow}
            onChange={(e) => onChange('linkTransferNow', e.target.value)}
            helper="Cole aqui o link de download gerado"
          />

          <TextInput
            id="materials-cloud-links"
            label="Ou cole link do Google Drive, Dropbox ou OneDrive"
            placeholder="https://drive.google.com/drive/folders/..."
            value={data.linksMateriais}
            onChange={(e) => onChange('linksMateriais', e.target.value)}
            helper="Lembre-se de deixar a permissão de visualização aberta"
          />
        </div>
      </div>

      <TextArea
        id="materials-observacoes"
        label="Existe alguma observação importante sobre os materiais?"
        placeholder="Ex: As fotos da pasta 'Fachada' foram tiradas antes da reforma; o cardápio atualizado é a versão 2..."
        value={data.observacoesMateriais}
        onChange={(e) => onChange('observacoesMateriais', e.target.value)}
        rows={3}
      />
    </div>
  );
};
