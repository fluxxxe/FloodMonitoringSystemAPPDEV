import { HealthStatus } from "../hooks/useHealth";
import "../styles/components/SystemStatusBanner.css";

interface SystemStatusBannerProps {
  health: HealthStatus | null;
  apiError: string | null;
}

function formatTime(iso: string | null): string {
  if (!iso) return "never";
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export function SystemStatusBanner({ health, apiError }: SystemStatusBannerProps) {
  if (apiError) {
    return (
      <div className="system-banner system-banner--error" role="status">
        <strong>API offline</strong> — {apiError}. Start the FastAPI backend on port 8001.
      </div>
    );
  }

  if (!health) return null;

  if (health.iotStale && health.iotReadingCount > 0) {
    return (
      <div className="system-banner system-banner--warn" role="status">
        <strong>IoT sensor stale</strong> — last reading from {health.latestIotLocation ?? "device"} at{" "}
        {formatTime(health.latestIotAt)}. Check Arduino USB and the serial forwarder.
      </div>
    );
  }

  if (health.iotReadingCount === 0) {
    return (
      <div className="system-banner system-banner--info" role="status">
        <strong>No IoT data yet</strong> — run <code>arduino_serial_forwarder.py</code> with your Arduino plugged in.
      </div>
    );
  }

  return (
    <div className="system-banner system-banner--ok" role="status">
      <strong>System online</strong> — {health.stationCount} stations · {health.alertCount} alerts · IoT live from{" "}
      {health.latestIotLocation} ({formatTime(health.latestIotAt)})
    </div>
  );
}
