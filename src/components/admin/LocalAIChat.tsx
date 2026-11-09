import React, { useState, useRef, useEffect } from 'react';
import { FormSchemaState } from '../../constants/formSchema';
import { ManagedServiceConfig, UniversalQuestion } from '../../types';
import { SegmentConfig } from '../../constants/segments';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Layers,
  Database,
  Sliders,
} from 'lucide-react';

interface LocalAIChatProps {
  schema: FormSchemaState;
  onUpdateSchema: (newSchema: FormSchemaState) => void;
  onNavigateToTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    actionType: string;
    target: string;
    serviceId?: string;
    segmentKey?: string;
    questionLabel?: string;
    questionType?: string;
    questionHelper?: string;
    questionPlaceholder?: string;
    questionRequired?: boolean;
    questionOptions?: string[];
    serviceTitle?: string;
    serviceTagline?: string;
    serviceEnabled?: boolean;
    previewSummary?: string;
    applied?: boolean;
    dismissed?: boolean;
  } | null;
}

export const LocalAIChat: React.FC<LocalAIChatProps> = ({
  schema,
  onUpdateSchema,
  onNavigateToTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Olá! Sou o **Local AI**, o assistente inteligente de gestão do Onboarding da Localway.\n\nPosso adicionar perguntas a qualquer serviço ou segmento, ativar/desativar serviços, ou sugerir perguntas estratégicas. Experimente um dos atalhos abaixo ou me envie um comando!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      action: null,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const quickPrompts = [
    'Adicionar pergunta sobre prazo de entrega no serviço Site',
    'Desativar o serviço Registro de Marca no formulário público',
    'Ativar o serviço Loja Virtual / E-commerce',
    'Criar pergunta com opções para o serviço Google Meu Negócio',
    'Sugerir perguntas estratégicas para Restaurantes e Pizzarias',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const contextSummary = {
        activeServices: Object.keys(schema.servicesConfig || {}).filter(
          (k) => schema.servicesConfig[k]?.enabled !== false
        ),
        segmentsCount: Object.keys(schema.segmentsConfig || {}).length,
      };

      const res = await fetch('/api/admin/local-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          currentContext: contextSummary,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const assistantMsg: ChatMessage = {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'Comando processado com sucesso!',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          action: data.hasAction && data.action ? { ...data.action, applied: false } : null,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: data.error || 'Não consegui processar o comando no momento. Verifique a conexão com o servidor.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Erro de comunicação com o servidor ao consultar o Local AI.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply proposed action to live schema
  const handleApplyAction = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg || !msg.action) return;

    const action = msg.action;
    const updatedServices = { ...schema.servicesConfig };
    const updatedSegments = { ...schema.segmentsConfig };

    if (action.actionType === 'toggle_service' && action.serviceId) {
      const svc = updatedServices[action.serviceId];
      if (svc) {
        updatedServices[action.serviceId] = {
          ...svc,
          enabled: action.serviceEnabled ?? true,
        };
      }
    } else if (action.actionType === 'add_question') {
      const targetSvcId = action.serviceId || 'site';
      const svc = updatedServices[targetSvcId];
      if (svc) {
        const newQ: UniversalQuestion = {
          id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          label: action.questionLabel || 'Nova pergunta sugerida pelo Local AI',
          type: (action.questionType as any) || 'text',
          helper: action.questionHelper,
          placeholder: action.questionPlaceholder,
          required: action.questionRequired ?? true,
          enabled: true,
          options: action.questionOptions,
          order: (svc.questions || []).length + 1,
        };
        updatedServices[targetSvcId] = {
          ...svc,
          questions: [...(svc.questions || []), newQ],
        };
      }
    }

    const updatedSchema: FormSchemaState = {
      ...schema,
      servicesConfig: updatedServices,
      segmentsConfig: updatedSegments,
    };

    onUpdateSchema(updatedSchema);
    localStorage.setItem('localway_form_schema_v1', JSON.stringify(updatedSchema));

    // Update message action state to applied
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.action
          ? { ...m, action: { ...m.action, applied: true } }
          : m
      )
    );

    showToast('Alteração aplicada com sucesso no sistema!');
  };

  const handleDismissAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.action
          ? { ...m, action: { ...m.action, dismissed: true } }
          : m
      )
    );
  };

  return (
    <div className="space-y-4 flex flex-col h-[750px]">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-5 sm:p-6 text-white shadow-xs shrink-0 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-white backdrop-blur-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </span>
            <h2 className="text-base sm:text-lg font-bold">
              Local AI — Assistente Inteligente da Localway
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
            Motor com Gemini 3.8 Flash e latência ultrarrápida. Use linguagem natural para administrar serviços, criar perguntas e ajustar fluxos. Toda alteração precisa da sua confirmação antes de ser aplicada.
          </p>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hidden sm:inline-block">
          Modo Ativo
        </span>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn shrink-0">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Sugestões:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/40 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>

                {/* Proposed Action Preview Card */}
                {m.action && !m.action.dismissed && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-slate-900 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-amber-200/60 text-amber-900">
                          <Sliders className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-bold text-amber-900">
                          Ação Proposta pelo Local AI
                        </span>
                      </div>
                      {m.action.applied && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Aplicado no Sistema
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {m.action.previewSummary || 'Alteração estrutural sugerida'}
                    </p>

                    {m.action.questionLabel && (
                      <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-amber-200/60 space-y-1">
                        <div>
                          <strong>Pergunta:</strong> {m.action.questionLabel}
                        </div>
                        <div>
                          <strong>Tipo:</strong> {m.action.questionType || 'text'} •{' '}
                          <strong>Serviço:</strong> {m.action.serviceId}
                        </div>
                        {m.action.questionOptions && m.action.questionOptions.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            <strong>Opções:</strong> {m.action.questionOptions.join(', ')}
                          </div>
                        )}
                      </div>
                    )}

                    {!m.action.applied && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleDismissAction(m.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyAction(m.id)}
                          className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aplicar Alteração no Sistema</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 block px-1">
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <span>Local AI pensando e estruturando resposta...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Peça ao Local AI: 'Desative o serviço Tráfego Pago' ou 'Crie pergunta para o serviço Site'..."
          disabled={isLoading}
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Enviar</span>
        </button>
      </form>
    </div>
  );
};
