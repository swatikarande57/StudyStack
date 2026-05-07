import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-red-500 p-8 font-mono select-text" style={{ userSelect: 'text' }}>
          <h1 className="text-3xl font-bold mb-4">React Application Crash Analyzer</h1>
          <p className="text-white mb-4">Please copy the text below and send it to Antigravity so I can fix it immediately:</p>
          <div className="bg-black/50 p-6 rounded-xl border border-red-500/30 overflow-auto">
            <h2 className="text-xl font-bold text-red-400 mb-2">{this.state.error && this.state.error.toString()}</h2>
            <pre className="text-sm text-gray-300">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-sans"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
