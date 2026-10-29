// 1.4 Bug Hunt. This component has 7 bugs. The spec is in README.md in this folder.
import { useId, useState, type FormEvent } from 'react';

export type Server = {
  id: number;
  name: string;
  address: string;
};

type ServerRowProps = {
  server: Server;
  isFirst: boolean;
  onMoveUp: () => void;
  onRemove: () => void;
};

function ServerRow({ server, isFirst, onMoveUp, onRemove }: ServerRowProps) {
  const [note, setNote] = useState('');
  const noteId = useId();

  return (
    <li>
      <strong>{server.name}</strong> <span>{server.address}</span>
      <label htmlFor={noteId}>Notes for {server.name}</label>
      <input id={noteId} value={note} onChange={(e) => setNote(e.target.value)} />
      <button type="button" aria-label={`Move ${server.name} up`} disabled={isFirst} onClick={onMoveUp}>
        ↑
      </button>
      <button type="button" aria-label={`Remove ${server.name}`} onClick={onRemove}>
        ✕
      </button>
    </li>
  );
}

export function ServerList({ initialServers }: { initialServers: Server[] }) {
  const [servers, setServers] = useState(initialServers);
  const [count] = useState(initialServers.length);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  function addServer(e: FormEvent) {
    e.preventDefault();
    servers.push({ id: servers.length + 1, name: name.trim(), address: address.trim() });
    setServers(servers);
  }

  function moveUp(index: number) {
    const next = servers;
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    setServers(next);
  }

  function remove(id: number) {
    setServers(servers.filter((s) => s.id !== id));
  }

  return (
    <section>
      <h2>Favorite servers ({count})</h2>
      <ul aria-label="Servers">
        {servers.map((server, index) => (
          <ServerRow
            key={index}
            server={server}
            isFirst={index === 0}
            onMoveUp={() => moveUp(index)}
            onRemove={() => remove(server.id)}
          />
        ))}
      </ul>

      <form onSubmit={addServer}>
        <label htmlFor="server-name">Server name</label>
        <input id="server-name" value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="server-address">Server address</label>
        <input id="server-address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <button type="submit" disabled={!name.trim() && !address.trim()}>
          Add server
        </button>
      </form>
    </section>
  );
}
