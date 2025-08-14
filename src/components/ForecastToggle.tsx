interface Props {
    view: "hourly" | "daily";
    onChange: (v: "hourly" | "daily") => void;
}
export default function ForecastToggle({ view, onChange }: Props) {
    return (
        <div className="row">
            <button
                className="button secondary"
                aria-pressed={view === "hourly"}
                onClick={() => onChange("hourly")}
            >Hourly</button>
            <button
                className="button secondary"
                aria-pressed={view === "daily"}
                onClick={() => onChange("daily")}
            >Daily</button>
        </div>
    );
}
