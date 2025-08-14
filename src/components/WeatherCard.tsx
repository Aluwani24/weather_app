import type { DailyPoint, HourlyPoint, Units, WeatherBundle } from "../types";

interface Props {
    name: string;
    bundle?: WeatherBundle;
    units: Units;
    view: "hourly" | "daily";
    onSave?: () => void;
    isSaved?: boolean;
}

export default function WeatherCard({ name, bundle, units, view, onSave, isSaved }: Props) {
    const unitTemp = units === "imperial" ? "°F" : "°C";
    const unitWind = units === "imperial" ? "mph" : "km/h";

    return (
        <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                    <h2 style={{ margin: "0 0 4px" }}>{name}</h2>
                    <div className="subtle">Last updated {bundle ? new Date(bundle.updatedAt).toLocaleTimeString() : "—"}</div>
                </div>
                {onSave && (
                    <button className="button" onClick={onSave}>
                        {isSaved ? "★ Saved" : "☆ Save"}
                    </button>
                )}
            </div>

            {!bundle ? (
                <div style={{ marginTop: 16 }}>Loading weather…</div>
            ) : (
                <>
                    <div className="grid cols-3" style={{ marginTop: 16 }}>
                        <div className="card">
                            <div className="subtle">Temperature</div>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{bundle.current.temperature} {unitTemp}</div>
                        </div>
                        <div className="card">
                            <div className="subtle">Humidity</div>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{bundle.current.humidity}%</div>
                        </div>
                        <div className="card">
                            <div className="subtle">Wind</div>
                            <div style={{ fontSize: 28, fontWeight: 700 }}>{bundle.current.windSpeed} {unitWind}</div>
                        </div>
                    </div>

                    <hr className="hr" />

                    {view === "hourly" ? (
                        <HourlyList items={bundle.hourly} unitTemp={unitTemp} unitWind={unitWind} />
                    ) : (
                        <DailyList items={bundle.daily} unitTemp={unitTemp} />
                    )}
                </>
            )}
        </div>
    );
}

function HourlyList({ items, unitTemp, unitWind }: { items: HourlyPoint[]; unitTemp: string; unitWind: string; }) {
    return (
        <div>
            <h3 style={{ marginTop: 0 }}>Next 24 hours</h3>
            <div className="grid cols-4">
                {items.slice(0, 24).map((h) => (
                    <div key={h.time} className="card">
                        <div className="subtle">{new Date(h.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        <div><b>Temp:</b> {h.temperature} {unitTemp}</div>
                        <div><b>Humidity:</b> {h.humidity}%</div>
                        <div><b>Wind:</b> {h.windSpeed} {unitWind}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DailyList({ items, unitTemp }: { items: DailyPoint[]; unitTemp: string; }) {
    return (
        <div>
            <h3 style={{ marginTop: 0 }}>7-day outlook</h3>
            <div className="grid cols-4">
                {items.map((d) => (
                    <div key={d.date} className="card">
                        <div className="subtle">{new Date(d.date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
                        <div><b>Max:</b> {d.tMax} {unitTemp}</div>
                        <div><b>Min:</b> {d.tMin} {unitTemp}</div>
                        <div><b>Precip:</b> {d.precipitation} mm</div>
                        <div><b>UV:</b> {d.uvIndex}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
