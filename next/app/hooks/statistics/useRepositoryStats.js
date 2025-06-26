'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import { formatStatistics } from '@/app/utils/statisticsFormatter';
import { analyzeStatistics, canRefreshForMissingData } from '@/app/utils/statisticsAnalyzer';

export function useRepositoryStats(repositoryId, isOpen, options = {}) {
  const initialLoadCompleted = useRef(false);
  const retryTimeoutRef = useRef(null);
  const isLoadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const retryCountRef = useRef(0);
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { maxRetries = 3 } = options;
  
  const formattedStats = stats ? formatStatistics(stats) : null;
  
  const fetchStats = useCallback(async (isRetry = false) => {
    if (isLoadingRef.current) {
      return;
    }
    
    const currentRetryCount = isRetry ? retryCountRef.current : 0;
    
    if (!isRetry) {
      retryCountRef.current = 0;
      setRetryCount(0);
    }
    
    if (isRetry && currentRetryCount >= maxRetries) {
      setAutoRetrying(false);
      return;
    }
    
    if (isRetry) {
      retryCountRef.current = currentRetryCount + 1;
      setRetryCount(currentRetryCount + 1);
    }
    
    const currentRequestId = ++requestIdRef.current;
    isLoadingRef.current = true;
    
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const data = await fetchRepositoryStatistics(repositoryId);
      
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      
      const dataAnalysis = analyzeStatistics(data);
      const canRefresh = canRefreshForMissingData(dataAnalysis);
      
      setStats(data);
      setAnalysis(dataAnalysis);
      setLoading(false);
      
      initialLoadCompleted.current = true;
      
      const shouldRetry = dataAnalysis.isPartial && 
                        canRefresh && 
                        retryCountRef.current < maxRetries;
      
      setAutoRetrying(shouldRetry);
      
      if (shouldRetry) {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          if (isOpen) {
            fetchStats(true);
          }
        }, 5000);
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      
      setError(err);
      setLoading(false);
      setAutoRetrying(false);
    } finally {
      isLoadingRef.current = false;
    }
  }, [repositoryId, maxRetries, isOpen]);
  
  const handleRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    retryCountRef.current = 0;
    setRetryCount(0);
    setStats(null);
    setAnalysis(null);
    setError(null);
    setAutoRetrying(false);
    initialLoadCompleted.current = false;
    fetchStats();
  }, [fetchStats]);
  
  useEffect(() => {
    if (isOpen) {
      if (!initialLoadCompleted.current) {
        retryCountRef.current = 0;
        setRetryCount(0);
        fetchStats();
      }
    } else {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      retryCountRef.current = 0;
      setRetryCount(0);
      setAutoRetrying(false);
      initialLoadCompleted.current = false;
      requestIdRef.current = 0;
    }
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [isOpen, fetchStats]);

  return {
    formattedStats,
    stats,
    analysis,
    loading,
    error,
    isPartialData: analysis?.isPartial || false,
    canRefresh: analysis ? canRefreshForMissingData(analysis) : false,
    missingFields: analysis?.missingFields || [],
    isEmpty: analysis?.isEmpty || false,
    autoRetrying,
    handleRetry
  };
}
