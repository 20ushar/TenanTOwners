import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (error.message.includes('Failed to fetch dynamically imported module') || error.message.includes('dynamically imported module') || error.message.includes('Load failed')) {
      const isReloaded = sessionStorage.getItem('chunk_load_error_reloaded');
      if (!isReloaded) {
        sessionStorage.setItem('chunk_load_error_reloaded', 'true');
        window.location.reload();
        return;
      }
    } else {
        sessionStorage.removeItem('chunk_load_error_reloaded');
    }
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-lg border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              We've encountered an unexpected error. Please try refreshing the page or check back later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-[#4aa4f0] text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              Refresh Page
            </button>
            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 break-words line-clamp-2">Error: {this.state.errorMsg}</p>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
