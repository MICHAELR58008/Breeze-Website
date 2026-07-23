import React, { Component, ReactNode, ErrorInfo } from "react"
import { AlertCircle } from "lucide-react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("TinaCMS Custom Component Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col gap-2 p-4 my-2 border border-red-500/50 bg-red-500/10 rounded-md text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
              <AlertCircle className="size-5" />
              <span>Error loading field</span>
            </div>
            <div className="text-xs font-mono opacity-80 break-words">
              {this.state.error?.message || "An unexpected error occurred."}
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
