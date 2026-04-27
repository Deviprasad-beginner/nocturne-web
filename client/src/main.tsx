import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the default behavior (logging to console)
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

// Error Boundary Component
import { Component, ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    // Auto-reset after 5 seconds — gives Render cold-start time to wake up
    // so the next render attempt hits a live server
    this.resetTimer = setTimeout(() => {
      this.setState({ hasError: false, error: undefined });
    }, 5000);
  }

  componentWillUnmount() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto p-8">
            <h1 className="text-4xl font-bold text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-300 text-lg">
              The app encountered an unexpected error. Retrying automatically…
            </p>
            <p className="text-gray-500 text-sm">
              (If this is a cold start, the server may need a few seconds to wake up.)
            </p>
            <button
              onClick={() => {
                if (this.resetTimer) clearTimeout(this.resetTimer);
                this.setState({ hasError: false, error: undefined });
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Retry Now
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left text-red-400 text-sm mt-4">
                <summary>Error Details (Development Only)</summary>
                <pre className="mt-2 p-4 bg-gray-800 rounded overflow-auto">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);