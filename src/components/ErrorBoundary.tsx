import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#1e293b',
          color: '#fff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>
            ⚠️ Etwas ist schiefgelaufen
          </h1>
          <p style={{ marginBottom: '20px', maxWidth: '600px' }}>
            Die Stromtarif-Vergleichsanwendung konnte nicht geladen werden.
          </p>
          <details style={{ marginBottom: '20px', maxWidth: '600px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
              Technische Details anzeigen
            </summary>
            <pre style={{ 
              backgroundColor: '#374151', 
              padding: '10px', 
              borderRadius: '8px',
              fontSize: '12px',
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}