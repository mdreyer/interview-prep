// 6.3 ProfilePage. The spec is in README.md in this folder.
import { Component, Suspense, use, useState, type ErrorInfo, type ReactNode } from 'react';

export interface PlayerProfile {
  username: string;
  achievements: number;
}

/** Error boundaries are still class components in React 19. */
export class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  // TODO: static getDerivedStateFromError, and componentDidCatch (optional)

  render() {
    // TODO: show the fallback after an error
    return this.props.children;
  }
}

export function ProfilePage({
  username,
  fetchProfile,
}: {
  username: string;
  fetchProfile: (username: string) => Promise<PlayerProfile>;
}) {
  // TODO: build it!
  return <p>TODO: profile page</p>;
}
