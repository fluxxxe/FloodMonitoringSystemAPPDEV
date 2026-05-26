// Simple Water Level Card Component
// Shows water level information for one location

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import "../styles/components/WaterLevelCard.css";

// Props that this component receives
interface WaterLevelCardProps {
  locationName: string;
  currentLevel: number;
  maxLevel: number;
  status: string;
  expandedContent?: React.ReactNode;
}

export function WaterLevelCard({
  locationName,
  currentLevel,
  maxLevel,
  status,
  expandedContent,
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

  return (
    <Card>
      <CardHeader>
        <div className="water-level-card__header-row">
          <CardTitle>{locationName}</CardTitle>
          <Badge className={badgeClass}>{status}</Badge>
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


