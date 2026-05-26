// Simple Alert Card Component
// Shows one alert message

import { Card, CardContent } from "./ui/card";
import { AlertCircle } from "lucide-react";
import "../styles/components/AlertCard.css";

// Props that this component receives
interface AlertCardProps {
  title: string;
  message: string;
  type: string;
}

export function AlertCard({ title, message, type }: AlertCardProps) {
  const variant =
    type === "warning" ? "warning" : type === "danger" ? "danger" : "info";

  return (
    <Card className={`alert-card alert-card--${variant}`}>
      <CardContent className="alert-card__content">
        <div className="alert-card__row">
          {/* Alert icon */}
          <AlertCircle className={`alert-card__icon alert-card__icon--${variant}`} />
          
          {/* Alert content */}
          <div className="alert-card__body">
            <h4 className="alert-card__title">{title}</h4>
            <p className="alert-card__message">{message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


