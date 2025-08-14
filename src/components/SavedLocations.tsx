import type { LocationItem } from "../types";

interface Props {
  items: LocationItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function SavedLocations({ items, activeId, onSelect, onRemove }: Props) {
  if (!items.length) return null;
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Saved locations</h3>
      </div>
      <div className="grid cols-3" style={{ marginTop: 12 }}>
        {items.map((loc) => (
          <div key={loc.id} className="card" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="clickable" onClick={() => onSelect(loc.id)}>
                  {loc.name}
                </div>
                <div className="subtle">
                  {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                </div>
              </div>
              <div className="row">
                {activeId === loc.id && <span className="badge">Active</span>}
                <button className="button ghost" onClick={() => onRemove(loc.id)} title="Remove">✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
