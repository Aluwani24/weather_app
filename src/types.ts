export type Units = "metric" | "imperial";

export interface LocationItem {
    id: string;          // `${lat},${lon}`
    name: string;        // "Johannesburg, ZA"
    latitude: number;
    longitude: number;
    country?: string;
}

export interface CurrentWeather {
    temperature: number;
    humidity: number;
    windSpeed: number;
}

export interface HourlyPoint {
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
}

export interface DailyPoint {
    date: string;
    tMax: number;
    tMin: number;
    precipitation: number;
    uvIndex: number;
}

export interface WeatherBundle {
    current: CurrentWeather;
    hourly: HourlyPoint[];
    daily: DailyPoint[];
    updatedAt: number;
}

export interface Settings {
    theme: "light" | "dark";
    units: Units;
    view: "hourly" | "daily";
    notificationsEnabled: boolean;
}
