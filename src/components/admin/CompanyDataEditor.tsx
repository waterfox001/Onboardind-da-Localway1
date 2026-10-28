import React, { useState } from 'react';
import { OnboardingData, DayOfWeek, DaySchedule } from '../../types';
import {
  Building,
  MapPin,
  Clock,
  Layers,
  UserCheck,
  Save,
  Check,
  AlertCircle,
  Plus,
  X,
  CreditCard,
  Languages,
  Car,
  Calendar,
  Phone,
  Mail,
  Globe,
  Instagram,
  FileText,
} from 'lucide-react';

interface CompanyDataEditorProps {
  submissionIndex: number;
  submission: any;
  onSaveSuccess: (updatedSubmission: any) => void;
  onCancel: () => void;
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const DAYS_LABELS: { key: DayOfWeek; label: string }[] = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

export const CompanyDataEditor: React.FC<CompanyDataEditorProps> = ({
  submissionIndex,
  submission,
  onSaveSuccess,
  onCancel,
}) => {
  // Extract initial raw form data or fallback from rowData
  const row = submission.payload?.rowData || {};
  const raw: Partial<OnboardingData> = submission.payload?.raw || {};

  // Active section tab
  const [activeSection, setActiveSection] = useState<
    'company' | 'address' | 'hours' | 'structure' | 'manager'
  >('company');

  // Form State initialized from submission
  const [formData, setFormData] = useState({
    // Company data
    nomeFantasia: raw.nomeFantasia || row['Nome fantasia'] || '',
    razaoSocial: raw.razaoSocial || row['Razão social'] || '',
    cnpj: raw.cnpj || row['CNPJ'] || '',
    dataAbertura: raw.dataAbertura || row['Data de abertura'] || '',
    segmento: raw.segmento || row['Segmento'] || 'Fotografia',
    descricaoEmpresa: raw.descricaoEmpresa || row['Descrição da empresa'] || '',
    whatsapp: raw.whatsapp || row['WhatsApp'] || '',
    telefone: raw.telefone || row['Telefone'] || '',
    email: raw.email || row['E-mail'] || '',
    site: raw.site || row['Site'] || '',
    instagram: raw.instagram || row['Instagram'] || '',
    facebookOutras: raw.facebookOutras || row['Facebook / outras redes'] || '',

    // Address
    ruaAvenida: raw.ruaAvenida || row['Rua / Avenida'] || '',
    numero: raw.numero || row['Número'] || '',
    complemento: raw.complemento || row['Complemento'] || '',
    bairro: raw.bairro || row['Bairro'] || '',
    cidade: raw.cidade || row['Cidade'] || '',
    estado: raw.estado || row['Estado'] || 'SP',

    // Hours
    horarios: raw.horarios || {
      segunda: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false },
      terca: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false },
      quarta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false },
      quinta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false },
      sexta: { status: 'aberto', abertura1: '08:00', fechamento1: '18:00', temIntervalo: false },
      sabado: { status: 'fechado', abertura1: '08:00', fechamento1: '12:00', temIntervalo: false },
      domingo: { status: 'fechado', abertura1: '08:00', fechamento1: '12:00', temIntervalo: false },
    },
    trabalhaAgendamento: raw.trabalhaAgendamento || row['Trabalha com agendamento'] || 'Não',
    formasAgendamento: raw.formasAgendamento || (row['Formas de agendamento'] ? row['Formas de agendamento'].split(', ') : []),
    outroAgendamento: raw.outroAgendamento || '',
    contatoLinkAgendamento: raw.contatoLinkAgendamento || row['Contato / link de agendamento'] || '',

    // Structure & Facilities
    estacionamento: raw.estacionamento || row['Estacionamento'] || 'Não possui estacionamento',
    outroEstacionamento: raw.outroEstacionamento || row['Outro estacionamento'] || '',
    idiomas: raw.idiomas || (row['Idiomas'] ? row['Idiomas'].split(', ') : ['Português']),
    formasPagamento: raw.formasPagamento || (row['Formas de pagamento'] ? row['Formas de pagamento'].split(', ') : ['Pix', 'Cartão de Crédito']),
    outroPagamento: raw.outroPagamento || row['Outro pagamento'] || '',
    bandeirasCartao: raw.bandeirasCartao || ['Visa', 'Mastercard'],
    outraBandeiraCartao: raw.outraBandeiraCartao || '',

    // Manager
    responsavelNome: raw.responsavelNome || row['Responsável'] || '',
    responsavelCargo: raw.responsavelCargo || row['Cargo / função'] || '',
    responsavelWhatsapp: raw.responsavelWhatsapp || row['WhatsApp responsável'] || '',
    responsavelEmail: raw.responsavelEmail || row['E-mail responsável'] || '',
    observacoesFinais: raw.observacoesFinais || row['Observações finais'] || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const updateField = (field: string, val: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const updateDayStatus = (day: DayOfWeek, status: 'aberto' | 'fechado') => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: {
          ...(prev.horarios as any)[day],
          status,
        },
      },
    }));
  };

  const updateDayHours = (
    day: DayOfWeek,
    field: 'abertura1' | 'fechamento1' | 'abertura2' | 'fechamento2' | 'temIntervalo',
    val: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: {
          ...(prev.horarios as any)[day],
          [field]: val,
        },
      },
    }));
  };

  const copyMondayToWeekdays = () => {
    const monday = (formData.horarios as any).segunda;
    const updated = { ...formData.horarios };
    (['terca', 'quarta', 'quinta', 'sexta'] as DayOfWeek[]).forEach((d) => {
      (updated as any)[d] = { ...monday };
    });
    setFormData((prev) => ({ ...prev, horarios: updated }));
  };

  const toggleArrayItem = (field: 'idiomas' | 'formasPagamento' | 'bandeirasCartao' | 'formasAgendamento', item: string) => {
    setFormData((prev) => {
      const currentList: string[] = prev[field] || [];
      const nextList = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];
      return { ...prev, [field]: nextList };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      // Rebuild updated rowData
      const updatedRowData = {
        ...(submission.payload?.rowData || {}),
        'Nome fantasia': formData.nomeFantasia,
        'Razão social': formData.razaoSocial,
        'CNPJ': formData.cnpj,
        'Data de abertura': formData.dataAbertura,
        'Segmento': formData.segmento,
        'Descrição da empresa': formData.descricaoEmpresa,
        'WhatsApp': formData.whatsapp,
        'Telefone': formData.telefone,
        'E-mail': formData.email,
        'Site': formData.site,
        'Instagram': formData.instagram,
        'Facebook / outras redes': formData.facebookOutras,
        'Rua / Avenida': formData.ruaAvenida,
        'Número': formData.numero,
        'Complemento': formData.complemento,
        'Bairro': formData.bairro,
        'Cidade': formData.cidade,
        'Estado': formData.estado,
        'Trabalha com agendamento': formData.trabalhaAgendamento,
        'Formas de agendamento': formData.formasAgendamento.join(', ') + (formData.outroAgendamento ? ` (${formData.outroAgendamento})` : ''),
        'Contato / link de agendamento': formData.contatoLinkAgendamento,
        'Estacionamento': formData.estacionamento,
        'Outro estacionamento': formData.outroEstacionamento,
        'Idiomas': formData.idiomas.join(', '),
        'Formas de pagamento': formData.formasPagamento.join(', ') + (formData.outroPagamento ? ` (${formData.outroPagamento})` : ''),
        'Outro pagamento': formData.outroPagamento,
        'Responsável': formData.responsavelNome,
        'Cargo / função': formData.responsavelCargo,
        'WhatsApp responsável': formData.responsavelWhatsapp,
        'E-mail responsável': formData.responsavelEmail,
        'Observações finais': formData.observacoesFinais,
      };

      const updatedPayload = {
        ...(submission.payload || {}),
        rowData: updatedRowData,
        raw: {
          ...(submission.payload?.raw || {}),
          ...formData,
        },
      };

      const res = await fetch(`/api/submissions/${submissionIndex}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: updatedPayload,
        }),
      });

      const resJson = await res.json();

      if (resJson.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        onSaveSuccess(resJson.submission || { ...submission, payload: updatedPayload });
      } else {
        setSaveError(resJson.error || 'Falha ao salvar dados no servidor');
      }
    } catch (err) {
      console.error('Erro ao salvar atualização da empresa:', err);
      setSaveError('Erro de conexão ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Header of Editor */}
      <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              Gerenciar Empresa #{submissionIndex + 1}
            </span>
            <span className="text-sm font-bold text-slate-800">
              {formData.nomeFantasia || 'Empresa Cadastrada'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Atualize dados cadastrais, horários, estrutura e responsável pelo projeto.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Success / Error Feedback */}
      {saveSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>Dados da empresa atualizados e salvos com sucesso!</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 text-red-700 text-xs font-semibold px-4 py-2 border-b border-red-200 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Nav Tabs for Sections */}
      <div className="flex items-center gap-1.5 px-6 pt-3 border-b border-slate-100 bg-white overflow-x-auto shrink-0">
        <button
          type="button"
          onClick={() => setActiveSection('company')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'company'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Dados da Empresa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('address')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'address'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Endereço Comercial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('hours')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'hours'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Horários & Atendimento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('structure')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'structure'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Estrutura & Facilidades</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('manager')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeSection === 'manager'
              ? 'border-blue-600 text-blue-600 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Responsável do Projeto</span>
        </button>
      </div>

      {/* Editor Body */}
      <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
        {/* ================= SECTION 1: DADOS DA EMPRESA ================= */}
        {activeSection === 'company' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Informações Cadastrais e Redes</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => updateField('nomeFantasia', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => updateField('razaoSocial', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => updateField('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Abertura
                </label>
                <input
                  type="text"
                  value={formData.dataAbertura}
                  onChange={(e) => updateField('dataAbertura', e.target.value)}
                  placeholder="Ex: 15/03/2018"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Segmento de Atuação
                </label>
                <input
                  type="text"
                  value={formData.segmento}
                  onChange={(e) => updateField('segmento', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Principal
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone Comercial
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => updateField('telefone', e.target.value)}
                  placeholder="(11) 3000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Comercial
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="contato@empresa.com.br"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Site Atual
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => updateField('site', e.target.value)}
                  placeholder="https://suaempresa.com.br"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  placeholder="@suaempresa"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição da Empresa
              </label>
              <textarea
                rows={3}
                value={formData.descricaoEmpresa}
                onChange={(e) => updateField('descricaoEmpresa', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        )}

        {/* ================= SECTION 2: ENDEREÇO ================= */}
        {activeSection === 'address' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Endereço Comercial Completo</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rua / Avenida
                </label>
                <input
                  type="text"
                  value={formData.ruaAvenida}
                  onChange={(e) => updateField('ruaAvenida', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => updateField('numero', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={formData.complemento}
                  onChange={(e) => updateField('complemento', e.target.value)}
                  placeholder="Sala 102, Bloco B..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => updateField('bairro', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => updateField('cidade', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estado (UF)
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => updateField('estado', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-blue-600 outline-none"
                >
                  {ESTADOS_BRASIL.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= SECTION 3: HORÁRIOS & ATENDIMENTO ================= */}
        {activeSection === 'hours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Horários de Funcionamento por Dia da Semana</span>
              </h4>

              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                Copiar Seg para Sex
              </button>
            </div>

            <div className="space-y-2.5">
              {DAYS_LABELS.map(({ key, label }) => {
                const schedule = (formData.horarios as any)[key] || {
                  status: 'fechado',
                  abertura1: '08:00',
                  fechamento1: '18:00',
                };
                const isOpen = schedule.status === 'aberto';

                return (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border transition-all ${
                      isOpen ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-28 ${isOpen ? 'text-slate-800' : 'text-slate-400'}`}>
                          {label}
                        </span>

                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => updateDayStatus(key, 'aberto')}
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              isOpen ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            Aberto
                          </button>
                          <button
                            type="button"
                            onClick={() => updateDayStatus(key, 'fechado')}
                            className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              !isOpen ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            Fechado
                          </button>
                        </div>
                      </div>

                      {isOpen ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            type="time"
                            value={schedule.abertura1 || '08:00'}
                            onChange={(e) => updateDayHours(key, 'abertura1', e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                          />
                          <span className="text-xs text-slate-400">às</span>
                          <input
                            type="time"
                            value={schedule.fechamento1 || '18:00'}
                            onChange={(e) => updateDayHours(key, 'fechamento1', e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                          />

                          {schedule.temIntervalo ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">e</span>
                              <input
                                type="time"
                                value={schedule.abertura2 || '14:00'}
                                onChange={(e) => updateDayHours(key, 'abertura2', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                              />
                              <span className="text-xs text-slate-400">às</span>
                              <input
                                type="time"
                                value={schedule.fechamento2 || '18:00'}
                                onChange={(e) => updateDayHours(key, 'fechamento2', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={() => updateDayHours(key, 'temIntervalo', false)}
                                className="p-1 text-slate-400 hover:text-red-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateDayHours(key, 'temIntervalo', true)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 px-2 py-1 bg-slate-100 rounded-md"
                            >
                              + Intervalo
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Fechado o dia todo</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Agendamentos */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Configurações de Agendamento</span>
              </h4>

              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-700">Trabalha com agendamento?</span>
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => updateField('trabalhaAgendamento', 'Sim')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      formData.trabalhaAgendamento === 'Sim'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('trabalhaAgendamento', 'Não')}
                    className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                      formData.trabalhaAgendamento === 'Não'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {formData.trabalhaAgendamento === 'Sim' && (
                <div className="space-y-3 p-4 rounded-xl bg-blue-50/40 border border-blue-100">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Canais de Agendamento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['WhatsApp', 'Telefone', 'Site', 'Link externo', 'Outro'].map((canal) => {
                        const isChecked = formData.formasAgendamento.includes(canal);
                        return (
                          <button
                            type="button"
                            key={canal}
                            onClick={() => toggleArrayItem('formasAgendamento', canal)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {canal}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link ou contato para agendamento
                    </label>
                    <input
                      type="text"
                      value={formData.contatoLinkAgendamento}
                      onChange={(e) => updateField('contatoLinkAgendamento', e.target.value)}
                      placeholder="Ex: https://calendly.com/... ou WhatsApp (11) 90000-0000"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SECTION 4: ESTRUTURA & FACILIDADES ================= */}
        {activeSection === 'structure' && (
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Estrutura, Pagamentos e Facilidades</span>
            </h4>

            {/* Estacionamento */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Opção de Estacionamento
              </label>
              <select
                value={formData.estacionamento}
                onChange={(e) => updateField('estacionamento', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
              >
                <option value="Estacionamento próprio gratuito">Estacionamento próprio gratuito</option>
                <option value="Estacionamento próprio pago">Estacionamento próprio pago</option>
                <option value="Convênio com estacionamento próximo">Convênio com estacionamento próximo</option>
                <option value="Estacionamento fácil na rua">Estacionamento fácil na rua</option>
                <option value="Não possui estacionamento">Não possui estacionamento</option>
                <option value="Outro">Outro</option>
              </select>

              {formData.estacionamento === 'Outro' && (
                <input
                  type="text"
                  value={formData.outroEstacionamento}
                  onChange={(e) => updateField('outroEstacionamento', e.target.value)}
                  placeholder="Descreva o estacionamento..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
                />
              )}
            </div>

            {/* Idiomas */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Idiomas de Atendimento
              </label>
              <div className="flex flex-wrap gap-2">
                {['Português', 'Inglês', 'Espanhol', 'Outro'].map((lang) => {
                  const isChecked = formData.idiomas.includes(lang);
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => toggleArrayItem('idiomas', lang)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formas de Pagamento */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Formas de Pagamento Aceitas
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Pix',
                  'Cartão de Crédito',
                  'Cartão de Débito',
                  'Dinheiro',
                  'Boleto Bancário',
                  'Parcelamento sem juros',
                  'Outro',
                ].map((pag) => {
                  const isChecked = formData.formasPagamento.includes(pag);
                  return (
                    <button
                      type="button"
                      key={pag}
                      onClick={() => toggleArrayItem('formasPagamento', pag)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pag}
                    </button>
                  );
                })}
              </div>

              {formData.formasPagamento.includes('Outro') && (
                <input
                  type="text"
                  value={formData.outroPagamento}
                  onChange={(e) => updateField('outroPagamento', e.target.value)}
                  placeholder="Qual outra forma de pagamento?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 outline-none"
                />
              )}
            </div>

            {/* Bandeiras de Cartão */}
            {(formData.formasPagamento.includes('Cartão de Crédito') ||
              formData.formasPagamento.includes('Cartão de Débito')) && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Bandeiras de Cartão
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outra'].map(
                    (bandeira) => {
                      const isChecked = formData.bandeirasCartao.includes(bandeira);
                      return (
                        <button
                          type="button"
                          key={bandeira}
                          onClick={() => toggleArrayItem('bandeirasCartao', bandeira)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {bandeira}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= SECTION 5: RESPONSÁVEL ================= */}
        {activeSection === 'manager' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Responsável pelo Projeto e Contato Principal</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsavelNome}
                  onChange={(e) => updateField('responsavelNome', e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  value={formData.responsavelCargo}
                  onChange={(e) => updateField('responsavelCargo', e.target.value)}
                  placeholder="Ex: Diretor, Proprietário..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp do Responsável
                </label>
                <input
                  type="text"
                  value={formData.responsavelWhatsapp}
                  onChange={(e) => updateField('responsavelWhatsapp', e.target.value)}
                  placeholder="(11) 90000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail do Responsável
                </label>
                <input
                  type="email"
                  value={formData.responsavelEmail}
                  onChange={(e) => updateField('responsavelEmail', e.target.value)}
                  placeholder="carlos@empresa.com.br"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observações do Projeto
              </label>
              <textarea
                rows={3}
                value={formData.observacoesFinais}
                onChange={(e) => updateField('observacoesFinais', e.target.value)}
                placeholder="Anotações internas ou observações do cliente..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-600 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Modificações são gravadas diretamente no banco de submissões do servidor.
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Empresa'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
