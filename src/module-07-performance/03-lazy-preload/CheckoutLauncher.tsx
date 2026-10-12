// 7.3 CheckoutLauncher. The spec is in README.md in this folder.
import { lazy, Suspense, useState, type ComponentType, type LazyExoticComponent } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export type CheckoutDialogProps = { onClose: () => void };
export type DialogModule = { default: ComponentType<CheckoutDialogProps> };

export type PreloadableComponent<P> = LazyExoticComponent<ComponentType<P>> & {
  preload: () => Promise<{ default: ComponentType<P> }>;
};

export function lazyWithPreload<P>(loader: () => Promise<{ default: ComponentType<P> }>): PreloadableComponent<P> {
  // TODO: a React.lazy component that also has a .preload() method. Both must share one download.
  const Component = lazy(loader) as PreloadableComponent<P>;
  Component.preload = loader;
  return Component;
}

export function CheckoutLauncher({ loadCheckoutDialog }: { loadCheckoutDialog: () => Promise<DialogModule> }) {
  // TODO: build it!
  return (
    <button type="button" onClick={() => {}}>
      Buy Minecoins
    </button>
  );
}
