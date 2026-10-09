import { useState } from "react";
import type { SavedView } from "../types";

type Props = {
  views: SavedView[];
  onSave: (name: string) => void;
  onLoad: (view: SavedView) => void;
  onDelete: (name: string) => void;
};

export function SavedViews({ views, onSave, onLoad, onDelete }: Props) {
  const [name, setName] = useState("");

  return (
    <div className="saved-views">
      <input
        value={name}
        placeholder="Save current view…"
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && name.trim()) {
            onSave(name.trim());
            setName("");
          }
        }}
      />
      <button
        type="button"
        className="primary"
        onClick={() => {
          if (!name.trim()) return;
          onSave(name.trim());
          setName("");
        }}
      >
        Save
      </button>
      {views.map((view) => (
        <span key={view.name} className="chip">
          <button type="button" className="link" onClick={() => onLoad(view)}>
            {view.name}
          </button>
          <button type="button" className="tiny" onClick={() => onDelete(view.name)} aria-label={`Delete ${view.name}`}>
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
