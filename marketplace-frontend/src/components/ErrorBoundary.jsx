import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="size-12 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={22} className="text-coral" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-xl font-semibold text-onLight mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-onLight/55 mb-6">
            We hit an unexpected error. Reloading the page usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-ink text-onDark rounded-full px-6 py-2.5 text-sm font-medium hover:bg-black transition-colors"
          >
            Reload page
          </button>
        </div>
      </div>
    )
  }
}
