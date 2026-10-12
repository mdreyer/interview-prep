// Given for 7.3 (you wrote one yourself in 6.3). You don't need to edit this file.
import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
