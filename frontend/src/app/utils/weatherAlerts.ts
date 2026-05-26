import { ActiveAlert } from "../data/activeAlerts";
import { WeatherPayload } from "../hooks/useWeather";

export function deriveWeatherAlerts(payload: WeatherPayload): ActiveAlert[] {
  const alerts: ActiveAlert[] = [];
  const precipitationNow = payload.current.precipitationProbability;
  const windNow = payload.current.windSpeed;
  const weatherCode = payload.current.weatherCode;
  const hourlyPrecipPeak = Math.max(...payload.hourly.map((point) => point.precipitation), 0);

  if (weatherCode >= 95) {
    alerts.push({
      id: "weather-thunderstorm",
      title: "Thunderstorm Alert",
      message: "Current weather indicates thunderstorm risk in your monitored area.",
      type: "danger",
    });
  }

  if (hourlyPrecipPeak >= 70 || precipitationNow >= 6) {
    alerts.push({
      id: "weather-rain-danger",
      title: "Heavy Rainfall Expected",
      message: `Rain risk is elevated (peak chance ${Math.round(hourlyPrecipPeak)}%). Prepare flood response actions.`,
      type: "danger",
    });
  } else if (hourlyPrecipPeak >= 45 || precipitationNow >= 2) {
    alerts.push({
      id: "weather-rain-warning",
      title: "Rainfall Advisory",
      message: `Moderate rainfall conditions detected (peak chance ${Math.round(hourlyPrecipPeak)}%).`,
      type: "warning",
    });
  }

  if (windNow >= 45) {
    alerts.push({
      id: "weather-wind-danger",
      title: "Strong Wind Alert",
      message: `Wind speed is high at ${Math.round(windNow)} km/h. Expect rough weather conditions.`,
      type: "danger",
    });
  } else if (windNow >= 30) {
    alerts.push({
      id: "weather-wind-warning",
      title: "Wind Advisory",
      message: `Wind speed is elevated at ${Math.round(windNow)} km/h.`,
      type: "warning",
    });
  }

  return alerts;
}
