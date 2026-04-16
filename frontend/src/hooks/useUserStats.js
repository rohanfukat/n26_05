import { useState, useCallback } from "react";
import { apiGetUserStats } from "../services/api";

export const useUserStats = () => {
  const [stats, setStats] = useState({
    total_complaints: 0,
    resolved: 0,
    in_progress: 0,
    pending: 0,
    complaints: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGetUserStats();

      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || "Failed to fetch user stats");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch user stats");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    fetchUserStats,
  };
};
