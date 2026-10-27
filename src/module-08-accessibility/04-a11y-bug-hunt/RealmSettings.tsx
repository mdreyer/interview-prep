// 8.4 Bug hunt: Realm settings. The spec is in README.md in this folder.
// It looks fine with a mouse and a monitor. Try it with only a keyboard, or with a screen reader, and it falls apart.
import { useState } from 'react';

export interface RealmSettingsValues {
  name: string;
  allowCheats: boolean;
}

export function RealmSettings({
  initial,
  thumbnailUrl,
  onSave,
  onClose,
}: {
  initial: RealmSettingsValues;
  thumbnailUrl: string;
  onSave: (values: RealmSettingsValues) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [allowCheats, setAllowCheats] = useState(initial.allowCheats);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  function save() {
    if (!name.trim()) {
      setError(true);
      setSaved(false);
      return;
    }
    setError(false);
    onSave({ name: name.trim(), allowCheats });
    setSaved(true);
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h1>Realm settings</h1>
        <button type="button" className="icon-button" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" />
          </svg>
        </button>
      </div>

      <img src={thumbnailUrl} className="thumbnail" />

      <h4>General</h4>
      <input
        placeholder="Realm name"
        value={name}
        tabIndex={3}
        onChange={(e) => setName(e.target.value)}
        style={{ borderColor: error ? 'red' : undefined }}
      />

      <div className={allowCheats ? 'toggle toggle-on' : 'toggle'} onClick={() => setAllowCheats(!allowCheats)}>
        Allow cheats
      </div>

      <div className="button" onClick={save}>
        Save settings
      </div>

      {saved && <div className="toast">Settings saved</div>}
    </div>
  );
}
