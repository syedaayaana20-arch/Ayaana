import React from 'react';

/**
 * Global Luxury Error Boundary
 * Prevents white-screen crashes and automatically recovers from chunk loading errors
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error Boundary Caught:", error, errorInfo);

    // Auto-recover from stale dynamic module/chunk load failures after a deployment
    const msg = error?.message || '';
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('error loading dynamically imported module');

    if (isChunkError) {
      try {
        const retryKey = 'ayaana_chunk_retry_' + window.location.pathname;
        const lastRetry = sessionStorage.getItem(retryKey);
        const now = Date.now();
        // Allow one auto-refresh if chunk failed within the last 15 seconds
        if (!lastRetry || now - Number(lastRetry) > 15000) {
          sessionStorage.setItem(retryKey, String(now));
          window.location.reload();
          return;
        }
      } catch {}
    }
  }

  handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FDFBF7',
            padding: '24px',
            textAlign: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: '460px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '36px 28px',
              boxShadow: '0 20px 45px rgba(226, 130, 159, 0.15)',
              border: '1px solid rgba(226, 130, 159, 0.25)'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#F9E7EC',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#C75678',
                fontSize: '24px',
                marginBottom: '16px'
              }}
            >
              ✦
            </div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#121212',
                marginBottom: '10px'
              }}
            >
              Ayaana’s Luxury Skincare
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#736C65',
                lineHeight: 1.6,
                marginBottom: '24px'
              }}
            >
              A fresh update has been deployed. Click below to load the latest high-speed version of the boutique.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#C75678',
                color: '#FFFFFF',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '9999px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(199, 86, 120, 0.35)',
                transition: 'transform 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              Refresh Boutique Store
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
