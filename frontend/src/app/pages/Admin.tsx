import { useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";
import { exportToCsv } from "../utils/exportCsv";
import "../styles/pages/Admin.css";

type TabKey = "waters" | "alerts" | "reports" | "iot";

interface WaterRow { id: number; locationName: string; currentLevel: string; maxLevel: string; status: string; trend: string; lastUpdated: string; }
interface AlertRow { id: number; title: string; message: string; type: string; createdAt: string; }
interface ReportRow {
  id: number;
  reporterName: string;
  incidentType: string;
  rescueNeeds: string;
  location: string;
  email?: string;
  contactNumber?: string;
  urgency?: string;
  observedLevel?: number | null;
  notes?: string;
  createdAt: string;
}
interface IoTRow { id: number; locationName: string; currentLevel: string; status: string; trend: string; timestamp: string; }

export function Admin() {
  const [tab, setTab] = useState<TabKey>("waters");
  const [waters, setWaters] = useState<WaterRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [iotReadings, setIotReadings] = useState<IoTRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ── fetch helpers ──────────────────────────────────────────────────────
  const fetchWaters = () => fetch(`${API_BASE_URL}/water-levels/`).then(r => r.json()).then(setWaters);
  const fetchAlerts = () => fetch(`${API_BASE_URL}/alerts/`).then(r => r.json()).then(setAlerts);
  const fetchReports = () => fetch(`${API_BASE_URL}/reports/`).then(r => r.json()).then(setReports);
  const fetchIoT = () => fetch(`${API_BASE_URL}/iot/readings/`).then(r => r.json()).then(setIotReadings);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchWaters(), fetchAlerts(), fetchReports(), fetchIoT()]).finally(() => setLoading(false));
  }, []);

  // Auto-refresh IoT readings every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchIoT();
      fetchWaters();
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // ── delete helpers ─────────────────────────────────────────────────────
  const deleteItem = async (endpoint: string, id: number, refresh: () => Promise<void>) => {
    await fetch(`${API_BASE_URL}/${endpoint}/${id}/`, { method: "DELETE" });
    await refresh();
  };

  // ── water form state ───────────────────────────────────────────────────
  const [wForm, setWForm] = useState({ location_name: "", current_level: "", max_level: "", status: "Normal", trend: "Steady" });
  const addWater = async () => {
    await fetch(`${API_BASE_URL}/water-levels/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wForm, current_level: Number(wForm.current_level), max_level: Number(wForm.max_level) }),
    });
    setWForm({ location_name: "", current_level: "", max_level: "", status: "Normal", trend: "Steady" });
    await fetchWaters();
  };

  // ── alert form state ───────────────────────────────────────────────────
  const [aForm, setAForm] = useState({ title: "", message: "", type: "info" });
  const addAlert = async () => {
    await fetch(`${API_BASE_URL}/alerts/`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(aForm),
    });
    setAForm({ title: "", message: "", type: "info" });
    await fetchAlerts();
  };

  const statusBadge = (status: string) => {
    const cls = status === "Danger" || status === "danger" ? "admin__badge--danger"
      : status === "Warning" || status === "warning" ? "admin__badge--warning"
      : "admin__badge--safe";
    return <span className={`admin__badge ${cls}`}>{status}</span>;
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const exportCurrentTab = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    if (tab === "waters") exportToCsv(`waters-${stamp}.csv`, waters as unknown as Record<string, unknown>[]);
    if (tab === "alerts") exportToCsv(`alerts-${stamp}.csv`, alerts as unknown as Record<string, unknown>[]);
    if (tab === "reports") exportToCsv(`reports-${stamp}.csv`, reports as unknown as Record<string, unknown>[]);
    if (tab === "iot") exportToCsv(`iot-readings-${stamp}.csv`, iotReadings as unknown as Record<string, unknown>[]);
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "waters", label: "Monitored Waters", icon: "🌊" },
    { key: "alerts", label: "System Alerts", icon: "⚠️" },
    { key: "reports", label: "Incident Reports", icon: "📋" },
    { key: "iot", label: "IoT Device Log", icon: "📡" },
  ];

  return (
    <section className="admin">
      <div className="admin__header">
        <h2 className="admin__title">Admin Control Panel</h2>
        <p className="admin__subtitle">Manage all system data • Real-time IoT sensor feed</p>
      </div>

      {/* Tab bar */}
      <nav className="admin__tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`admin__tab ${tab === t.key ? "admin__tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <span className="admin__tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {loading && <div className="admin__loading">Loading data…</div>}

      {!loading && (
        <div className="admin__export-row">
          <button type="button" className="admin__btn admin__btn--export" onClick={exportCurrentTab}>
            Export {tab} to CSV
          </button>
        </div>
      )}

      {/* ── WATERS ───────────────────────────────────────────────────── */}
      {tab === "waters" && (
        <div className="admin__panel">
          <div className="admin__panel-header">
            <h3>Water Level Stations ({waters.length})</h3>
          </div>

          {/* Add form */}
          <div className="admin__form-row">
            <input placeholder="Location Name" value={wForm.location_name} onChange={e => setWForm({ ...wForm, location_name: e.target.value })} />
            <input placeholder="Current (m)" type="number" step="0.1" value={wForm.current_level} onChange={e => setWForm({ ...wForm, current_level: e.target.value })} />
            <input placeholder="Max (m)" type="number" step="0.1" value={wForm.max_level} onChange={e => setWForm({ ...wForm, max_level: e.target.value })} />
            <select value={wForm.status} onChange={e => setWForm({ ...wForm, status: e.target.value })}>
              <option>Normal</option><option>Warning</option><option>Danger</option>
            </select>
            <select value={wForm.trend} onChange={e => setWForm({ ...wForm, trend: e.target.value })}>
              <option>Steady</option><option>Rising</option><option>Falling</option>
            </select>
            <button className="admin__btn admin__btn--add" onClick={addWater}>+ Add</button>
          </div>

          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>ID</th><th>Location</th><th>Level (m)</th><th>Max (m)</th><th>Status</th><th>Trend</th><th>Updated</th><th></th>
                </tr>
              </thead>
              <tbody>
                {waters.map(w => (
                  <tr key={w.id}>
                    <td>{w.id}</td>
                    <td>{w.locationName}</td>
                    <td className="admin__mono">{w.currentLevel}</td>
                    <td className="admin__mono">{w.maxLevel}</td>
                    <td>{statusBadge(w.status)}</td>
                    <td>{w.trend}</td>
                    <td className="admin__date">{formatDate(w.lastUpdated)}</td>
                    <td><button className="admin__btn admin__btn--del" onClick={() => deleteItem("water-levels", w.id, fetchWaters)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ALERTS ──────────────────────────────────────────────────── */}
      {tab === "alerts" && (
        <div className="admin__panel">
          <div className="admin__panel-header">
            <h3>System Alerts ({alerts.length})</h3>
          </div>

          <div className="admin__form-row">
            <input placeholder="Title" value={aForm.title} onChange={e => setAForm({ ...aForm, title: e.target.value })} />
            <input placeholder="Message" value={aForm.message} onChange={e => setAForm({ ...aForm, message: e.target.value })} />
            <select value={aForm.type} onChange={e => setAForm({ ...aForm, type: e.target.value })}>
              <option value="info">Info</option><option value="warning">Warning</option><option value="danger">Danger</option>
            </select>
            <button className="admin__btn admin__btn--add" onClick={addAlert}>+ Add</button>
          </div>

          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr><th>ID</th><th>Title</th><th>Message</th><th>Type</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.title}</td>
                    <td className="admin__msg">{a.message}</td>
                    <td>{statusBadge(a.type)}</td>
                    <td className="admin__date">{formatDate(a.createdAt)}</td>
                    <td><button className="admin__btn admin__btn--del" onClick={() => deleteItem("alerts", a.id, fetchAlerts)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REPORTS ─────────────────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="admin__panel">
          <div className="admin__panel-header">
            <h3>Incident Reports ({reports.length})</h3>
          </div>

          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr><th>ID</th><th>Reporter</th><th>Email</th><th>Urgency</th><th>Level</th><th>Type</th><th>Location</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {reports.length === 0 && (
                  <tr><td colSpan={9} className="admin__empty">No incident reports yet</td></tr>
                )}
                {reports.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.reporterName}</td>
                    <td>{r.email || "—"}</td>
                    <td>{r.urgency || "—"}</td>
                    <td className="admin__mono">{r.observedLevel != null ? `${r.observedLevel}m` : "—"}</td>
                    <td>{r.incidentType}</td>
                    <td>{r.location}</td>
                    <td className="admin__date">{formatDate(r.createdAt)}</td>
                    <td><button className="admin__btn admin__btn--del" onClick={() => deleteItem("reports", r.id, fetchReports)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── IOT DEVICE LOG ─────────────────────────────────────────── */}
      {tab === "iot" && (
        <div className="admin__panel">
          <div className="admin__panel-header">
            <h3>📡 IoT Device Feed ({iotReadings.length} readings)</h3>
            <span className="admin__live-dot" />
            <span className="admin__live-label">LIVE – auto-refreshing every 2.5s</span>
          </div>

          <div className="admin__iot-info">
            <p><strong>IoT Ingest Endpoint:</strong> <code>POST {API_BASE_URL}/iot/reading/</code></p>
            <p><strong>API Key:</strong> <code>flood-iot-secret-2026</code></p>
            <details className="admin__curl-details">
              <summary>Example curl from device</summary>
              <pre>{`curl -X POST ${API_BASE_URL}/iot/reading/ \\
  -H "Content-Type: application/json" \\
  -d '{"location_name":"Cagayan De Oro River","current_level":8.5,"status":"Danger","trend":"Rising","api_key":"flood-iot-secret-2026"}'`}</pre>
            </details>
          </div>

          <div className="admin__table-wrap">
            <table className="admin__table">
              <thead>
                <tr><th>ID</th><th>Location</th><th>Level (m)</th><th>Status</th><th>Trend</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {iotReadings.length === 0 && (
                  <tr><td colSpan={6} className="admin__empty">No IoT readings received yet – push data from your sensor!</td></tr>
                )}
                {iotReadings.map(r => (
                  <tr key={r.id} className="admin__iot-row">
                    <td>{r.id}</td>
                    <td>{r.locationName}</td>
                    <td className="admin__mono">{r.currentLevel}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>{r.trend}</td>
                    <td className="admin__date">{formatDate(r.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
