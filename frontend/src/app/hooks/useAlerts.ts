import { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import { ActiveAlert } from "../data/activeAlerts";

export function useAlerts(pollMs = 2500) {
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(`${API_BASE_URL}/alerts/`);
        if (!response.ok) throw new Error("Failed to fetch alerts");
        const data = await response.json();
        setAlerts(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch alerts");
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollMs);
    return () => clearInterval(interval);
  }, [pollMs]);

  return { alerts, loading, error };
}
