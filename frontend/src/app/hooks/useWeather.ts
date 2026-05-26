import { useCallback, useEffect, useState } from "react";

export type WeatherStatus = "idle" | "loading" | "success" | "error";
export type WeatherLocationSource = "fallback" | "browser" | "precise";

export type CurrentWeather = {
  temperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  observedAt: string;
};

export type HourlyPoint = {
  time: string;
  temperature: number;
  precipitation: number;
  wind: number;
};

export type DailyPoint = {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
};

export type WeatherPayload = {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
};

type LoadMode = "fallback" | "browser" | "precise";

const FALLBACK_COORDS = { latitude: 8.4822, longitude: 124.6472, name: "Kauswagan, Cagayan de Oro City" };

async function fetchLocationName(latitude: number, longitude: number): Promise<string | null> {
  try {
    const reverseUrl =
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}` +
      "&count=1&language=en&format=json";
    const reverseResponse = await fetch(reverseUrl);
    if (!reverseResponse.ok) return null;
    const reverseJson = await reverseResponse.json();
    const first = Array.isArray(reverseJson.results) ? reverseJson.results[0] : null;
    if (!first) return null;
    const city = String(first.city ?? first.town ?? first.village ?? first.municipality ?? first.name ?? "").trim();
    return city || null;
  } catch {
    return null;
  }
}

async function fetchWeather(latitude: number, longitude: number): Promise<WeatherPayload> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code" +
    "&hourly=temperature_2m,precipitation_probability,wind_speed_10m,weather_code" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Weather service unavailable");
  }

  const json = await response.json();
  if (!json.current || !json.hourly || !json.daily) {
    throw new Error("Incomplete weather data");
  }

  const currentTime = String(json.current.time);
  const hourlyTimes: string[] = json.hourly.time ?? [];
  const startIndex = Math.max(hourlyTimes.findIndex((entry) => entry >= currentTime), 0);
  const endIndex = Math.min(startIndex + 12, hourlyTimes.length);

  const hourly: HourlyPoint[] = [];
  for (let i = startIndex; i < endIndex; i += 1) {
    hourly.push({
      time: hourlyTimes[i],
      temperature: Number(json.hourly.temperature_2m?.[i] ?? 0),
      precipitation: Number(json.hourly.precipitation_probability?.[i] ?? 0),
      wind: Number(json.hourly.wind_speed_10m?.[i] ?? 0),
    });
  }

  const daily: DailyPoint[] = [];
  const dailyTimes: string[] = json.daily.time ?? [];
  for (let i = 0; i < Math.min(7, dailyTimes.length); i += 1) {
    daily.push({
      date: dailyTimes[i],
      weatherCode: Number(json.daily.weather_code?.[i] ?? 0),
      max: Number(json.daily.temperature_2m_max?.[i] ?? 0),
      min: Number(json.daily.temperature_2m_min?.[i] ?? 0),
    });
  }

  return {
    current: {
      temperature: Number(json.current.temperature_2m ?? 0),
      humidity: Number(json.current.relative_humidity_2m ?? 0),
      precipitation: Number(json.current.precipitation ?? 0),
      precipitationProbability: Number(json.hourly.precipitation_probability?.[startIndex] ?? 0),
      windSpeed: Number(json.current.wind_speed_10m ?? 0),
      weatherCode: Number(json.current.weather_code ?? 0),
      observedAt: currentTime,
    },
    hourly,
    daily,
  };
}

export function useWeather() {
  const [status, setStatus] = useState<WeatherStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [locationName, setLocationName] = useState(FALLBACK_COORDS.name);
  const [payload, setPayload] = useState<WeatherPayload | null>(null);
  const [locationSource, setLocationSource] = useState<WeatherLocationSource>("fallback");

  const loadByCoords = useCallback(async (
    latitude: number,
    longitude: number,
    fallbackLabel?: string,
    mode: LoadMode = "fallback",
  ) => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const [weather, place] = await Promise.all([
        fetchWeather(latitude, longitude),
        fetchLocationName(latitude, longitude),
      ]);
      const fallbackLocationLabel =
        mode === "fallback" ? FALLBACK_COORDS.name : "Location unavailable";

      setPayload(weather);
      setLocationName(place || fallbackLabel || fallbackLocationLabel);
      setLocationSource(mode);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to fetch weather");
    }
  }, []);

  const loadWeather = useCallback(async () => {
    if (!navigator.geolocation) {
      await loadByCoords(
        FALLBACK_COORDS.latitude,
        FALLBACK_COORDS.longitude,
        FALLBACK_COORDS.name,
        "fallback",
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await loadByCoords(
          position.coords.latitude,
          position.coords.longitude,
          undefined,
          "browser",
        );
      },
      async () => {
        await loadByCoords(
          FALLBACK_COORDS.latitude,
          FALLBACK_COORDS.longitude,
          FALLBACK_COORDS.name,
          "fallback",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 120000 },
    );
  }, [loadByCoords]);

  const usePreciseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await loadByCoords(
          position.coords.latitude,
          position.coords.longitude,
          undefined,
          "precise",
        );
      },
      async () => {
        setErrorMessage("Precise location denied. Keeping current weather data.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [loadByCoords]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadWeather();
    }, 300000);

    return () => window.clearInterval(intervalId);
  }, [loadWeather]);

  return {
    status,
    errorMessage,
    locationName,
    locationSource,
    payload,
    loadWeather,
    usePreciseLocation,
  };
}
