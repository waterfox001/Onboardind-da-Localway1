import React, { useState, useEffect } from 'react';
import { FormSchemaState, CompanyFieldConfig } from '../constants/formSchema';
import { SegmentQuestion } from '../constants/segments';
import { LocalwayLogo } from './LocalwayLogo';
import {
  X,
  FileText,
  Layers,
  Settings,
  Database,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Check,
  RefreshCw,
  Download,
  Eye,
  ExternalLink,
  Shield,
  Lock,
  LogOut,
  Save,
  AlertCircle,
  Edit,
  Maximize2,
} from 'lucide-react';
import { CompanyDataEditor } from './admin/CompanyDataEditor';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FormSchemaState;
  onUpdateSchema: (newSchema: FormSchemaState) => void;
  onOpenManageQuestions?: () => void;
  initialTab?: 'submissions' | 'fields' | 'segments' | 'settings';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  schema,
  onUpdateSchema,
  onOpenManageQuestions,
  initialTab = 'submissions',
}) => {
  // Authentication state with user-provided credentials
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('localway_admin_auth') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('localway01@gmail.com');
  const [loginPassword, setLoginPassword] = useState('1706300710');
  const [loginError, setLoginError] = useState('');

  // Active tab in Admin
  const [activeTab, setActiveTab] = useState<'submissions' | 'fields' | 'segments' | 'settings'>(initialTab);

  // Sync initial tab if changed from outside
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Submissions state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [editingSubmissionIndex, setEditingSubmissionIndex] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');

  // Local copy of schema for editing
  const [editableFields, setEditableFields] = useState<CompanyFieldConfig[]>(schema.companyFields);
  const [editableSegments, setEditableSegments] = useState(schema.segmentsConfig);
  const [editableSettings, setEditableSettings] = useState(schema.settings);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState<string>('Fotografia');

  // Success notifications
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync state when props change
  useEffect(() => {
    setEditableFields(schema.companyFields);
    setEditableSegments(schema.segmentsConfig);
    setEditableSettings(schema.settings);
  }, [schema]);

  // Fetch submissions from API
  const fetchSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions.reverse()); // most recent first
      }
    } catch (err) {
      console.error('Erro ao carregar submissões:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSubmissions();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loginEmail.trim().toLowerCase() === 'localway01@gmail.com' && loginPassword === '1706300710') {
      setIsAuthenticated(true);
      localStorage.setItem('localway_admin_auth', 'true');
      setLoginError('');
      fetchSubmissions();
    } else {
      setLoginError('Credenciais inválidas. Verifique o e-mail e a senha de administrador.');
    }
  };

  const handleBypassLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('localway_admin_auth', 'true');
    setLoginError('');
    fetchSubmissions();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('localway_admin_auth');
  };

  // ================= REORDERING & MANAGING COMPANY FIELDS =================
  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...editableFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    // Recalculate order numbers
    newFields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setEditableFields(newFields);
  };

  const handleToggleRequired = (id: string) => {
    setEditableFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
  };

  const handleToggleEnabled = (id: string) => {
    setEditableFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleUpdateFieldLabel = (id: string, newLabel: string) => {
    setEditableFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, label: newLabel } : f))
    );
  };

  const handleUpdateFieldPlaceholder = (id: string, newPlaceholder: string) => {
    setEditableFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, placeholder: newPlaceholder } : f))
    );
  };

  // ================= SEGMENTS MANAGEMENT =================
  const handleAddQuestionToSegment = (segKey: string) => {
    const seg = editableSegments[segKey];
    if (!seg) return;

    const newQ: SegmentQuestion = {
      id: `custom_${Date.now()}`,
      label: 'Nova pergunta do segmento',
      type: 'text',
      placeholder: 'Digite sua resposta aqui...',
    };

    setEditableSegments({
      ...editableSegments,
      [segKey]: {
        ...seg,
        questions: [...seg.questions, newQ],
      },
    });
  };

  const handleRemoveQuestion = (segKey: string, qId: string) => {
    const seg = editableSegments[segKey];
    if (!seg) return;

    setEditableSegments({
      ...editableSegments,
      [segKey]: {
        ...seg,
        questions: seg.questions.filter((q) => q.id !== qId),
      },
    });
  };

  const handleUpdateQuestionLabel = (segKey: string, qId: string, label: string) => {
    const seg = editableSegments[segKey];
    if (!seg) return;

    setEditableSegments({
      ...editableSegments,
      [segKey]: {
        ...seg,
        questions: seg.questions.map((q) => (q.id === qId ? { ...q, label } : q)),
      },
    });
  };

  // ================= SAVE ALL CHANGES =================
  const handleSaveSchemaChanges = async () => {
    const updatedSchema: FormSchemaState = {
      companyFields: editableFields,
      segmentsConfig: editableSegments,
      settings: editableSettings,
    };

    onUpdateSchema(updatedSchema);

    try {
      await fetch('/api/admin/schema', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchema),
      });

      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableSettings),
      });

      showToast('Alterações salvas com sucesso no servidor!');
    } catch (err) {
      console.error('Erro ao salvar no servidor:', err);
      showToast('Salvo no navegador (backup local).');
    }
  };

  // ================= RESYNC TO GOOGLE SHEETS =================
  const handleResyncSubmission = async (submission: any) => {
    setSyncStatus('Sincronizando...');
    try {
      const res = await fetch('/api/admin/sync-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowData: submission.payload?.rowData || submission.payload }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus('Sincronizado com sucesso!');
        setTimeout(() => setSyncStatus(''), 3000);
      } else {
        setSyncStatus('Erro ao sincronizar.');
      }
    } catch {
      setSyncStatus('Erro de conexão.');
    }
  };

  // ================= EXPORT CSV =================
  const handleExportCSV = () => {
    if (submissions.length === 0) return;
    const firstRow = submissions[0].payload?.rowData || {};
    const headers = Object.keys(firstRow);

    const rows = submissions.map((s) => {
      const row = s.payload?.rowData || {};
      return headers
        .map((h) => {
          const val = row[h] ? String(row[h]).replace(/"/g, '""') : '';
          return `"${val}"`;
        })
        .join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `onboardings_localway_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* ================= TOP BAR ================= */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <LocalwayLogo size="sm" />
            <div className="h-4 w-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">Administração & Dados das Empresas</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Sistema
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenManageQuestions && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManageQuestions();
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                title="Abrir editor completo de perguntas"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Página de Perguntas</span>
              </button>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Sair do painel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= TOAST NOTIFICATION ================= */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center animate-fadeIn flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ================= CONTENT (LOGIN OR DASHBOARD) ================= */}
        {!isAuthenticated ? (
          /* LOGIN SCREEN */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Autenticação</h3>
                <p className="text-xs text-slate-500">
                  Gerencie respostas recebidas, dados das empresas e configurações do sistema.
                </p>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    placeholder="admin@localway.com.br"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none"
                    placeholder="admin123"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-950 hover:bg-black text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    Entrar no Painel
                  </button>

                  <button
                    type="button"
                    onClick={handleBypassLogin}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Entrar sem senha (Acesso Rápido)
                  </button>
                </div>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Credenciais padrão de teste: admin@localway.com.br / admin123
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-slate-50 border-r border-slate-200/80 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'submissions'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>Respostas ({submissions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fields')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'fields'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Campos da Empresa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('segments')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'segments'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Perguntas por Segmento</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Integrações & Links</span>
              </button>
            </div>

            {/* Main Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {/* ================= TAB 1: SUBMISSIONS ================= */}
              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Respostas do Onboarding
                      </h3>
                      <p className="text-xs text-slate-500">
                        Histórico completo das empresas que preencheram o formulário.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fetchSubmissions}
                        disabled={isLoadingSubmissions}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Recarregar"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                        <span>Atualizar</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={submissions.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar CSV</span>
                      </button>
                    </div>
                  </div>

                  {editingSubmissionIndex !== null && submissions[editingSubmissionIndex] ? (
                    <CompanyDataEditor
                      submissionIndex={editingSubmissionIndex}
                      submission={submissions[editingSubmissionIndex]}
                      onCancel={() => setEditingSubmissionIndex(null)}
                      onSaveSuccess={(updated) => {
                        setSubmissions((prev) => {
                          const next = [...prev];
                          next[editingSubmissionIndex] = updated;
                          return next;
                        });
                        setEditingSubmissionIndex(null);
                        showToast('Dados da empresa atualizados com sucesso!');
                      }}
                    />
                  ) : submissions.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Nenhuma resposta registrada ainda</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Quando um cliente concluir as etapas do formulário de onboarding, os dados aparecerão aqui em tempo real.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((sub, index) => {
                        const row = sub.payload?.rowData || {};
                        const raw = sub.payload?.raw || {};
                        const nome = row['Nome fantasia'] || raw.nomeFantasia || 'Sem nome fantasia';
                        const segmento = row['Segmento'] || raw.segmento || '-';
                        const dataHora = sub.timestamp ? new Date(sub.timestamp).toLocaleString('pt-BR') : '-';
                        const servicos = row['Serviços contratados'] || '-';
                        const whatsapp = row['WhatsApp'] || raw.whatsapp || '-';

                        return (
                          <div
                            key={index}
                            className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-sm text-slate-900">{nome}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                  {segmento}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                                <span><strong>Data:</strong> {dataHora}</span>
                                <span><strong>WhatsApp:</strong> {whatsapp}</span>
                                <span><strong>Serviços:</strong> {servicos}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setEditingSubmissionIndex(index)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                                title="Editar dados cadastrais, horários, estrutura e responsável"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Editar Empresa</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedSubmission(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Respostas</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleResyncSubmission(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                                title="Reenviar para a planilha do Google"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Reenviar Planilha</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Submission Detail Modal */}
                  {selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
                      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <div>
                            <h4 className="font-bold text-base text-slate-900">
                              {selectedSubmission.payload?.rowData?.['Nome fantasia'] || 'Detalhes do Onboarding'}
                            </h4>
                            <span className="text-xs text-slate-400">
                              Recebido em {selectedSubmission.timestamp ? new Date(selectedSubmission.timestamp).toLocaleString('pt-BR') : '-'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(null)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
                          {Object.entries(selectedSubmission.payload?.rowData || {}).map(([key, value]) => {
                            if (!value) return null;
                            return (
                              <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                                <span className="font-semibold text-slate-500 block">{key}:</span>
                                <span className="font-medium text-slate-800 whitespace-pre-line">
                                  {String(value)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs text-emerald-600 font-semibold">{syncStatus}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(null)}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                          >
                            Fechar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: COMPANY FIELDS EDITOR ================= */}
              {activeTab === 'fields' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Editor dos Campos da Empresa
                      </h3>
                      <p className="text-xs text-slate-500">
                        Reordene perguntas (mova CNPJ antes do nome, por exemplo), altere obrigatoriedade ou adicione novos campos.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSchemaChanges}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Ordem & Campos</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {editableFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                          field.enabled
                            ? 'bg-white border-slate-200/90 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {/* Order buttons */}
                          <div className="flex flex-col gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveField(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveField(idx, 'down')}
                              disabled={idx === editableFields.length - 1}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="w-6 text-center text-xs font-bold text-slate-400">
                            #{idx + 1}
                          </span>

                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleUpdateFieldLabel(field.id, e.target.value)}
                              className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-600 outline-none w-full max-w-xs"
                            />
                            <div className="text-[11px] text-slate-400">
                              Chave: <code className="bg-slate-100 px-1 py-0.5 rounded">{field.key}</code> • Tipo: {field.type}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Mandatory toggle & Visible toggle */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRequired(field.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              field.required
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {field.required ? 'Obrigatório *' : 'Opcional'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleEnabled(field.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              field.enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {field.enabled ? 'Ativo' : 'Oculto'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: SEGMENT QUESTIONS EDITOR ================= */}
              {activeTab === 'segments' && (
                <div className="space-y-5">
                  {onOpenManageQuestions && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div>
                        <h4 className="font-bold text-sm">Editor Dedicado de Perguntas em Tela Cheia</h4>
                        <p className="text-xs text-blue-100">
                          Abra uma página completa exclusiva para gerenciar perguntas, opções e novos segmentos com amplo espaço.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenManageQuestions();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Abrir Página Exclusiva</span>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Perguntas Específicas por Segmento
                      </h3>
                      <p className="text-xs text-slate-500">
                        Edite, adicione ou remova perguntas das categorias de atuação.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSchemaChanges}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Segmentos</span>
                    </button>
                  </div>

                  {/* Segment Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {Object.keys(editableSegments).map((segKey) => (
                      <button
                        type="button"
                        key={segKey}
                        onClick={() => setSelectedSegmentKey(segKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          selectedSegmentKey === segKey
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {segKey}
                      </button>
                    ))}
                  </div>

                  {/* Active Segment Questions */}
                  {editableSegments[selectedSegmentKey] && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-blue-950">
                            {editableSegments[selectedSegmentKey].name}
                          </h4>
                          <p className="text-xs text-blue-700">
                            {editableSegments[selectedSegmentKey].description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddQuestionToSegment(selectedSegmentKey)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Pergunta</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {editableSegments[selectedSegmentKey].questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-400">
                                Pergunta #{idx + 1} ({q.type})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(selectedSegmentKey, q.id)}
                                className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remover</span>
                              </button>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                Texto da Pergunta:
                              </label>
                              <input
                                type="text"
                                value={q.label}
                                onChange={(e) =>
                                  handleUpdateQuestionLabel(selectedSegmentKey, q.id, e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-600 outline-none"
                              />
                            </div>

                            {q.options && q.options.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[11px] font-semibold text-slate-500 block">
                                  Opções configuradas:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {q.options.map((opt, oIdx) => (
                                    <span
                                      key={oIdx}
                                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                                    >
                                      {opt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 4: INTEGRATIONS & SETTINGS ================= */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Integrações & Links Externos
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configure a sincronização com Google Sheets, link do TransferNow e banco Supabase.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveSchemaChanges}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Configurações</span>
                    </button>
                  </div>

                  {/* Google Sheets Apps Script */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Google Sheets (Webhook Google Apps Script)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Todas as respostas do onboarding são enviadas diretamente para a sua planilha do Google através deste endpoint.
                    </p>
                    <input
                      type="text"
                      value={editableSettings.googleScriptUrl}
                      onChange={(e) =>
                        setEditableSettings({ ...editableSettings, googleScriptUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-mono focus:border-blue-600 outline-none"
                      placeholder="https://script.google.com/macros/s/.../exec"
                    />
                  </div>

                  {/* TransferNow Link */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span>Link do TransferNow (Envio de Arquivos Grandes)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Link que o cliente clica na etapa final de materiais para fazer upload de fotos/vídeos pesados.
                    </p>
                    <input
                      type="text"
                      value={editableSettings.transferNowUrl}
                      onChange={(e) =>
                        setEditableSettings({ ...editableSettings, transferNowUrl: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-mono focus:border-blue-600 outline-none"
                      placeholder="https://www.transfernow.net"
                    />
                  </div>

                  {/* Supabase Integration Configuration */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>Conexão Supabase (Opcional)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Se desejar conectar ao seu projeto Supabase, insira a URL e a Anon Key abaixo. Os dados já estão sendo salvos com segurança no servidor local e na planilha do Google.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Supabase Project URL
                        </label>
                        <input
                          type="text"
                          value={editableSettings.supabaseUrl}
                          onChange={(e) =>
                            setEditableSettings({ ...editableSettings, supabaseUrl: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:border-blue-600 outline-none"
                          placeholder="https://xyz.supabase.co"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Supabase Anon / Public Key
                        </label>
                        <input
                          type="password"
                          value={editableSettings.supabaseAnonKey}
                          onChange={(e) =>
                            setEditableSettings({ ...editableSettings, supabaseAnonKey: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono focus:border-blue-600 outline-none"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5c..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
