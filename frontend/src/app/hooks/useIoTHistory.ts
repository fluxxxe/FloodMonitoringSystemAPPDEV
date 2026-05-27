import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../apiConfig";
import { WaterReading } from "../data/monitoredWaters";

export function useIoTHistory(locationName: string | null, hours = 24, pollMs = 5000) {
  const [readings, setReadings] = useState<WaterReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!locationName) {
      setReadings([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        location_name: locationName,
        hours: String(hours),
      });
      const response = await fetch(`${API_BASE_URL}/iot/history/?${params}`);
      if (!response.ok) throw new Error("Failed to fetch IoT history");
      const data = await response.json();
      setReadings(
        data.map((row: { timestamp: string; level: number }) => ({
          timestamp: row.timestamp,
          level: row.level,
        })),
      );
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch history");
    } finally {
      setLoading(false);
    }
  }, [locationName, hours]);

  useEffect(() => {
    fetchHistory();
    if (!locationName) return undefined;
    const interval = setInterval(fetchHistory, pollMs);
    return () => clearInterval(interval);
  }, [fetchHistory, locationName, pollMs]);

  return { readings, loading, error, refresh: fetchHistory };
}
