import React, { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  fallback: ReactNode; // The fallback UI to render on error
  children: ReactNode; // The child components wrapped by the error boundary
};

type ErrorBoundaryState = {
  hasError: boolean; // Whether an error has occurred
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state to show fallback UI on the next render
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    // Log error details to a service
    logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI if an error occurred
      return this.props.fallback;
    }

    // Render children if no error occurred
    return this.props.children;
  }
}

export default ErrorBoundary;

// Example service logger function
function logErrorToMyService(error: Error, componentStack: string): void {
  console.error("Logged Error:", error, componentStack);
}
