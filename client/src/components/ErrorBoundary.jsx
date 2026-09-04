import { Component } from "react";

// Error boundaries MUST be class components — React has no hook equivalent
// for componentDidCatch. This catches any unexpected crash anywhere in the
// component tree below it and shows a real message instead of a blank
// white screen (which is what happens with zero error boundaries at all).
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error in component tree:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center" }}>
          <h2>Something went wrong</h2>
          <p style={{ color: "var(--text-muted)" }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
