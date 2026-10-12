import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { deferred } from '../../module-02-hooks/test-utils';
import { RealmChat, type ChatMessage } from './RealmChat';

const INITIAL: ChatMessage[] = [
  { id: 'm1', author: 'Steve', text: 'Anyone up for the Nether?' },
  { id: 'm2', author: 'Alex_Builds', text: 'Give me 5 min' },
];

// React entangles every async transition that's in flight, across the whole page. A request a test leaves
// hanging would keep the *next* test's transitions pending forever, so settle any leftovers after each test.
let leftovers: ReturnType<typeof deferred<ChatMessage>>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const d of leftovers) d.reject(new Error('test over'));
  });
  leftovers = [];
});

function setup() {
  const requests: { text: string; d: ReturnType<typeof deferred<ChatMessage>> }[] = [];
  const sendMessage = vi.fn((text: string) => {
    const d = deferred<ChatMessage>();
    requests.push({ text, d });
    leftovers.push(d);
    return d.promise;
  });
  const user = userEvent.setup();
  render(<RealmChat currentUser="Alex_Builds" initialMessages={INITIAL} sendMessage={sendMessage} />);

  const items = () => within(screen.getByRole('list', { name: 'Messages' })).queryAllByRole('listitem');
  const texts = () => items().map((li) => li.textContent!.replace(/\s+/g, ' ').trim());
  const input = () => screen.getByRole('textbox', { name: 'Message' });
  const send = async (text: string) => {
    await user.type(input(), text);
    await user.click(screen.getByRole('button', { name: 'Send' }));
  };
  const succeed = (i: number, id = `server-${i}`) =>
    act(async () => {
      const { text, d } = requests[i]!;
      d.resolve({ id, author: 'Alex_Builds', text });
    });
  const fail = (i: number) =>
    act(async () => {
      requests[i]!.d.reject(new Error('503'));
    });
  return { user, sendMessage, items, texts, input, send, succeed, fail };
}

describe('6.2 RealmChat (useOptimistic)', () => {
  it('shows the existing messages', () => {
    const { texts } = setup();
    expect(texts()).toEqual(['Steve: Anyone up for the Nether?', 'Alex_Builds: Give me 5 min']);
  });

  it('shows a sent message immediately, marked "(Sending…)", and clears the input right away', async () => {
    const { send, texts, input, sendMessage } = setup();
    await send('  on my way  ');
    expect(sendMessage).toHaveBeenCalledWith('on my way');
    expect(texts()).toHaveLength(3);
    expect(texts()[2]).toBe('Alex_Builds: on my way (Sending…)');
    expect(input()).toHaveValue('');
  });

  it('replaces the optimistic message with the saved one when the server confirms', async () => {
    const { send, succeed, texts } = setup();
    await send('on my way');
    await succeed(0);
    await waitFor(() => expect(texts()[2]).toBe('Alex_Builds: on my way'));
    expect(texts()).toHaveLength(3);
  });

  it("doesn't send blank messages", async () => {
    const { send, sendMessage, texts } = setup();
    await send('   ');
    expect(sendMessage).not.toHaveBeenCalled();
    expect(texts()).toHaveLength(2);
  });

  it('keeps a failed message in the list, marked "(Not sent)", with a Retry button (and no duplicate)', async () => {
    const { send, fail, texts } = setup();
    await send('bring torches');
    await fail(0);
    await waitFor(() => expect(texts()[2]).toBe('Alex_Builds: bring torches (Not sent) Retry'));
    expect(texts()).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Retry sending "bring torches"' })).toBeInTheDocument();
  });

  it('Retry sends the same text again, optimistically, and succeeds', async () => {
    const { user, send, fail, succeed, texts, sendMessage } = setup();
    await send('bring torches');
    await fail(0);
    await user.click(await screen.findByRole('button', { name: 'Retry sending "bring torches"' }));

    expect(sendMessage).toHaveBeenCalledTimes(2);
    expect(sendMessage).toHaveBeenLastCalledWith('bring torches');
    expect(texts()).toHaveLength(3);
    expect(texts()[2]).toBe('Alex_Builds: bring torches (Sending…)');

    await succeed(1);
    await waitFor(() => expect(texts()[2]).toBe('Alex_Builds: bring torches'));
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
  });

  it('shows several messages in flight at once, and confirms them all', async () => {
    const { send, succeed, texts } = setup();
    await send('one');
    await send('two');
    expect(texts().slice(2)).toEqual(['Alex_Builds: one (Sending…)', 'Alex_Builds: two (Sending…)']);
    await succeed(0);
    await succeed(1);
    await waitFor(() => expect(texts().slice(2)).toEqual(['Alex_Builds: one', 'Alex_Builds: two']));
  });

  it("doesn't wipe what the player is typing when an earlier message finishes sending", async () => {
    const { user, send, succeed, input, texts } = setup();
    await send('first');
    await user.type(input(), 'half a thou');
    await succeed(0);
    await waitFor(() => expect(texts()[2]).toBe('Alex_Builds: first'));
    expect(input()).toHaveValue('half a thou');
  });
});
