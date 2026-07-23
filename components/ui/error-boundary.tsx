"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export interface ErrorBoundaryProps {
  children?: ReactNode
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode)
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  className?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    this.setState({ hasError: false, error: null })
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback(
            this.state.error || new Error("Unknown error"),
            this.resetErrorBoundary
          )
        }
        return this.props.fallback
      }

      return (
        <div
          role="alert"
          className={`flex min-h-[120px] w-full flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-destructive ${
            this.props.className || ""
          }`}
        >
          <AlertTriangle className="mb-2 h-6 w-6" />
          <h3 className="text-sm font-semibold">Something went wrong</h3>
          <p className="mt-1 text-xs opacity-80">
            {this.state.error?.message || "An error occurred while rendering this component."}
          </p>
          <button
            type="button"
            onClick={this.resetErrorBoundary}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-destructive/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-destructive/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
