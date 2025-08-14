import { useEffect, useRef, useState } from "react";
import { searchPlaces } from "../services/geocoding";
import type { LocationItem } from "../types";

interface Props {
  onSelect: (loc: LocationItem) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const id = setTimeout(async () => {
      try {
        const res = await searchPlaces(q);
        setResults(res);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(id); ac.abort(); };
  }, [q]);

  return (
    <div className="card" style={{ position: "relative" }}>
      <label htmlFor="search" className="subtle">Search for a location</label>
      <input
        id="search"
        className="input"
        placeholder="e.g., Johannesburg, London, Tokyo"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading && <div className="subtle" style={{ marginTop: 8 }}>Searching…</div>}
      {!!results.length && (
        <div className="card" style={{ marginTop: 8, maxHeight: 240, overflowY: "auto" }}>
          {results.map((r) => (
            <div
              key={r.id}
              className="row clickable"
              onClick={() => { onSelect(r); setQ(""); setResults([]); }}
              style={{ padding: "8px 0" }}
            >
              <span>{r.name}</span>
              <span className="subtle">({r.latitude.toFixed(2)}, {r.longitude.toFixed(2)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
