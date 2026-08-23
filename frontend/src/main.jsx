import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Error Boundary to prevent full application blank/black screens
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("HydroDispatch Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#020617',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #f43f5e',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ color: '#f43f5e', margin: '0 0 12px 0', fontSize: '18px' }}>
              SCADA Workspace Runtime Alert
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>
              {this.state.error?.message || "An unexpected render error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#06b6d4',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Service Worker handling
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    });
  } else {
    // Unregister legacy SWs in local development mode to prevent cached stale bundles
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let reg of registrations) {
        reg.unregister();
      }
    });
  }
}

// Native Mobile Capacitor Integrations
const initNativeMobile = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      const { SplashScreen } = await import('@capacitor/splash-screen');
      const { App: CapApp } = await import('@capacitor/app');

      // Set dark status bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#060911' }).catch(() => {});

      // Hide native splash screen
      await SplashScreen.hide();

      // Hardware back button handler
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.exitApp();
        } else {
          window.history.back();
        }
      });
    }
  } catch (e) {
    // Silent fail if not in native container
  }
};

initNativeMobile();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
