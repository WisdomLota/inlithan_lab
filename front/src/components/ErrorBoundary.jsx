import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#8C8D8F' }}>Please refresh the page. If this persists, contact support.</p>
          <button
            className="btn-join"
            style={{ width: 'auto', padding: '10px 24px', marginTop: 16 }}
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary