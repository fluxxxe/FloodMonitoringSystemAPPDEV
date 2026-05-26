import { useMemo, useState } from "react";
import { useWeather } from "../hooks/useWeather";
import { deriveWeatherAlerts } from "../utils/weatherAlerts";
import "../styles/pages/Notifications.css";

type NotificationType = "Tsunami" | "Flood" | "Rainfall";
type NotificationSource = "IoT Buoy" | "River Sensor" | "Weather Feed";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  source: NotificationSource;
  station: string;
  occurredAt: string;
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Tsunami Sensor Spike",
    message: "Offshore buoy detected unusual pressure change near the eastern coastal zone.",
    type: "Tsunami",
    source: "IoT Buoy",
    station: "Buoy TSU-01",
    occurredAt: "2026-03-31T08:31:00+08:00",
    isRead: false,
  },
  {
    id: "n2",
    title: "River Level Warning",
    message: "Cagayan De Oro River crossed the warning threshold after sustained upstream inflow.",
    type: "Flood",
    source: "River Sensor",
    station: "TSU-001",
    occurredAt: "2026-03-31T08:12:00+08:00",
    isRead: false,
  },
  {
    id: "n3",
    title: "Canal Level Normalized",
    message: "Kauswagan Canal readings returned to the safe operating band.",
    type: "Flood",
    source: "River Sensor",
    station: "FLD-004",
    occurredAt: "2026-03-30T18:46:00+08:00",
    isRead: true,
  },
  {
    id: "n4",
    title: "Rainfall Advisory Logged",
    message: "Weather telemetry reported elevated rain probability for the next monitoring window.",
    type: "Rainfall",
    source: "Weather Feed",
    station: "WX-CDO",
    occurredAt: "2026-03-30T14:20:00+08:00",
    isRead: true,
  },
];

function formatNotificationDate(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatNotificationTime(value: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const minutes = Math.max(1, Math.round((now - timestamp) / 60000));

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function Notifications() {
  const { status, payload, locationName } = useWeather();
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<"All" | NotificationType>("All");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const liveWeatherItems = useMemo<NotificationItem[]>(() => {
    if (!payload) return [];

    return deriveWeatherAlerts(payload).map((alert, index) => ({
      id: `live-${alert.id}`,
      title: alert.title,
      message: alert.message,
      type: alert.type === "danger" ? "Flood" : "Rainfall",
      source: "Weather Feed",
      station: locationName || "WX-CDO",
      occurredAt: new Date(new Date(payload.current.observedAt).getTime() - index * 60000).toISOString(),
      isRead: false,
    }));
  }, [locationName, payload]);

  const mergedItems = useMemo(() => {
    return [...liveWeatherItems, ...items]
      .map((item) => ({
        ...item,
        isRead: readOverrides[item.id] ?? item.isRead,
      }))
      .sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
      );
  }, [items, liveWeatherItems, readOverrides]);

  const filteredItems = useMemo(() => {
    return mergedItems.filter((item) => {
      const typeOk = filterType === "All" || item.type === filterType;
      const unreadOk = !showUnreadOnly || !item.isRead;
      return typeOk && unreadOk;
    });
  }, [mergedItems, filterType, showUnreadOnly]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce<Array<{ dateLabel: string; items: NotificationItem[] }>>(
      (groups, item) => {
        const dateLabel = formatNotificationDate(item.occurredAt);
        const existingGroup = groups.find((group) => group.dateLabel === dateLabel);

        if (existingGroup) {
          existingGroup.items.push(item);
        } else {
          groups.push({ dateLabel, items: [item] });
        }

        return groups;
      },
      [],
    );
  }, [filteredItems]);

  const unreadCount = mergedItems.filter((item) => !item.isRead).length;

  const toggleRead = (id: string) => {
    setReadOverrides((previous) => ({
      ...previous,
      [id]: !(previous[id] ?? mergedItems.find((item) => item.id === id)?.isRead ?? false),
    }));
  };

  const markAllAsRead = () => {
    const updates: Record<string, boolean> = {};
    mergedItems.forEach((item) => {
      updates[item.id] = true;
    });
    setReadOverrides((previous) => ({ ...previous, ...updates }));
  };

  const clearRead = () => {
    setItems((current) => current.filter((item) => !(readOverrides[item.id] ?? item.isRead)));
  };

  const clearAll = () => {
    setItems([]);
  };

  return (
    <section className="app__section app__notif-shell">
      <header className="app__notif-topbar">
        <div>
          <h2 className="app__section-title">Notifications</h2>
        </div>
        <div className="app__notif-topbar-actions">
          <button type="button" className="app__notif-ghost-button" onClick={markAllAsRead}>
            Mark all as read
          </button>
          <button type="button" className="app__notif-ghost-button" onClick={clearRead}>
            Clear read
          </button>
          <button type="button" className="app__notif-ghost-button" onClick={clearAll}>
            Clear all
          </button>
        </div>
      </header>

      <div className="app__notif-controls">
        <div className="app__notif-live-status">
          <span>Live weather feed:</span>
          <span className={`app__notif-status-badge app__notif-status-badge--${status}`}>
            {status === "loading" ? "Updating..." : "Synced"}
          </span>
        </div>

        <div className="app__notif-filter-group">
          <span className="app__notif-filter-label">Filter Type:</span>
          <div className="app__notif-filter-chips">
            {(["All", "Tsunami", "Flood", "Rainfall"] as const).map((value) => {
              const isActive = value === filterType;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilterType(value)}
                  className={`app__notif-chip ${isActive ? "app__notif-chip--active" : ""}`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <div className="app__notif-toggles">
          <label className="app__notif-toggle-label">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            <span>Unread only</span>
          </label>
        </div>

        <div className="app__notif-unread-count">
          Unread notifications: <strong>{unreadCount}</strong>
        </div>
      </div>

      {groupedItems.length === 0 ? (
        <p className="app__notif-empty">No notification records available.</p>
      ) : (
        <div className="app__notif-feed">
          {groupedItems.map((group) => (
            <section key={group.dateLabel} className="app__notif-group">
              <h3 className="app__notif-date">{group.dateLabel}</h3>
              <ul className="app__notif-list">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <div
                      className={`app__notif-row ${item.isRead ? "app__notif-row--read" : ""}`}
                      onClick={() => {
                        if (!item.isRead) toggleRead(item.id);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (!item.isRead) toggleRead(item.id);
                        }
                      }}
                    >
                      <span
                        className={`app__notif-indicator ${item.isRead ? "app__notif-indicator--hidden" : ""}`}
                        aria-hidden="true"
                      />
                      <div className="app__notif-avatar">
                        {item.type === "Tsunami" ? "TS" : item.type === "Flood" ? "FL" : "WX"}
                      </div>
                      <div className="app__notif-content">
                        <p className="app__notif-message">
                          <strong>{item.source}</strong> reported <strong>{item.title}</strong>.{" "}
                          {item.message}
                        </p>
                        <div className="app__notif-meta">
                          <span>{item.station}</span>
                          <span>{item.type}</span>
                          <span>{formatNotificationTime(item.occurredAt)}</span>
                          <span>{formatRelativeTime(item.occurredAt)}</span>
                          <button
                            type="button"
                            className="app__notif-toggle-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRead(item.id);
                            }}
                          >
                            {item.isRead ? "Mark as unread" : "Mark as read"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
