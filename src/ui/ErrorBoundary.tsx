import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // keep as warn for CI noise
    console.warn("ErrorBoundary caught", { error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="m-4 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-medium">Something went wrong.</p>
          <button
            autoFocus
            className="mt-2 rounded-xl bg-blue-600 px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
