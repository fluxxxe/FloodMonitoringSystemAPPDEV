import { useEffect, useMemo, useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { ActiveAlert } from "../data/activeAlerts";
import { deriveWeatherAlerts } from "../utils/weatherAlerts";
import "../styles/components/WeatherPanel.css";

type MetricType = "temperature" | "precipitation" | "wind";

function getWeatherLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code >= 1 && code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorm";
  return "Variable";
}

function getWeatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code >= 1 && code <= 3) return "⛅";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

function formatHour(value: string): string {
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: "numeric" });
}

function formatDay(value: string): string {
  const date = new Date(value);
  return date.toLocaleDateString([], { weekday: "short" });
}

interface WeatherPanelProps {
  onOpenAlerts: () => void;
  onWeatherAlertsChange: (alerts: ActiveAlert[]) => void;
}

export function WeatherPanel({ onOpenAlerts, onWeatherAlertsChange }: WeatherPanelProps) {
  const {
    status,
    errorMessage,
    locationName,
    locationSource,
    payload,
    loadWeather,
    usePreciseLocation,
  } = useWeather();
  const [metric, setMetric] = useState<MetricType>("temperature");
  const weatherLinkedAlerts = useMemo(() => (payload ? deriveWeatherAlerts(payload) : []), [payload]);

  const sourceLabel =
    locationSource === "precise"
      ? "Using precise device location"
      : locationSource === "browser"
        ? "Using current browser location"
        : "Using fallback monitored area";

  useEffect(() => {
    onWeatherAlertsChange(weatherLinkedAlerts);
  }, [onWeatherAlertsChange, weatherLinkedAlerts]);

  const chartSeries = useMemo(() => {
    if (!payload) return [];
    return payload.hourly.map((point) => {
      if (metric === "temperature") return point.temperature;
      if (metric === "precipitation") return point.precipitation;
      return point.wind;
    });
  }, [metric, payload]);

  const chartPath = useMemo(() => {
    if (chartSeries.length === 0) return "";
    const max = Math.max(...chartSeries);
    const min = Math.min(...chartSeries);
    const range = Math.max(max - min, 1);
    return chartSeries
      .map((value, index) => {
        const x = (index / Math.max(chartSeries.length - 1, 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [chartSeries]);

  const metricUnit = metric === "temperature" ? "C" : metric === "precipitation" ? "%" : "km/h";

  return (
    <section className="weather-panel weather-panel--rich" aria-live="polite">
      <header className="weather-panel__header">
        <div>
          <p className="weather-panel__result-label">Results for</p>
          <h3 className="weather-panel__title">{locationName}</h3>
          <p className="weather-panel__source">{sourceLabel}</p>
        </div>
        <div className="weather-panel__header-actions">
          <button type="button" className="weather-panel__action" onClick={usePreciseLocation}>
            Use precise location
          </button>
          <button type="button" className="weather-panel__action" onClick={loadWeather}>
            Refresh
          </button>
        </div>
      </header>

      {status === "loading" && <p className="weather-panel__state">Loading weather data...</p>}

      {status === "error" && (
        <p className="weather-panel__state weather-panel__state--error">
          {errorMessage}. Showing fallback monitored area weather when available.
        </p>
      )}

      {payload && (
        <>
          <section className="weather-panel__top">
            <div className="weather-panel__current">
              <p className="weather-panel__current-icon">{getWeatherIcon(payload.current.weatherCode)}</p>
              <p className="weather-panel__temperature">{Math.round(payload.current.temperature)}C</p>
              <ul className="weather-panel__quick-stats">
                <li>Precipitation: {Math.round(payload.current.precipitationProbability)}%</li>
                <li>Humidity: {Math.round(payload.current.humidity)}%</li>
                <li>Wind: {Math.round(payload.current.windSpeed)} km/h</li>
              </ul>
            </div>
            <div className="weather-panel__summary">
              <p className="weather-panel__summary-title">Weather</p>
              <p className="weather-panel__summary-time">
                {new Date(payload.current.observedAt).toLocaleString([], {
                  weekday: "long",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="weather-panel__summary-condition">
                {getWeatherLabel(payload.current.weatherCode)}
              </p>
            </div>
          </section>

          <nav className="weather-panel__tabs" aria-label="Weather metrics">
            <button
              type="button"
              className={metric === "temperature" ? "active" : ""}
              onClick={() => setMetric("temperature")}
            >
              Temperature
            </button>
            <button
              type="button"
              className={metric === "precipitation" ? "active" : ""}
              onClick={() => setMetric("precipitation")}
            >
              Precipitation
            </button>
            <button
              type="button"
              className={metric === "wind" ? "active" : ""}
              onClick={() => setMetric("wind")}
            >
              Wind
            </button>
          </nav>

          <section className="weather-panel__chart-wrap">
            <svg viewBox="0 0 100 100" className="weather-panel__chart" preserveAspectRatio="none">
              <path d={chartPath} />
            </svg>
            <ul className="weather-panel__chart-values">
              {chartSeries.map((value, index) => (
                <li key={`${payload.hourly[index]?.time}-${metric}`}>
                  <strong>{Math.round(value)}</strong>
                  <span>{metricUnit}</span>
                </li>
              ))}
            </ul>
            <ul className="weather-panel__chart-time">
              {payload.hourly.map((entry) => (
                <li key={entry.time}>{formatHour(entry.time)}</li>
              ))}
            </ul>
          </section>

          <ul className="weather-panel__daily">
            {payload.daily.map((day) => (
              <li key={day.date}>
                <p className="weather-panel__daily-day">{formatDay(day.date)}</p>
                <p className="weather-panel__daily-icon">{getWeatherIcon(day.weatherCode)}</p>
                <p className="weather-panel__daily-temp">
                  {Math.round(day.max)}C {Math.round(day.min)}C
                </p>
              </li>
            ))}
          </ul>

          <section className="weather-panel__linked-alerts" aria-label="Weather linked alerts">
            <div>
              <p className="weather-panel__linked-title">Weather-linked Active Alerts</p>
              <p className="weather-panel__linked-count">
                {weatherLinkedAlerts.length} alert(s) connected to current weather conditions
              </p>
            </div>
            <button type="button" className="weather-panel__action weather-panel__action--linked" onClick={onOpenAlerts}>
              Show Alerts
            </button>
          </section>
        </>
      )}
    </section>
  );
}
