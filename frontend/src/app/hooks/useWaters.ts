import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../apiConfig';
import { MonitoredWater } from '../data/monitoredWaters';

export function useWaters() {
  const [waters, setWaters] = useState<MonitoredWater[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWaters() {
      try {
        const response = await fetch(`${API_BASE_URL}/water-levels/`);
        if (!response.ok) throw new Error('Failed to fetch water levels');
        const data = await response.json();
        setWaters(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(loading => false);
      }
    }

    fetchWaters();
  }, []);

  return { waters, loading, error };
}
