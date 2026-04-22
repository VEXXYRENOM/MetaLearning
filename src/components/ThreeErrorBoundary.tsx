import React, { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  t?: any;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      errorMessage: error.message || 'Unknown error' 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js or Canvas Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      
      const title = t ? t('error.canvas_crash', '3D Scene Crash Detected') : '3D Scene Crash Detected';
      const msg = this.props.fallbackMessage || (t ? t('error.canvas_msg', 'There was a problem rendering the 3D graphics. Your browser might be out of memory or not fully support WebGL.') : '');
      const btn = t ? t('error.retry', 'Try Again') : 'Try Again';

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', minHeight: '300px',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px', padding: '2rem', textAlign: 'center', color: 'white',
          boxShadow: 'inset 0 0 50px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#fca5a5' }}>
            {title}
          </h3>
          <p style={{ color: '#f87171', fontSize: '0.9rem', margin: '0 0 1.5rem', maxWidth: '400px', lineHeight: '1.5' }}>
            {msg}
            <br/><br/>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Error: {this.state.errorMessage}</span>
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            style={{
              padding: '10px 24px', background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5',
              cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          >
            {btn}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ThreeErrorBoundary(props: Omit<Props, 't'>) {
  const { t } = useTranslation();
  return <ErrorBoundaryClass {...props} t={t} />;
}
