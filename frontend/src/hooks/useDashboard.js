import { useState, useCallback, useEffect } from "react";
import { apiGetDashboardStats, apiGetHotspots } from "../services/api";

export const useDashboard = () => {
  const [stats, setStats] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to fetch statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHotspots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetHotspots();
      if (response.success) {
        setHotspots(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Failed to fetch hotspots");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch stats on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    stats,
    hotspots,
    loading,
    error,
    fetchStatistics,
    fetchHotspots,
  };
};
