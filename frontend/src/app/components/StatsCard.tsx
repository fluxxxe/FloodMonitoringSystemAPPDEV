// Simple Statistics Card Component
// Shows one piece of statistical information

import { Card, CardContent } from "./ui/card";
import { ReactNode } from "react";
import "../styles/components/StatsCard.css";

// Props that this component receives
interface StatsCardProps {
  label: string;
  value: string; 
  icon: ReactNode;
}

export function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="stats-card__content">
        <div className="stats-card__row">
          {/* Left side - text */}
          <div>
            <p className="stats-card__label">{label}</p>
            <p className="stats-card__value">{value}</p>
          </div>

          {/* Right side - emoji or image icon */}
          <div className="stats-card__icon">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}


