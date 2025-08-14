import type { LocationItem } from "../types";

export async function searchPlaces(query: string, count = 8, language = "en"): Promise<LocationItem[]> {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", String(count));
    url.searchParams.set("language", language);
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to search locations");
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.results || []) as any[];

    return results.map((r) => ({
        id: `${r.latitude},${r.longitude}`,
        name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country_code : ""}`,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country_code
    }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<LocationItem | null> {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
    url.searchParams.set("latitude", String(lat));
    url.searchParams.set("longitude", String(lon));
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    const r = data.results?.[0];
    if (!r) return null;

    return {
        id: `${r.latitude},${r.longitude}`,
        name: `${r.name}${r.admin1 ? ", " + r.admin1 : ""}${r.country ? ", " + r.country_code : ""}`,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country_code
    };
}
