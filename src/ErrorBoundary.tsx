import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    if (hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirebaseError = false;

      try {
        if (error?.message) {
          const parsed = JSON.parse(error.message);
          if (parsed.operationType && parsed.authInfo) {
            errorMessage = `Firestore ${parsed.operationType} failed: ${parsed.error}`;
            isFirebaseError = true;
          }
        }
      } catch (e) {
        errorMessage = error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
            <p className="text-stone-500 mb-6">{errorMessage}</p>
            
            {isFirebaseError && (
              <div className="bg-stone-50 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40">
                <p className="text-xs font-mono text-stone-400 uppercase mb-2">Technical Details</p>
                <pre className="text-xs text-stone-600 whitespace-pre-wrap">
                  {error?.message}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-stone-800 transition-all"
            >
              <RefreshCcw className="w-5 h-5" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
