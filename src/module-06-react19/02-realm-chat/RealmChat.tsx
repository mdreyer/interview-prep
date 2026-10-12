// 6.2 RealmChat. The spec is in README.md in this folder.
import { startTransition, useId, useOptimistic, useState, type FormEvent } from 'react';

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
}

export function RealmChat({
  currentUser,
  initialMessages,
  sendMessage,
}: {
  currentUser: string;
  initialMessages: ChatMessage[];
  sendMessage: (text: string) => Promise<ChatMessage>;
}) {
  // TODO: build it with useOptimistic!
  return <section>TODO: realm chat</section>;
}
