"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

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
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="text-center px-10 py-12 max-w-sm w-full animate-scale-in"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="w-14 h-14 rounded-full bg-brand-rose/10 flex items-center justify-center mx-auto mb-5">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="text-brand-rose text-xl"
              />
            </div>
            <h1 className="text-white font-bold text-lg mb-2">
              Something went wrong
            </h1>
            <p className="text-white/45 text-sm mb-7 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              className="btn-ghost text-sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
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
