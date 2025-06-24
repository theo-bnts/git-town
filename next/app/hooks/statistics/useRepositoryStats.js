'use client';

import { useState, useEffect } from 'react';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import { useFormattedStats } from '@/app/hooks/statistics/statsHooks';

export function useRepositoryStats(repositoryId, isOpen) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  
  const formattedStats = useFormattedStats(stats);
  const isPartialData = stats && (!Array.isArray(stats.Users) || stats.Users.length === 0);
  
  const handleRetry = () => {
    setStats(null);
    setError(null);
    setLoadAttempt(0);
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimeout = null;

    async function loadStats() {
      if (cancelled) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchRepositoryStatistics(repositoryId);
        
        if (cancelled) return;
        
        const hasUserData = Array.isArray(data?.Users) && data.Users.length > 0;
        
        if (!hasUserData && loadAttempt < 3) {
          setLoadAttempt(prev => prev + 1);
          retryTimeout = setTimeout(() => loadStats(), 2000);
          return;
        }
        
        setStats(data);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        
        setError(err);
        setLoading(false);
      }
    }

    if (isOpen) {
      setStats(null);
      setLoadAttempt(0);
      loadStats();
    } else {
      setStats(null);
      setError(null);
      setLoadAttempt(0);
    }

    return () => { 
      cancelled = true; 
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isOpen, repositoryId, loadAttempt]);

  return {
    stats,
    formattedStats,
    loading,
    error,
    isPartialData,
    handleRetry
  };
}
