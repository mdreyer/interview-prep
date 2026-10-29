import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BundlePicker, MAX_QUANTITY } from './BundlePicker';
import { BUNDLES } from './bundles.fixture';

function setup() {
  const onPurchase = vi.fn();
  const user = userEvent.setup();
  render(<BundlePicker bundles={BUNDLES} onPurchase={onPurchase} />);
  return { user, onPurchase };
}

describe('1.1 BundlePicker', () => {
  it('renders a labelled group with one radio per bundle, named by bundle name', () => {
    setup();
    const group = screen.getByRole('group', { name: 'Choose a Minecoin bundle' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(BUNDLES.length);
    for (const bundle of BUNDLES) {
      expect(screen.getByRole('radio', { name: bundle.name })).toBeInTheDocument();
    }
  });

  it('shows formatted per-bundle coins, bonus info, and price', () => {
    setup();
    expect(screen.getByText('1,020 Minecoins')).toBeInTheDocument();
    expect(screen.getByText('3,500 Minecoins')).toBeInTheDocument();
    expect(screen.getByText('Includes 20 bonus coins')).toBeInTheDocument();
    expect(screen.getAllByText(/^Includes \d+ bonus coins$/)).toHaveLength(3);
    expect(screen.getByText('$5.99')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
  });

  it('starts with nothing selected, a prompt, and a disabled Buy button', () => {
    setup();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).not.toBeChecked();
    }
    expect(screen.getByText('Select a bundle to see your total.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy now' })).toBeDisabled();
  });

  it('shows the total and price for the selected bundle', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Explorer Pack' }));
    expect(screen.getByRole('radio', { name: 'Explorer Pack' })).toBeChecked();
    expect(screen.queryByText('Select a bundle to see your total.')).not.toBeInTheDocument();
    expect(screen.getByText('Total: 1,020 Minecoins')).toBeInTheDocument();
    expect(screen.getByText('Price: $5.99')).toBeInTheDocument();
  });

  it('multiplies by quantity using integer-cent math', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Explorer Pack' }));
    const increase = screen.getByRole('button', { name: 'Increase quantity' });
    await user.click(increase);
    await user.click(increase);
    expect(screen.getByText('Quantity: 3')).toBeInTheDocument();
    expect(screen.getByText('Total: 3,060 Minecoins')).toBeInTheDocument();
    expect(screen.getByText('Price: $17.97')).toBeInTheDocument();
  });

  it('clamps quantity between 1 and MAX_QUANTITY and disables the stepper at the edges', async () => {
    const { user } = setup();
    const decrease = screen.getByRole('button', { name: 'Decrease quantity' });
    const increase = screen.getByRole('button', { name: 'Increase quantity' });
    expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
    expect(decrease).toBeDisabled();
    for (let i = 0; i < MAX_QUANTITY + 3; i++) {
      await user.click(increase);
    }
    expect(screen.getByText(`Quantity: ${MAX_QUANTITY}`)).toBeInTheDocument();
    expect(increase).toBeDisabled();
    expect(decrease).toBeEnabled();
  });

  it('keeps the quantity when switching bundles', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Starter Stack' }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    await user.click(screen.getByRole('radio', { name: 'Legendary Hoard' }));
    expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
    expect(screen.getByText('Total: 7,000 Minecoins')).toBeInTheDocument();
    expect(screen.getByText('Price: $39.98')).toBeInTheDocument();
  });

  it('calls onPurchase with the bundle id and quantity', async () => {
    const { user, onPurchase } = setup();
    await user.click(screen.getByRole('radio', { name: 'Adventurer Chest' }));
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));
    const buy = screen.getByRole('button', { name: 'Buy now' });
    expect(buy).toBeEnabled();
    await user.click(buy);
    expect(onPurchase).toHaveBeenCalledTimes(1);
    expect(onPurchase).toHaveBeenCalledWith({ bundleId: 'adventurer', quantity: 2 });
  });
});
