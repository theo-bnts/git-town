'use client';

import { useState, useEffect, useCallback } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import { formatStatistics } from '@/app/utils/statisticsFormatter';
import { analyzeStatistics, canRefreshForMissingData } from '@/app/utils/statisticsAnalyzer';

export function useRepositoryStats(repositoryId, isOpen, options = {}) {
  const token = useAuthToken();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  
  // Options de simulation et configuration
  const { simulateMode = null, maxRetries = 3 } = options;
  
  const formattedStats = stats ? formatStatistics(stats) : null;
  
  const handleRetry = useCallback(() => {
    // Réinitialiser l'état pour une nouvelle tentative manuelle
    setLoadAttempt(0);
    setStats(null);
    setError(null);
    setLoading(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimeout = null;

    async function loadStats() {
      setLoading(true);
      setError(null);
      
      try {
        // Pour les modes de simulation 'minimal' et 'empty', 
        // ne pas effectuer de tentatives supplémentaires
        const preventRetry = simulateMode === 'minimal' || simulateMode === 'empty';
        
        // Utiliser le mode de simulation si spécifié
        const data = await fetchRepositoryStatistics(repositoryId, { 
          simulateMode: simulateMode
        });
        
        if (cancelled) return;
        
        // Analyser les données pour déterminer si elles sont partielles
        const dataAnalysis = analyzeStatistics(data);
        setAnalysis(dataAnalysis);
        
        // Stocker les données immédiatement
        setStats(data);
        
        // Déterminer si une nouvelle tentative est nécessaire
        const shouldRetry = !preventRetry && 
                           dataAnalysis.isPartial && 
                           canRefreshForMissingData(dataAnalysis) && 
                           loadAttempt < maxRetries;
        
        if (shouldRetry) {
          console.log(`[Stats] Données partielles, nouvel essai ${loadAttempt + 1}/${maxRetries} dans 5s`);
          setLoadAttempt(prev => prev + 1);
          
          retryTimeout = setTimeout(() => {
            if (!cancelled) {
              loadStats();
            }
          }, 5000); // 5 secondes entre les tentatives
        } else {
          // Marquer le chargement comme terminé
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        
        console.error("[Stats] Erreur lors du chargement:", err);
        setError(err);
        setLoading(false);
      }
    }

    if (isOpen) {
      if (!simulateMode) {
        setStats(null);
        setLoadAttempt(0);
      }
      
      loadStats();
    }

    return () => { 
      cancelled = true; 
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isOpen, repositoryId, loadAttempt, simulateMode, maxRetries, token]);

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
    handleRetry
  };
}
