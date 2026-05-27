import { Link } from "react-router";
import { useWaters } from "../hooks/useWaters";
import { useAlerts } from "../hooks/useAlerts";
import { useHealth } from "../hooks/useHealth";
import { useIoTLatest } from "../hooks/useIoTLatest";
import "../styles/pages/Summary.css";

export function Summary() {
  const { waters, loading: watersLoading } = useWaters();
  const { alerts } = useAlerts();
  const { health } = useHealth();
  const { reading } = useIoTLatest();

  const dangerCount = waters.filter((w) => w.status === "Danger").length;
  const warningCount = waters.filter((w) => w.status === "Warning").length;
  const safeCount = waters.length - dangerCount - warningCount;

  return (
    <section className="app__section summary">
      <h2 className="app__section-title">System Summary</h2>
      <p className="app__page-text">Live overview of flood monitoring status across all stations.</p>

      <div className="summary__grid">
        <article className="summary__card">
          <span className="summary__label">Monitored stations</span>
          <strong className="summary__value">{watersLoading ? "…" : waters.length}</strong>
        </article>
        <article className="summary__card summary__card--safe">
          <span className="summary__label">Safe</span>
          <strong className="summary__value">{safeCount}</strong>
        </article>
        <article className="summary__card summary__card--warn">
          <span className="summary__label">Warning</span>
          <strong className="summary__value">{warningCount}</strong>
        </article>
        <article className="summary__card summary__card--danger">
          <span className="summary__label">Danger</span>
          <strong className="summary__value">{dangerCount}</strong>
        </article>
        <article className="summary__card">
          <span className="summary__label">Active alerts</span>
          <strong className="summary__value">{alerts.length}</strong>
        </article>
        <article className="summary__card">
          <span className="summary__label">IoT readings logged</span>
          <strong className="summary__value">{health?.iotReadingCount ?? "—"}</strong>
        </article>
      </div>

      {reading && (
        <div className="summary__iot-panel">
          <h3>Latest Arduino reading</h3>
          <p>
            <strong>{reading.locationName}</strong> — {reading.currentLevel}m · {reading.status} ·{" "}
            {reading.trend}
          </p>
        </div>
      )}

      <section className="summary__stations">
        <h3>Station status</h3>
        <ul className="summary__station-list">
          {waters.map((w) => (
            <li key={w.id} className={`summary__station summary__station--${w.status.toLowerCase()}`}>
              <span>{w.locationName}</span>
              <span>{w.currentLevel.toFixed(1)}m / {w.maxLevel.toFixed(1)}m</span>
              <span>{w.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="app__page-actions" aria-label="Summary navigation">
        <Link to="/monitoring" className="app__page-link">Open Monitoring</Link>
        <Link to="/configuration" className="app__page-link">Configuration</Link>
      </nav>
    </section>
  );
}
