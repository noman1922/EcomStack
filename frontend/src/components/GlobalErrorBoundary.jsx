import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '50px',
                    color: '#e11d48',
                    background: '#fff',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ marginBottom: '1rem' }}>⚠️ Application Error</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>A rendering error occurred. See details below:</p>
                    <pre style={{
                        background: '#f1f5f9',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '80%',
                        overflow: 'auto',
                        fontSize: '14px',
                        border: '1px solid #cbd5e1'
                    }}>
                        {this.state.error?.stack || this.state.error?.toString()}
                    </pre>
                    <button
                        onClick={() => {
                            localStorage.clear(); // Clear potentially corrupted state
                            window.location.href = '/';
                        }}
                        style={{
                            marginTop: '2rem',
                            padding: '12px 24px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Reset and Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
