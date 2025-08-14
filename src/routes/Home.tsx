import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import SavedLocations from "../components/SavedLocations";
import WeatherCard from "../components/WeatherCard";
import ForecastToggle from "../components/ForecastToggle";
import UnitToggle from "../components/UnitToggle";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { fetchAlerts, fetchWeather, isFresh } from "../services/openMeteo";
import { reverseGeocode } from "../services/geocoding";
import type { LocationItem, Settings, Units, WeatherBundle } from "../types";

const WEATHER_CACHE_KEY = "weather_cache_v1";

type CacheMap = Record<string, WeatherBundle>;

export default function Home() {
    const [settings, setSettings] = useLocalStorage<Settings>("settings", {
        theme: "light",
        units: "metric",
        view: "hourly",
        notificationsEnabled: false
    });

    const [saved, setSaved] = useLocalStorage<LocationItem[]>("saved_locations", []);
    const [active, setActive] = useLocalStorage<LocationItem | null>("active_location", null);
    const [cache, setCache] = useLocalStorage<CacheMap>(WEATHER_CACHE_KEY, {});
    const [loading, setLoading] = useState(false);
    const [alertMsg, setAlertMsg] = useState<string | null>(null);

    // Apply theme to <html>
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", settings.theme);
    }, [settings.theme]);

    // Try to get current location on first load if no active location
    useEffect(() => {
        if (active) return;
        if (!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            const loc = await reverseGeocode(latitude, longitude);
            const fallback: LocationItem = loc ?? {
                id: `${latitude},${longitude}`,
                name: "Current location",
                latitude, longitude
            };
            setActive(fallback);
        }, () => {
            // Ignore denied; user can search
        }, { enableHighAccuracy: true, timeout: 8000 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch weather for active location (with cache)
    useEffect(() => {
        (async () => {
            if (!active) return;
            const key = active.id + "|" + settings.units;
            const existing = cache[key];
            if (isFresh(existing?.updatedAt)) return;

            setLoading(true);
            try {
                const bundle = await fetchWeather(active.latitude, active.longitude, settings.units);
                setCache({ ...cache, [key]: bundle });
            } catch {
                // keep cached if any
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active?.id, settings.units]);

    // Fetch alerts and fire a local notification (progressive)
    useEffect(() => {
        (async () => {
            if (!active) return;
            try {
                const alerts = await fetchAlerts(active.latitude, active.longitude);
                if (alerts.length) {
                    const first = alerts[0];
                    const title = `Weather alert: ${first.event}`;
                    const body = first.headline || `${first.severity || ""} ${first.event}`;
                    setAlertMsg(body);

                    if (settings.notificationsEnabled && "serviceWorker" in navigator) {
                        const reg = await navigator.serviceWorker.getRegistration();
                        if (reg) {
                            reg.active?.postMessage({
                                type: "SHOW_ALERT_NOTIFICATION",
                                payload: { title, body }
                            });
                        } else if ("Notification" in window) {
                            // Fallback to page-level notification
                            if (Notification.permission === "granted") {
                                new Notification(title, { body });
                            }
                        }
                    }
                } else {
                    setAlertMsg(null);
                }
            } catch {
                // Ignore alerts errors
            }
        })();
    }, [active, active?.id, settings.notificationsEnabled]);

    const activeKey = useMemo(() => active ? active.id + "|" + settings.units : "", [active, settings.units]);
    const bundle = active ? cache[activeKey] : undefined;

    function handleSelect(loc: LocationItem) {
        setActive(loc);
    }

    function handleSaveActive() {
        if (!active) return;
        if (saved.find(s => s.id === active.id)) return;
        setSaved([active, ...saved].slice(0, 12));
    }

    function handleRemoveSaved(id: string) {
        setSaved(saved.filter(s => s.id !== id));
        if (active?.id === id) setActive(null);
    }

    function setUnits(u: Units) {
        setSettings({ ...settings, units: u });
    }

    function setView(v: "hourly" | "daily") {
        setSettings({ ...settings, view: v });
    }

    return (
        <div className="container">
            <div className="header">
                <div className="row">
                    <h1 style={{ margin: 0 }}>Weather</h1>
                    <span className="badge">Fast • Offline • Saved locations</span>
                </div>
                <div className="nav">
                    <a className="button ghost clickable" href="/settings">Settings</a>
                </div>
            </div>

            <SearchBar onSelect={handleSelect} />

            <div className="grid cols-2" style={{ marginTop: 16 }}>
                <div className="card">
                    <div className="row" style={{ justifyContent: "space-between" }}>
                        <h3 style={{ margin: 0 }}>Display</h3>
                        <UnitToggle units={settings.units} onChange={setUnits} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <ForecastToggle view={settings.view} onChange={setView} />
                    </div>
                </div>

                {alertMsg && (
                    <div className="card" style={{ borderColor: "color-mix(in oklab, var(--danger) 30%, var(--hover))" }}>
                        <div className="row" style={{ justifyContent: "space-between" }}>
                            <div>
                                <div className="badge" style={{ background: "color-mix(in oklab, var(--danger) 25%, var(--hover))" }}>Alert</div>
                                <div style={{ marginTop: 8 }}>{alertMsg}</div>
                            </div>
                            <a className="button ghost" href="/settings">Notifications…</a>
                        </div>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 16 }}>
                {active ? (
                    <WeatherCard
                        name={active.name}
                        bundle={bundle}
                        units={settings.units}
                        view={settings.view}
                        onSave={handleSaveActive}
                        isSaved={!!saved.find(s => s.id === active.id)}
                    />
                ) : (
                    <div className="card">Search a location to get started, or allow location access.</div>
                )}
                {loading && <div style={{ marginTop: 8 }} className="subtle">Refreshing…</div>}
            </div>

            <div style={{ marginTop: 16 }}>
                <SavedLocations
                    items={saved}
                    activeId={active?.id}
                    onSelect={(id) => {
                        const loc = saved.find(s => s.id === id);
                        if (loc) setActive(loc);
                    }}
                    onRemove={handleRemoveSaved}
                />
            </div>

            <div className="footer">
                <div className="subtle">Data by Open‑Meteo</div>
                <div className="subtle">Built By Aluwani</div>
            </div>
        </div>
    );
}
