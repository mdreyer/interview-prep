import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { normalizeCode, RedeemCodeForm, type RedeemResult } from './RedeemCodeForm';

const TYPED = 'abcde-12345 fghij-67890-klmno';
const NORMALIZED = 'ABCDE12345FGHIJ67890KLMNO';

function setup(
  redeemCode: (code: string) => Promise<RedeemResult> = vi.fn(async (): Promise<RedeemResult> => ({ ok: true, itemName: 'Creeper Hoodie' })),
) {
  const user = userEvent.setup();
  render(<RedeemCodeForm redeemCode={redeemCode} />);
  return {
    user,
    redeemCode,
    input: () => screen.getByRole('textbox', { name: 'Code' }),
    button: () => screen.getByRole('button', { name: /redeem/i }),
  };
}

describe('6.1 RedeemCodeForm (useActionState + useFormStatus)', () => {
  it('normalizeCode strips spaces and dashes and uppercases', () => {
    expect(normalizeCode(`  ${TYPED} `)).toBe(NORMALIZED);
  });

  it('is a real form field: the input has name="code" (the action reads it from FormData)', () => {
    const { input } = setup();
    expect(input()).toHaveAttribute('name', 'code');
  });

  it('sends the normalized code, and shows "Redeeming…" on a disabled button while pending', async () => {
    const pending = deferred<RedeemResult>();
    const { user, input, button, redeemCode } = setup(vi.fn(() => pending.promise));
    await user.type(input(), TYPED);
    await user.click(button());

    expect(await screen.findByRole('button', { name: 'Redeeming…' })).toBeDisabled();
    expect(redeemCode).toHaveBeenCalledTimes(1);
    expect(redeemCode).toHaveBeenCalledWith(NORMALIZED);

    await act(async () => pending.resolve({ ok: true, itemName: 'Creeper Hoodie' }));
    expect(await screen.findByRole('button', { name: 'Redeem' })).toBeEnabled();
  });

  it('on success: announces the item and clears the field', async () => {
    const { user, input, button } = setup();
    await user.type(input(), TYPED);
    await user.click(button());
    expect(await screen.findByText('Redeemed: Creeper Hoodie!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Redeemed: Creeper Hoodie!');
    expect(input()).toHaveValue('');
  });

  it("rejects a badly formatted code without calling the API, and keeps what the player typed", async () => {
    const { user, input, button, redeemCode } = setup();
    await user.type(input(), 'ABCDE-12345');
    await user.click(button());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Codes are 25 letters and numbers, like XXXXX-XXXXX-XXXXX-XXXXX-XXXXX.',
    );
    expect(redeemCode).not.toHaveBeenCalled();
    expect(input()).toHaveValue('ABCDE-12345');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Codes are 25 letters and numbers, like XXXXX-XXXXX-XXXXX-XXXXX-XXXXX.');
  });

  it('maps each failure reason to its message, keeping the typed code', async () => {
    const cases: [RedeemResult, string][] = [
      [{ ok: false, reason: 'already-redeemed' }, 'This code has already been redeemed.'],
      [{ ok: false, reason: 'not-found' }, "We couldn't find that code. Check it and try again."],
      [{ ok: false, reason: 'expired' }, 'This code has expired.'],
    ];
    for (const [result, message] of cases) {
      const { user, input, button } = setup(vi.fn(async () => result));
      await user.type(input(), TYPED);
      await user.click(button());
      expect(await screen.findByRole('alert')).toHaveTextContent(message);
      expect(input()).toHaveValue(TYPED);
      cleanup();
    }
  });

  it("a thrown error shows the generic message (never the raw error)", async () => {
    const { user, input, button } = setup(
      vi.fn(async (): Promise<RedeemResult> => {
        throw new Error('ECONNRESET at RedeemService.cs:142');
      }),
    );
    await user.type(input(), TYPED);
    await user.click(button());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Something went wrong. Try again.');
    expect(alert.textContent).not.toMatch(/ECONNRESET/);
  });

  it('pressing Enter submits, and a later success clears the earlier error', async () => {
    const redeemCode = vi
      .fn<(code: string) => Promise<RedeemResult>>()
      .mockResolvedValueOnce({ ok: false, reason: 'not-found' })
      .mockResolvedValueOnce({ ok: true, itemName: 'Enderman Mask' });
    const { user, input } = setup(redeemCode);
    await user.type(input(), `${TYPED}{Enter}`);
    await screen.findByRole('alert');

    await user.type(input(), '{Enter}');
    expect(await screen.findByText('Redeemed: Enderman Mask!')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(redeemCode).toHaveBeenCalledTimes(2);
  });
});
