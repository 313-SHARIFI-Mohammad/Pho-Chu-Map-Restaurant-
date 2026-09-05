import { Component } from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 text-center">
          <p className="font-elegant text-7xl font-bold text-brand-500 text-glow">
            Oops!
          </p>
          <h1 className="mt-4 font-elegant text-3xl font-bold text-white md:text-4xl">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md font-body text-white/60">
            An unexpected error occurred while rendering this page. Please try
            refreshing, or head back to the homepage.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-400"
            >
              Reload Page
            </button>
            <Link
              to="/"
              className="rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}