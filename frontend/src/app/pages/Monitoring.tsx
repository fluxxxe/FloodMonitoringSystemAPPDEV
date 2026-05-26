import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WaterLevelCard } from "../components/WaterLevelCard";
import { useWaters } from "../hooks/useWaters";
import "../styles/pages/Monitoring.css";

export function Monitoring() {
  const { waters, loading, error } = useWaters();
  const [selectedId, setSelectedId] = useState("");
  const selectedWater = useMemo(
    () => waters.find((location) => location.id === selectedId || String(location.id) === selectedId) ?? null,
    [waters, selectedId],
  );

  useEffect(() => {
    if (!selectedWater) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId("");
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedWater]);

  const chartData = useMemo(() => {
    if (!selectedWater) return [];

    return selectedWater.readings.map((reading) => ({
      level: reading.level,
      timeLabel: new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(reading.timestamp)),
      fullLabel: new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(reading.timestamp)),
    }));
  }, [selectedWater]);

  const highestReading = useMemo(() => {
    if (!selectedWater) return null;

    return selectedWater.readings.reduce((highest, reading) =>
      reading.level > highest.level ? reading : highest,
    );
  }, [selectedWater]);

  const averageLevel = useMemo(() => {
    if (!selectedWater) return 0;

    const total = selectedWater.readings.reduce((sum, reading) => sum + reading.level, 0);
    return total / selectedWater.readings.length;
  }, [selectedWater]);

  return (
    <section className="app__section">
      <h2 className="app__section-title">Monitoring View</h2>
      <p className="app__page-text">
        Select a monitored water location to open its full-screen IoT detail panel.
      </p>

      <ul className="app__water-grid app__water-grid--monitoring">
        {waters.map((location) => (
          <li key={location.id}>
            <button
              className="app__monitor-card-button"
              onClick={() => setSelectedId(location.id)}
              type="button"
            >
              <WaterLevelCard {...location} />
              <div className="app__monitor-card-meta">
                <span>{location.sensorId}</span>
                <span>{location.trend} trend</span>
              </div>
              <p className="app__monitor-card-hint">Open full-screen monitoring details</p>
            </button>
          </li>
        ))}
      </ul>

      {selectedWater ? (
        <div
          className="app__monitor-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="monitoring-modal-title"
        >
          <button
            className="app__monitor-modal-backdrop"
            type="button"
            aria-label="Close monitoring details"
            onClick={() => setSelectedId("")}
          />
          <section className="app__monitor-modal-panel">
            <header className="app__monitor-modal-header">
              <div>
                <p className="app__monitor-modal-eyebrow">Live IoT water station</p>
                <h3 id="monitoring-modal-title" className="app__monitor-modal-title">
                  {selectedWater.locationName}
                </h3>
                <p className="app__page-text">
                  {selectedWater.barangay}, {selectedWater.municipality}
                </p>
              </div>
              <button
                className="app__monitor-modal-close"
                type="button"
                onClick={() => setSelectedId("")}
              >
                Close
              </button>
            </header>

            <div className="app__monitor-modal-grid">
              <section className="app__monitor-modal-hero">
                <figure className="app__monitor-modal-photo-wrap">
                  <img
                    src={selectedWater.imageUrl}
                    alt={selectedWater.locationName}
                    className="app__monitor-modal-photo"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/location.png";
                    }}
                  />
                </figure>

                <div className="app__monitor-stat-grid">
                  <article className="app__monitor-stat-card">
                    <span className="app__monitor-stat-label">Current Level</span>
                    <strong>{selectedWater.currentLevel.toFixed(1)} m</strong>
                  </article>
                  <article className="app__monitor-stat-card">
                    <span className="app__monitor-stat-label">Highest in 24h</span>
                    <strong>{highestReading?.level.toFixed(1)} m</strong>
                  </article>
                  <article className="app__monitor-stat-card">
                    <span className="app__monitor-stat-label">24h Average</span>
                    <strong>{averageLevel.toFixed(1)} m</strong>
                  </article>
                  <article className="app__monitor-stat-card">
                    <span className="app__monitor-stat-label">Sensor ID</span>
                    <strong>{selectedWater.sensorId}</strong>
                  </article>
                </div>

                <div className="app__monitor-info-grid">
                  <p><strong>Type:</strong> {selectedWater.locationType}</p>
                  <p><strong>Status:</strong> {selectedWater.status}</p>
                  <p><strong>Trend:</strong> {selectedWater.trend}</p>
                  <p><strong>Last Updated:</strong> {selectedWater.lastUpdated}</p>
                  <p><strong>Design Max:</strong> {selectedWater.maxLevel.toFixed(1)} m</p>
                  <p>
                    <strong>Peak Timestamp:</strong>{" "}
                    {highestReading
                      ? new Intl.DateTimeFormat("en-PH", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        }).format(new Date(highestReading.timestamp))
                      : "N/A"}
                  </p>
                </div>

                <p className="app__monitor-notes">{selectedWater.notes}</p>
              </section>

              <section className="app__monitor-chart-card">
                <div className="app__monitor-chart-header">
                  <div>
                    <h4>24-hour IoT level history</h4>
                  </div>
                </div>

                <div className="app__monitor-chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 16, right: 10, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="monitoringLevelFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#dbeafe" strokeDasharray="3 3" />
                      <XAxis dataKey="timeLabel" tick={{ fontSize: 12, fill: "#475569" }} />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#475569" }}
                        unit="m"
                        domain={[0, Math.ceil(selectedWater.maxLevel + 1)]}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)} m`, "Water level"]}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.fullLabel ?? label
                        }
                      />
                      <ReferenceLine
                        y={selectedWater.maxLevel}
                        stroke="#dc2626"
                        strokeDasharray="6 6"
                        label={{ value: "Max threshold", fill: "#b91c1c", fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="level"
                        stroke="#0f766e"
                        strokeWidth={3}
                        fill="url(#monitoringLevelFill)"
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="app__monitor-chart-footer">
                  <p>
                    <strong>Current:</strong> {selectedWater.currentLevel.toFixed(1)} m
                  </p>
                  <p>
                    <strong>Peak:</strong> {highestReading?.level.toFixed(1)} m in the last 24 hours
                  </p>
                </div>
              </section>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
