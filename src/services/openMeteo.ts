import type { DailyPoint, HourlyPoint, Units, WeatherBundle } from "../types";

function unitParams(units: Units) {
    return {
        temperature_unit: units === "imperial" ? "fahrenheit" : "celsius",
        wind_speed_unit: units === "imperial" ? "mph" : "kmh"
    };
}

export async function fetchWeather(lat: number, lon: number, units: Units, timezone: string = "auto"): Promise<WeatherBundle> {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("timezone", timezone);

    const { temperature_unit, wind_speed_unit } = unitParams(units);

    url.searchParams.set("current", "temperature_2m,relative_humidity_2m,wind_speed_10m");
    url.searchParams.set("hourly", "temperature_2m,relative_humidity_2m,wind_speed_10m");
    url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum");
    url.searchParams.set("temperature_unit", temperature_unit);
    url.searchParams.set("wind_speed_unit", wind_speed_unit);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch weather");
    const data = await res.json();

    const current = {
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m
    };

    const hourly: HourlyPoint[] = (data.hourly.time as string[]).map((t: string, i: number) => ({
        time: t,
        temperature: data.hourly.temperature_2m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        windSpeed: data.hourly.wind_speed_10m[i]
    }));

    const daily: DailyPoint[] = (data.daily.time as string[]).map((d: string, i: number) => ({
        date: d,
        tMax: data.daily.temperature_2m_max[i],
        tMin: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
        uvIndex: data.daily.uv_index_max[i]
    }));

    return {
        current,
        hourly,
        daily,
        updatedAt: Date.now()
    };
}

export interface AlertItem {
    event: string;
    severity?: string;
    onset?: string;
    expires?: string;
    headline?: string;
}

export async function fetchAlerts(lat: number, lon: number, timezone: string = "auto"): Promise<AlertItem[]> {
    const url = new URL("https://api.open-meteo.com/v1/warnings");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("timezone", timezone);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();
    const alerts = (data.alerts || []) as AlertItem[];
    return alerts.map((a) => ({
        event: a.event,
        severity: a.severity,
        onset: a.onset,
        expires: a.expires,
        headline: a.headline
    }));
}

/* Simple freshness policy: 10 min */
export function isFresh(ts?: number, maxAgeMs = 10 * 60 * 1000) {
    return ts ? Date.now() - ts < maxAgeMs : false;
}
