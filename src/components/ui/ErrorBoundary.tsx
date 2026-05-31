"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <span className="material-symbols-outlined text-[64px] text-error mb-4">bug_report</span>
            <h2 className="font-heading text-headline-md text-on-surface mb-2">Something went wrong</h2>
            <p className="text-body-md text-on-surface-variant mb-6 max-w-md">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-primary text-on-primary font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <Link href="/dashboard" className="border border-outline-variant text-on-surface font-bold px-6 py-3 rounded-xl hover:bg-surface-container-low transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
