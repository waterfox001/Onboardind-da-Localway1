import React from 'react';
import { OnboardingData, ServiceId, StepType } from '../../types';
import { SERVICES_LIST } from '../../constants/services';
import { SEGMENTS_CONFIG } from '../../constants/segments';
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
} from 'lucide-react';

interface StepSummaryProps {
  data: OnboardingData;
  onJumpToStep: (stepId: StepType) => void;
}

export const StepSummary: React.FC<StepSummaryProps> = ({
  data,
  onJumpToStep,
}) => {
  const formatDay = (key: keyof OnboardingData['horarios'], label: string) => {
    const s = data.horarios[key];
    if (s.status === 'fechado') return `${label}: Fechado`;
    let txt = `${label}: ${s.abertura1 || '08:00'} às ${s.fechamento1 || '18:00'}`;
    if (s.temIntervalo && s.abertura2) {
      txt += ` e ${s.abertura2} às ${s.fechamento2}`;
    }
    return txt;
  };

  const selectedServicesObjects = SERVICES_LIST.filter((s) =>
    data.servicosContratados.includes(s.id)
  );

  return (
    <div className="space-y-6" id="step-summary">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Resumo das suas Informações
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Revise os dados abaixo. Se precisar corrigir qualquer informação, clique em &ldquo;Editar&rdquo;.
          </p>
        </div>
      </div>

      {/* 1. Empresa */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. Dados da Empresa</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('company')}
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
            <span className="text-slate-400 block">Razão Social:</span>
            <span className="font-semibold text-slate-900">{data.razaoSocial || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">CNPJ:</span>
            <span className="font-semibold text-slate-900">{data.cnpj || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Segmento:</span>
            <span className="font-semibold text-slate-900">
              {data.segmento === 'Outro' ? data.outroSegmento : data.segmento || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">WhatsApp:</span>
            <span className="font-semibold text-slate-900">{data.whatsapp || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">E-mail:</span>
            <span className="font-semibold text-slate-900">{data.email || '-'}</span>
          </div>
        </div>

        {data.descricaoEmpresa && (
          <div className="pt-2 text-xs border-t border-slate-50">
            <span className="text-slate-400 block mb-0.5">Descrição:</span>
            <p className="text-slate-700 italic">{data.descricaoEmpresa}</p>
          </div>
        )}
      </div>

      {/* 2. Endereço */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>2. Endereço Comercial</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('address')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <p className="text-xs font-medium text-slate-800">
          {data.ruaAvenida || 'Rua não informada'}, nº {data.numero || 'S/N'}{' '}
          {data.complemento ? `(${data.complemento})` : ''} - {data.bairro || '-'},{' '}
          {data.cidade || '-'} / {data.estado || '-'}
        </p>
      </div>

      {/* 3. Horários & Agendamento */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>3. Horários e Agendamento</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('hours')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
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

        <div className="pt-2 text-xs border-t border-slate-50 flex items-center gap-2">
          <span className="text-slate-400">Trabalha com agendamento:</span>
          <span className="font-semibold text-slate-900">{data.trabalhaAgendamento || 'Não'}</span>
          {data.formasAgendamento.length > 0 && (
            <span className="text-slate-500">({data.formasAgendamento.join(', ')})</span>
          )}
        </div>
      </div>

      {/* 4. Estrutura & Pagamentos */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>4. Estrutura e Formas de Pagamento</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('structure')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Estacionamento:</span>
            <span className="font-semibold text-slate-900">{data.estacionamento || '-'}</span>
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
      </div>

      {/* 5. Responsável */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>5. Responsável pelo Projeto</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('manager')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
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
            <span className="text-slate-400 block">WhatsApp:</span>
            <span className="font-semibold text-slate-900">{data.responsavelWhatsapp || '-'}</span>
          </div>
        </div>
      </div>

      {/* 6. Serviços Contratados */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>6. Serviços Contratados ({selectedServicesObjects.length})</span>
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

      {/* 7. Detalhes do Segmento */}
      {(() => {
        const segConfig = SEGMENTS_CONFIG[data.segmento] || SEGMENTS_CONFIG['Fotografia'];
        if (!segConfig) return null;

        const hasAnyAnswer = segConfig.questions.some((q) => {
          const resp = data.segmentoRespostas[q.id];
          return resp && (!Array.isArray(resp) || resp.length > 0);
        });

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>7. Detalhes do Segmento ({segConfig.name})</span>
              </div>
              <button
                type="button"
                onClick={() => onJumpToStep('segment_details')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
            </div>

            {hasAnyAnswer ? (
              <div className="space-y-2.5 text-xs">
                {segConfig.questions.map((q) => {
                  const resp = data.segmentoRespostas[q.id];
                  const outroText = data.segmentoRespostas[`${q.id}_outro`];
                  if (!resp || (Array.isArray(resp) && resp.length === 0)) return null;

                  let displayVal = '';
                  if (Array.isArray(resp)) {
                    displayVal = resp
                      .map((item) => {
                        if (q.otherLabel && item === q.otherLabel && outroText?.trim()) {
                          return `${item}: "${outroText.trim()}"`;
                        }
                        return item;
                      })
                      .join(', ');
                  } else if (typeof resp === 'string') {
                    if (q.otherLabel && resp === q.otherLabel && outroText?.trim()) {
                      displayVal = `${resp}: "${outroText.trim()}"`;
                    } else {
                      displayVal = resp;
                    }
                  } else {
                    displayVal = String(resp);
                  }

                  return (
                    <div key={q.id} className="pb-2 border-b border-slate-50 last:border-0 last:pb-0">
                      <span className="text-slate-400 block font-medium mb-0.5">{q.label}</span>
                      <span className="font-semibold text-slate-800">{displayVal}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Nenhum detalhe específico preenchido ainda.</p>
            )}
          </div>
        );
      })()}

      {/* 8. Materiais & Observações */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>8. Materiais & Arquivos</span>
          </div>
          <button
            type="button"
            onClick={() => onJumpToStep('materials')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Editar</span>
          </button>
        </div>

        <div className="text-xs space-y-1">
          <p>
            <span className="text-slate-400">Possui materiais agora:</span>{' '}
            <span className="font-semibold text-slate-800">{data.possuiMateriais || 'Não'}</span>
          </p>
          {data.linkTransferNow && (
            <p>
              <span className="text-slate-400">Link TransferNow:</span>{' '}
              <a
                href={data.linkTransferNow}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium"
              >
                {data.linkTransferNow}
              </a>
            </p>
          )}
          {data.linksMateriais && (
            <p>
              <span className="text-slate-400">Link Nuvem:</span>{' '}
              <span className="text-slate-700">{data.linksMateriais}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
