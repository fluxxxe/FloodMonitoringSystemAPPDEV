import { Link } from "react-router";
import { useHealth } from "../hooks/useHealth";
import { API_BASE_URL } from "../apiConfig";
import "../styles/pages/Configuration.css";

export function Configuration() {
  const { health, error } = useHealth();

  const warningPct = health ? Math.round(health.thresholds.warningPct * 100) : 70;
  const dangerPct = health ? Math.round(health.thresholds.dangerPct * 100) : 90;

  return (
    <section className="app__section config">
      <h2 className="app__section-title">Configuration</h2>
      <p className="app__page-text">System thresholds, API endpoints, and IoT connection reference.</p>

      <div className="config__grid">
        <article className="config__card">
          <h3>Alert thresholds</h3>
          <p>Water level status is computed automatically when Arduino data is ingested:</p>
          <ul className="config__list">
            <li><strong>Safe (Normal):</strong> below {warningPct}% of max level</li>
            <li><strong>Warning:</strong> {warningPct}% – {dangerPct}% of max level</li>
            <li><strong>Danger:</strong> at or above {dangerPct}% of max level</li>
          </ul>
          <p className="config__hint">Danger alerts are deduplicated every 15 minutes per location.</p>
        </article>

        <article className="config__card">
          <h3>API endpoints</h3>
          <ul className="config__list config__list--mono">
            <li>Health: <code>GET {API_BASE_URL}/health/</code></li>
            <li>IoT ingest: <code>POST {API_BASE_URL}/iot/reading/</code></li>
            <li>IoT history: <code>GET {API_BASE_URL}/iot/history/?location_name=…</code></li>
            <li>Latest reading: <code>GET {API_BASE_URL}/iot/latest/</code></li>
          </ul>
        </article>

        <article className="config__card">
          <h3>Arduino connection</h3>
          <ol className="config__list">
            <li>Upload your sketch to the Arduino Mega (9600 baud).</li>
            <li>Close Arduino IDE Serial Monitor.</li>
            <li>Run: <code>arduino_serial_forwarder.py</code></li>
          </ol>
          <p className="config__hint">API key: <code>flood-iot-secret-2026</code></p>
        </article>

        <article className="config__card">
          <h3>System health</h3>
          {error ? (
            <p className="config__error">Backend unreachable: {error}</p>
          ) : health ? (
            <ul className="config__list">
              <li>Status: <strong>{health.status}</strong></li>
              <li>Stations: {health.stationCount}</li>
              <li>IoT readings: {health.iotReadingCount}</li>
              <li>Latest IoT: {health.latestIotLocation ?? "—"} at {health.latestIotAt ?? "—"}</li>
              <li>Sensor stale: {health.iotStale ? "Yes (>5 min)" : "No"}</li>
            </ul>
          ) : (
            <p>Loading…</p>
          )}
        </article>
      </div>

      <nav className="app__page-actions" aria-label="Configuration navigation">
        <Link to="/summary" className="app__page-link">Back to Summary</Link>
        <Link to="/admin" className="app__page-link">Admin Panel</Link>
      </nav>
    </section>
  );
}
