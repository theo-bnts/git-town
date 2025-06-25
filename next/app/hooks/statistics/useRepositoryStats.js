'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import { formatStatistics } from '@/app/utils/statisticsFormatter';
import { analyzeStatistics, canRefreshForMissingData } from '@/app/utils/statisticsAnalyzer';

// Créer un store centralisé pour les statistiques
const statsStore = new Map();

export function useRepositoryStats(repositoryId, isOpen, options = {}) {
  const token = useAuthToken();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  
  // Référence pour éviter les doubles appels
  const loadingRef = useRef(false);
  
  // Référence pour mémoriser les dépôts vides
  const isEmptyRef = useRef(false);
  
  // Options de simulation et configuration
  const { simulateMode = null, maxRetries = 3 } = options;
  
  const formattedStats = stats ? formatStatistics(stats) : null;
  
  const handleRetry = useCallback(() => {
    // Réinitialiser l'état pour une nouvelle tentative manuelle
    if (!isEmptyRef.current) {
      setLoadAttempt(0);
      setStats(null);
      setError(null);
      setLoading(true);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Vérifier si les stats sont déjà en cache
    if (statsStore.has(repositoryId)) {
      const cachedData = statsStore.get(repositoryId);
      setStats(cachedData.stats);
      setAnalysis(cachedData.analysis);
      setLoading(false);
      
      // Si les données sont partielles, on peut rafraîchir plus tard
      // mais pas immédiatement pour éviter le spam
      if (cachedData.analysis?.isPartial && !cachedData.refreshing) {
        // Mettre à jour le cache avec un flag de rafraîchissement
        statsStore.set(repositoryId, { ...cachedData, refreshing: true });
        
        // Planifier un rafraîchissement après un délai
        setTimeout(() => {
          // Permettre un nouveau chargement plus tard
          statsStore.set(repositoryId, { ...statsStore.get(repositoryId), refreshing: false });
        }, 30000); // 30 secondes minimum entre les rafraîchissements
      }
      
      return;
    }
    
    let cancelled = false;
    let retryTimeout = null;

    async function loadStats() {
      // Éviter les doubles appels et les appels pour les dépôts vides
      if (loadingRef.current || cancelled || isEmptyRef.current) {
        if (isEmptyRef.current) {
          setLoading(false);
        }
        return;
      }
      
      loadingRef.current = true;
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
        
        // Identifier explicitement les dépôts vides pour éviter de futurs appels
        if (dataAnalysis.isEmpty) {
          console.log(`[Stats] Dépôt ${repositoryId} identifié comme vide, arrêt des tentatives`);
          isEmptyRef.current = true;
        }
        
        // Stocker les données immédiatement
        setStats(data);
        
        // Déterminer si une nouvelle tentative est nécessaire
        const shouldRetry = !preventRetry && 
                           !dataAnalysis.isEmpty &&
                           dataAnalysis.isPartial && 
                           canRefreshForMissingData(dataAnalysis) && 
                           loadAttempt < maxRetries;
        
        if (shouldRetry) {
          console.log(`[Stats] Données partielles, nouvel essai ${loadAttempt + 1}/${maxRetries} dans 5s`);
          setLoadAttempt(prev => prev + 1);
          
          retryTimeout = setTimeout(() => {
            loadingRef.current = false; // Permettre une nouvelle tentative
            if (!cancelled) {
              loadStats();
            }
          }, 5000); // 5 secondes entre les tentatives
        } else {
          // Marquer le chargement comme terminé
          setLoading(false);
          loadingRef.current = false;
        }
      } catch (err) {
        if (cancelled) return;
        
        console.error("[Stats] Erreur lors du chargement:", err);
        setError(err);
        setLoading(false);
        loadingRef.current = false;
        
        // Identifier les erreurs indiquant un dépôt vide
        if (err.code === "NO_GITHUB_DATA" || 
            err.message?.includes("Aucune donnée") || 
            err.message?.includes("No GitHub data")) {
          console.log(`[Stats] Dépôt ${repositoryId} marqué comme vide suite à une erreur`);
          isEmptyRef.current = true;
        }
      }
    }

    if (isOpen) {
      if (!simulateMode && !isEmptyRef.current) {
        setStats(null);
        setLoadAttempt(0);
      }
      
      if (!isEmptyRef.current) {
        loadStats();
      } else {
        // Pour les dépôts vides déjà identifiés, ne pas charger
        setLoading(false);
      }
    }

    return () => { 
      cancelled = true; 
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isOpen, repositoryId, loadAttempt, simulateMode, maxRetries]);

  return {
    formattedStats,
    stats,
    analysis,
    loading,
    error,
    isPartialData: analysis?.isPartial || false,
    canRefresh: analysis ? canRefreshForMissingData(analysis) : false,
    missingFields: analysis?.missingFields || [],
    isEmpty: isEmptyRef.current || analysis?.isEmpty || false,
    handleRetry
  };
}
