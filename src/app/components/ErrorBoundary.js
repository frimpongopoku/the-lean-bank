"use client";
import React from "react";
import Icon from "./ui/Icon";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[100dvh] px-4">
          <div className="card text-center flex flex-col items-center gap-3 px-8 py-10 max-w-sm w-full">
            <span className="w-11 h-11 rounded-full bg-raised text-danger inline-flex items-center justify-center">
              <Icon name="alert" size={20} />
            </span>
            <h1 className="text-ink font-semibold text-lg m-0">Something went wrong</h1>
            <p className="text-muted text-sm m-0 mb-3">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button className="btn-ghost" onClick={() => this.setState({ hasError: false, error: null })}>
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
