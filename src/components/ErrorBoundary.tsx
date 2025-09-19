import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 py-24 font-unbound">
          <Card className="max-w-2xl mx-auto brutal-border brutal-shadow-lg">
            <CardHeader className="text-center">
              <div className="bg-destructive text-destructive-foreground brutal-border p-4 mb-4 mx-auto w-fit">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl font-black uppercase">
                SOMETHING WENT WRONG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted brutal-border p-4">
                <p className="text-center font-bold">
                  The application encountered an unexpected error. Don't worry, we've been notified!
                </p>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-background brutal-border p-4 space-y-2">
                  <h4 className="font-black uppercase text-sm">Error Details:</h4>
                  <pre className="text-xs text-destructive font-mono overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground font-mono overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="brutal"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  RELOAD PAGE
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="w-full sm:w-auto"
                >
                  <Home className="w-4 h-4 mr-2" />
                  GO HOME
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}