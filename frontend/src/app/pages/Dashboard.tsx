import { useRef, useState } from "react";
import { Link } from "react-router";
import { WaterLevelCard } from "../components/WaterLevelCard";
import { AlertCard } from "../components/AlertCard";
import { StatsCard } from "../components/StatsCard";
import { WeatherPanel } from "../components/WeatherPanel";
import { Button } from "../components/ui/button";
import { useIoTLatest } from "../hooks/useIoTLatest";
import { ActiveAlert } from "../data/activeAlerts";
import { useWaters } from "../hooks/useWaters";
import { useAlerts } from "../hooks/useAlerts";
import { useHealth } from "../hooks/useHealth";
import { SystemStatusBanner } from "../components/SystemStatusBanner";
import { MonitoredWater } from "../data/monitoredWaters";
import "../styles/pages/Dashboard.css";

function isCagayanDeOroRiver(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("cagayan") && n.includes("oro") && n.includes("river");
}

function normalizeStatus(status: string): MonitoredWater["status"] {
  const s = status.toLowerCase();
  if (s === "warning") return "Warning";
  if (s === "danger") return "Danger";
  return "Safe";
}

export function Dashboard() {
  const { waters } = useWaters();
  const { alerts: backendAlerts } = useAlerts();
  const { health, error: healthError } = useHealth();
  const { reading, loading: iotLoading, lastRefreshed } = useIoTLatest();
  const [showAlerts, setShowAlerts] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState<ActiveAlert[]>([]);
  const alertsSectionRef = useRef<HTMLElement | null>(null);

  const featuredWaters = waters.slice(0, 3);
  const safeCount = waters.filter((item) => item.status === "Safe" || item.status === "Normal").length;
  const alertCount = waters.filter((item) => item.status !== "Safe" && item.status !== "Normal").length;

  const stats = [
    {
      id: "total-locations",
      label: "Total Locations",
      value: String(waters.length),
      icon: <img src="/location.png" alt="Location" className="app__location-icon" />,
    },
    { id: "active-alerts", label: "Active Alerts", value: String(alertCount), icon: "\u26A0\uFE0F" },
    { id: "safe-areas", label: "Safe Areas", value: String(safeCount), icon: "\u2705" },
  ];

  const alerts = [...backendAlerts, ...weatherAlerts];

  function buildCardProps(loc: MonitoredWater) {
    if (!isCagayanDeOroRiver(loc.locationName)) {
      return { loc, arduinoMonitor: undefined };
    }

    const iotLevel = reading ? parseFloat(reading.currentLevel) : NaN;
    const merged: MonitoredWater = reading
      ? {
          ...loc,
          currentLevel: Number.isNaN(iotLevel) ? loc.currentLevel : iotLevel,
          status: normalizeStatus(reading.status),
          trend: (reading.trend as MonitoredWater["trend"]) || loc.trend,
        }
      : loc;

    return {
      loc: merged,
      arduinoMonitor: {
        trend: reading?.trend,
        sensorTimestamp: reading?.timestamp ?? null,
        lastPolled: lastRefreshed,
        loading: iotLoading && !reading,
        hasReading: Boolean(reading),
      },
    };
  }

  return (
    <>
      <SystemStatusBanner health={health} apiError={healthError} />

      <section className="app__section">
        <h2 className="app__section-title">Overview Statistics</h2>
        <ul className="app__stats-grid">
          {stats.map((stat) => (
            <li key={stat.id}>
              <StatsCard label={stat.label} value={stat.value} icon={stat.icon} />
            </li>
          ))}
        </ul>
      </section>

      <section className="app__section">
        <div className="app__alerts-header">
          <h2 className="app__section-title app__section-title--no-margin">Water Levels by Location</h2>
          <Link to="/monitoring" className="app__page-link">
            View All Monitored Waters
          </Link>
        </div>
        <ul className="app__water-grid">
          {featuredWaters.map((loc) => {
            const { loc: cardLoc, arduinoMonitor } = buildCardProps(loc);
            return (
              <li key={loc.id}>
                <WaterLevelCard {...cardLoc} arduinoMonitor={arduinoMonitor} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="app__section">
        <WeatherPanel
          onWeatherAlertsChange={setWeatherAlerts}
          onOpenAlerts={() => {
            setShowAlerts(true);
            requestAnimationFrame(() => {
              alertsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
          }}
        />
      </section>

      <section className="app__section" ref={alertsSectionRef}>
        <div className="app__alerts-header">
          <h2 className="app__section-title app__section-title--no-margin">Active Alerts</h2>
          <Button type="button" onClick={() => setShowAlerts((v) => !v)} variant="outline">
            {showAlerts ? "Hide Alerts" : "Show Alerts"}
          </Button>
        </div>
        {showAlerts && (
          <ul className="app__alerts-grid">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <AlertCard {...alert} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="app__help">
        <h3 className="app__help-title">How to Use</h3>
        <ul className="app__help-list">
          <li>Check water levels at different locations</li>
          <li>Monitor active alerts for dangerous situations</li>
          <li>Green = Safe, Yellow = Warning, Red = Danger</li>
          <li>Click "Hide/Show Alerts" to toggle alerts</li>
        </ul>
      </section>
    </>
  );
}
