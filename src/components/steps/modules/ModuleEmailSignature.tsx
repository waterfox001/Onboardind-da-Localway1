import React from 'react';
import { OnboardingData, EmailSignaturePerson } from '../../../types';
import { TextInput } from '../../FormControls';
import { FileSignature, Plus, Trash2, Info } from 'lucide-react';

interface ModuleEmailSignatureProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleEmailSignature: React.FC<ModuleEmailSignatureProps> = ({
  data,
  onChange,
}) => {
  const people: EmailSignaturePerson[] = data.assinaturaPessoas || [];

  const handleAddPerson = () => {
    const newPerson: EmailSignaturePerson = {
      id: String(Date.now()),
      nome: people.length === 0 && data.responsavelNome ? data.responsavelNome : '',
      cargo: people.length === 0 && data.responsavelCargo ? data.responsavelCargo : '',
      email: people.length === 0 && data.responsavelEmail ? data.responsavelEmail : '',
      telefone: people.length === 0 && data.responsavelWhatsapp ? data.responsavelWhatsapp : '',
    };
    onChange('assinaturaPessoas', [...people, newPerson]);
  };

  const handleUpdatePerson = (
    id: string,
    field: keyof EmailSignaturePerson,
    value: string
  ) => {
    const updated = people.map((p) =>
      p.id === id ? { ...p, [field]: value } : p
    );
    onChange('assinaturaPessoas', updated);
  };

  const handleRemovePerson = (id: string) => {
    const updated = people.filter((p) => p.id !== id);
    onChange('assinaturaPessoas', updated);
  };

  return (
    <div className="space-y-6" id="module-assinatura-email">
      {/* Header com cor do serviço Assinatura de E-mail (#0EA5E9 - Sky) */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
          <FileSignature className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Assinatura de E-mail Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Padronize a comunicação da sua equipe com assinaturas de e-mail elegantes, clicáveis e alinhadas à sua marca.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-slate-700 shadow-xs">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-sky-950 font-semibold block mb-0.5">
              Quais pessoas ou setores utilizarão a assinatura de e-mail?
            </strong>
            Adicione os dados de cada colaborador ou setor que receberá uma assinatura personalizada (com logotipo da empresa, links de redes e contato).
          </div>
        </div>

        <div className="space-y-4">
          {people.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-sky-300 bg-white/70">
              <p className="text-xs sm:text-sm text-slate-500 mb-3">
                Nenhuma pessoa/setor adicionado para assinatura.
              </p>
              <button
                type="button"
                onClick={handleAddPerson}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                + Adicionar pessoa / setor
              </button>
            </div>
          ) : (
            people.map((person, index) => (
              <div
                key={person.id}
                className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pessoa / Setor #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(person.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput
                    id={`sig-nome-${person.id}`}
                    label="Nome completo"
                    required
                    placeholder="Ex: Carlos Albuquerque"
                    value={person.nome}
                    onChange={(e) =>
                      handleUpdatePerson(person.id, 'nome', e.target.value)
                    }
                  />

                  <TextInput
                    id={`sig-cargo-${person.id}`}
                    label="Cargo / Função"
                    required
                    placeholder="Ex: Diretor Comercial / Atendimento"
                    value={person.cargo}
                    onChange={(e) =>
                      handleUpdatePerson(person.id, 'cargo', e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <TextInput
                    id={`sig-email-${person.id}`}
                    label="E-mail"
                    required
                    placeholder="Ex: carlos@suaempresa.com.br"
                    value={person.email}
                    onChange={(e) =>
                      handleUpdatePerson(person.id, 'email', e.target.value)
                    }
                  />

                  <TextInput
                    id={`sig-tel-${person.id}`}
                    label="Telefone / WhatsApp para a assinatura"
                    placeholder="Ex: (85) 98888-7777"
                    value={person.telefone}
                    onChange={(e) =>
                      handleUpdatePerson(person.id, 'telefone', e.target.value)
                    }
                  />
                </div>
              </div>
            ))
          )}

          {people.length > 0 && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAddPerson}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sky-600 text-sky-700 hover:bg-sky-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                + Adicionar outra pessoa / setor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
