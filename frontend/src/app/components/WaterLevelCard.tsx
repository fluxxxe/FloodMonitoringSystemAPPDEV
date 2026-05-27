import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import "../styles/components/WaterLevelCard.css";

export interface ArduinoMonitorProps {
  trend?: string;
  sensorTimestamp?: string | null;
  lastPolled?: Date | null;
  loading?: boolean;
  hasReading?: boolean;
}

interface WaterLevelCardProps {
  locationName: string;
  currentLevel: number;
  maxLevel: number;
  status: string;
  expandedContent?: React.ReactNode;
  arduinoMonitor?: ArduinoMonitorProps;
}

function trendArrow(trend: string): { symbol: string; className: string } {
  const normalized = trend.toLowerCase();
  if (normalized === "rising") return { symbol: "↑", className: "water-level-card__trend-arrow--rising" };
  if (normalized === "falling") return { symbol: "↓", className: "water-level-card__trend-arrow--falling" };
  return { symbol: "→", className: "water-level-card__trend-arrow--steady" };
}

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export function WaterLevelCard({
  locationName,
  currentLevel,
  maxLevel,
  status,
  expandedContent,
  arduinoMonitor,
}: WaterLevelCardProps) {
  // Calculate percentage for progress bar
  const percentage = Math.max(0, Math.min((currentLevel / maxLevel) * 100, 100));
  const normalizedStatus = status.toLowerCase();
  const statusVariant =
    normalizedStatus === "warning"
      ? "warning"
      : normalizedStatus === "danger"
        ? "danger"
        : "safe";

  const badgeClass = `water-level-card__badge water-level-card__badge--${statusVariant}`;
  const fillClass = `water-level-card__progress-fill water-level-card__progress-fill--${statusVariant}`;
  const trend = arduinoMonitor?.trend ? trendArrow(arduinoMonitor.trend) : null;

  return (
    <Card className={arduinoMonitor ? "water-level-card--arduino" : undefined}>
      <CardHeader>
        <div className="water-level-card__header-row">
          <div className="water-level-card__title-block">
            <CardTitle>{locationName}</CardTitle>
            {arduinoMonitor && (
              <p className="water-level-card__arduino-subtitle">Arduino IoT Sensor</p>
            )}
          </div>
          <div className="water-level-card__header-badges">
            {arduinoMonitor && (
              <span className="water-level-card__live-badge">
                <span className="water-level-card__live-dot" />
                Live
              </span>
            )}
            <Badge className={badgeClass}>{status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Water level numbers */}
        <div className="water-level-card__body">
          <p className="water-level-card__level">{currentLevel}m</p>
          <p className="water-level-card__max-level">
            Max Level: {maxLevel}m
          </p>

          {/* Progress bar showing water level */}
          <div className="water-level-card__progress-track">
            <div
              className={fillClass}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="water-level-card__percent">
            {percentage.toFixed(0)}% of max capacity
          </p>

          {arduinoMonitor && (
            <div className="water-level-card__arduino-meta">
              {arduinoMonitor.loading ? (
                <p className="water-level-card__arduino-wait">Connecting to Arduino device…</p>
              ) : arduinoMonitor.hasReading && trend ? (
                <>
                  <p className="water-level-card__arduino-trend">
                    <span className="water-level-card__arduino-trend-label">Trend</span>
                    <span className={`water-level-card__trend-arrow ${trend.className}`}>{trend.symbol}</span>
                    {arduinoMonitor.trend}
                  </p>
                  <p className="water-level-card__arduino-ts">
                    Sensor: {formatTimestamp(arduinoMonitor.sensorTimestamp)}
                  </p>
                  <p className="water-level-card__arduino-ts">
                    Last polled: {arduinoMonitor.lastPolled ? arduinoMonitor.lastPolled.toLocaleTimeString() : "—"}
                    <span className="water-level-card__arduino-hint"> · Auto-refreshes every 2.5s</span>
                  </p>
                </>
              ) : (
                <p className="water-level-card__arduino-wait">Waiting for Arduino device data…</p>
              )}
            </div>
          )}

          {expandedContent && (
            <div className="water-level-card__expanded-content" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
              {expandedContent}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


