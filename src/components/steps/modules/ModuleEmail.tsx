import React from 'react';
import { OnboardingData, EmailAccountItem } from '../../../types';
import { TextInput } from '../../FormControls';
import { Mail, Plus, Trash2, Info } from 'lucide-react';

interface ModuleEmailProps {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => void;
  errors: Record<string, string>;
}

export const ModuleEmail: React.FC<ModuleEmailProps> = ({
  data,
  onChange,
  errors,
}) => {
  const accounts: EmailAccountItem[] = data.emailContas || [];

  const handleAddAccount = () => {
    const defaultSuffix = data.emailDominio ? `@${data.emailDominio.replace(/^@/, '')}` : '';
    const newAccount: EmailAccountItem = {
      id: String(Date.now()),
      endereco: accounts.length === 0 ? `contato${defaultSuffix}` : '',
    };
    onChange('emailContas', [...accounts, newAccount]);
  };

  const handleUpdateAccount = (id: string, value: string) => {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, endereco: value } : acc
    );
    onChange('emailContas', updated);
  };

  const handleRemoveAccount = (id: string) => {
    const updated = accounts.filter((acc) => acc.id !== id);
    onChange('emailContas', updated);
  };

  return (
    <div className="space-y-6" id="module-email">
      {/* Header com cor do serviço E-mail Profissional (#0891B2 - Cyan) */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            E-mail Profissional
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure suas caixas de e-mail corporativas com a identidade e o domínio da sua empresa.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <TextInput
          id="email-dominio"
          label="Qual é o domínio que será utilizado para os e-mails?"
          required
          placeholder="ex: suaempresa.com.br"
          value={data.emailDominio}
          onChange={(e) => onChange('emailDominio', e.target.value)}
          error={errors.emailDominio}
          helper="O endereço web onde os e-mails serão hospedados (ex: suaempresa.com.br)"
        />

        <div className="p-4 sm:p-5 rounded-2xl bg-cyan-50/40 border border-cyan-100 space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-cyan-200/80 text-xs text-slate-700 shadow-xs">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-cyan-950 font-semibold block mb-0.5">
                Quais contas de e-mail precisam ser criadas?
              </strong>
              Adicione cada conta desejada (ex: contato@{data.emailDominio || 'suaempresa.com.br'}, financeiro@{data.emailDominio || 'suaempresa.com.br'}).
            </div>
          </div>

          <div className="space-y-3">
            {accounts.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-cyan-300 bg-white/70">
                <p className="text-xs sm:text-sm text-slate-500 mb-3">
                  Nenhuma conta de e-mail adicionada até agora.
                </p>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Adicionar conta de e-mail
                </button>
              </div>
            ) : (
              accounts.map((acc, idx) => (
                <div
                  key={acc.id}
                  className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200/90 shadow-xs"
                >
                  <span className="text-xs font-bold text-slate-400 w-6 text-center">
                    #{idx + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="email"
                      id={`email-acc-${acc.id}`}
                      placeholder={`ex: contato@${data.emailDominio || 'suaempresa.com.br'}`}
                      value={acc.endereco}
                      onChange={(e) => handleUpdateAccount(acc.id, e.target.value)}
                      className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAccount(acc.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remover conta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}

            {accounts.length > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-600 text-cyan-700 hover:bg-cyan-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Adicionar conta de e-mail
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
