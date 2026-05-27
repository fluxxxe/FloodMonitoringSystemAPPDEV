import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../apiConfig";

export interface IoTReading {
  id: number;
  locationName: string;
  currentLevel: string;
  status: string;
  trend: string;
  timestamp: string | null;
}

export function useIoTLatest() {
  const [reading, setReading] = useState<IoTReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/iot/latest/`);
      if (!response.ok) throw new Error("Failed to fetch IoT reading");
      const data = await response.json();
      setReading(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 2500);
    return () => clearInterval(interval);
  }, [fetchLatest]);

  return { reading, loading, error, lastRefreshed };
}
