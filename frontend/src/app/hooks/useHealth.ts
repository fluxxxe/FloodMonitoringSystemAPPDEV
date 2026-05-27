import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";

export interface HealthStatus {
  status: string;
  db: boolean;
  stationCount: number;
  alertCount: number;
  iotReadingCount: number;
  latestIotAt: string | null;
  latestIotLocation: string | null;
  iotStale: boolean;
  thresholds: { warningPct: number; dangerPct: number };
}

export function useHealth(pollMs = 10000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/`);
      if (!response.ok) throw new Error("Health check failed");
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Health check failed");
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, pollMs);
    return () => clearInterval(interval);
  }, [fetchHealth, pollMs]);

  return { health, error, refresh: fetchHealth };
}
