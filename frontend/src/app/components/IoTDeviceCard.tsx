/**
 * IoT Device Card – shows the latest Arduino sensor reading.
 * Designed for the Dashboard; auto-refreshes via the useIoTLatest hook.
 */

import { IoTReading } from "../hooks/useIoTLatest";
import "../styles/components/IoTDeviceCard.css";

interface IoTDeviceCardProps {
  reading: IoTReading | null;
  loading: boolean;
  lastRefreshed: Date | null;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

function trendArrow(trend: string): { symbol: string; className: string } {
  const normalized = trend.toLowerCase();
  if (normalized === "rising") return { symbol: "↑", className: "iot-card__trend-arrow--rising" };
  if (normalized === "falling") return { symbol: "↓", className: "iot-card__trend-arrow--falling" };
  return { symbol: "→", className: "iot-card__trend-arrow--steady" };
}

function statusVariant(status: string): "normal" | "warning" | "danger" {
  const s = status.toLowerCase();
  if (s === "danger") return "danger";
  if (s === "warning") return "warning";
  return "normal";
}

export function IoTDeviceCard({ reading, loading, lastRefreshed }: IoTDeviceCardProps) {
  /* ── Skeleton / waiting state ──────────────────────────────────────── */
  if (loading && !reading) {
    return (
      <div className="iot-card iot-card--skeleton">
        <div className="iot-card__header">
          <div className="iot-card__header-left">
            <div className="iot-card__device-icon" style={{ opacity: 0.4 }}>⏳</div>
            <div>
              <div className="iot-card__skeleton-bar" style={{ width: 140, height: 14, marginBottom: 6 }} />
              <div className="iot-card__skeleton-bar" style={{ width: 90, height: 10 }} />
            </div>
          </div>
        </div>
        <div className="iot-card__metrics">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="iot-card__metric">
              <div className="iot-card__skeleton-bar" style={{ width: 60, height: 9, marginBottom: 8 }} />
              <div className="iot-card__skeleton-bar" style={{ width: 80, height: 18 }} />
            </div>
          ))}
        </div>
        <div className="iot-card__empty-message">Connecting to Arduino device…</div>
      </div>
    );
  }

  /* ── No reading yet ────────────────────────────────────────────────── */
  if (!reading) {
    return (
      <div className="iot-card iot-card--skeleton">
        <div className="iot-card__empty-message">
          <div className="iot-card__empty-icon">📡</div>
          Waiting for Arduino device data…
          <br />
          <span style={{ fontSize: "0.75rem" }}>
            The card will update automatically once the sensor pushes a reading.
          </span>
        </div>
      </div>
    );
  }

  /* ── Live card ─────────────────────────────────────────────────────── */
  const variant = statusVariant(reading.status);
  const trend = trendArrow(reading.trend);
  const level = parseFloat(reading.currentLevel);

  return (
    <div className={`iot-card iot-card--${variant}`}>
      {/* Header */}
      <div className="iot-card__header">
        <div className="iot-card__header-left">
          <div className="iot-card__device-icon" aria-hidden="true">🔌</div>
          <div>
            <h3 className="iot-card__title">{reading.locationName}</h3>
            <p className="iot-card__subtitle">Arduino IoT Sensor</p>
          </div>
        </div>
        <div className="iot-card__live-badge">
          <span className="iot-card__live-dot" />
          Live
        </div>
      </div>

      {/* Metrics grid */}
      <div className="iot-card__metrics">
        <div className="iot-card__metric">
          <span className="iot-card__metric-label">Water Level</span>
          <span className="iot-card__metric-value iot-card__metric-value--level">
            {isNaN(level) ? reading.currentLevel : `${level.toFixed(1)} m`}
          </span>
        </div>

        <div className="iot-card__metric">
          <span className="iot-card__metric-label">Status</span>
          <span className={`iot-card__status-badge iot-card__status-badge--${variant}`}>
            {reading.status}
          </span>
        </div>

        <div className="iot-card__metric">
          <span className="iot-card__metric-label">Trend</span>
          <span className="iot-card__trend">
            <span className={`iot-card__trend-arrow ${trend.className}`}>{trend.symbol}</span>
            {reading.trend}
          </span>
        </div>

        <div className="iot-card__metric">
          <span className="iot-card__metric-label">Sensor Timestamp</span>
          <span className="iot-card__metric-value" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
            {formatTimestamp(reading.timestamp)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="iot-card__footer">
        <span className="iot-card__timestamp">
          Last polled: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : "—"}
        </span>
        <span className="iot-card__refresh-hint">Auto-refreshes every 2.5s</span>
      </div>
    </div>
  );
}
