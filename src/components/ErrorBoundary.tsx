import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside onboarding component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Ops, algo não carregou corretamente
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seus dados preenchidos estão preservados em rascunho seguro. Clique no botão abaixo para recarregar o formulário.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-mono text-left max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recarregar Formulário</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
