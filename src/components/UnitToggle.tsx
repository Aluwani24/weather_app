import type { Units } from "../types";

interface Props {
    units: Units;
    onChange: (u: Units) => void;
}
export default function UnitToggle({ units, onChange }: Props) {
    return (
        <div className="row">
            <button
                className="button ghost"
                aria-pressed={units === "metric"}
                onClick={() => onChange("metric")}
            >°C, km/h</button>
            <button
                className="button ghost"
                aria-pressed={units === "imperial"}
                onClick={() => onChange("imperial")}
            >°F, mph</button>
        </div>
    );
}
