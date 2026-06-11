import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

function ErrorFallback({ error, onReset }) {
  return (
    <div className={styles.page}>
      <div className={styles.icon}>⚠</div>

      <h1 className={styles.title}>Something went wrong</h1>

      <p className={styles.subtitle}>
        An unexpected error occurred. You can try again or return to the home
        page.
      </p>

      {error?.message && <pre className={styles.errorBox}>{error.message}</pre>}

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={onReset}>
          Try again
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => (window.location.href = "/")}
        >
          Go home
        </button>
      </div>
    </div>
  );
}

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
