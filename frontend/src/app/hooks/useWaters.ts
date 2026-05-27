import { useState, useEffect } from "react";
import { API_BASE_URL } from "../apiConfig";
import { MonitoredWater } from "../data/monitoredWaters";
import { normalizeWatersList } from "../utils/normalizeWater";

export function useWaters() {
  const [waters, setWaters] = useState<MonitoredWater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWaters() {
      try {
        const response = await fetch(`${API_BASE_URL}/water-levels/`);
        if (!response.ok) throw new Error("Failed to fetch water levels");
        const data = await response.json();
        setWaters(normalizeWatersList(data));
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch water levels");
      } finally {
        setLoading(false);
      }
    }

    fetchWaters();
    const interval = setInterval(fetchWaters, 2500);

    return () => clearInterval(interval);
  }, []);

  return { waters, loading, error };
}
