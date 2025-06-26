'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import { formatStatistics } from '@/app/utils/statisticsFormatter';
import { analyzeStatistics, canRefreshForMissingData } from '@/app/utils/statisticsAnalyzer';

export function useRepositoryStats(repositoryId, isOpen, options = {}) {
  // Références pour le contrôle des appels et les timeouts
  const initialLoadCompleted = useRef(false);
  const retryTimeoutRef = useRef(null);
  const isLoadingRef = useRef(false);
  const requestIdRef = useRef(0);
  // Utiliser une ref pour suivre le nombre actuel de tentatives (évite les problèmes de closure)
  const retryCountRef = useRef(0);
  
  const token = useAuthToken();
  
  // États
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [autoRetrying, setAutoRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Options de simulation et configuration
  const { simulateMode = null, maxRetries = 3 } = options;
  
  const formattedStats = stats ? formatStatistics(stats) : null;
  
  // Fonction pour charger les statistiques
  const fetchStats = useCallback(async (isRetry = false) => {
    // Si on est déjà en train de charger, ne pas lancer un nouvel appel
    if (isLoadingRef.current) {
      console.log('[Stats] Requête ignorée - chargement déjà en cours');
      return;
    }
    
    // Calculer le compteur de tentatives actuel
    const currentRetryCount = isRetry ? retryCountRef.current : 0;
    
    // Si on recommence à zéro (pas un retry), réinitialiser le compteur
    if (!isRetry) {
      retryCountRef.current = 0;
      setRetryCount(0);
    }
    
    // Vérifier si on a déjà dépassé le nombre maximum de tentatives
    if (isRetry && currentRetryCount >= maxRetries) {
      console.log(`[Stats] Requête ignorée - nombre maximum de tentatives (${maxRetries}) déjà atteint`);
      setAutoRetrying(false);
      return;
    }
    
    // Incrémenter le compteur uniquement si c'est une nouvelle tentative
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
      console.log(`[Stats] Chargement des statistiques${isRetry ? ` (tentative ${retryCountRef.current}/${maxRetries})` : ''}`);
      
      const preventRetry = simulateMode === 'minimal' || simulateMode === 'empty';
      const data = await fetchRepositoryStatistics(repositoryId, { simulateMode });
      
      // Ignorer les résultats d'appels obsolètes
      if (currentRequestId !== requestIdRef.current) {
        console.log(`[Stats] Requête ${currentRequestId} abandonnée, courante: ${requestIdRef.current}`);
        return;
      }
      
      // Analyser les données
      const dataAnalysis = analyzeStatistics(data);
      const canRefresh = canRefreshForMissingData(dataAnalysis);
      
      // Mettre à jour l'état
      setStats(data);
      setAnalysis(dataAnalysis);
      setLoading(false);
      
      // Marquer comme chargé
      initialLoadCompleted.current = true;
      
      // Log pour debugging
      console.log('[Stats] Analyse des données:', {
        isPartial: dataAnalysis.isPartial,
        canRefresh,
        isEmpty: dataAnalysis.isEmpty,
        hasUndefinedData: dataAnalysis.hasUndefinedData,
        missingFields: dataAnalysis.missingFields,
      });
      
      // Vérifier si une nouvelle tentative est nécessaire
      const shouldRetry = !preventRetry && 
                        dataAnalysis.isPartial && 
                        canRefresh && 
                        retryCountRef.current < maxRetries;
      
      setAutoRetrying(shouldRetry);
      
      // Si on atteint le nombre max de tentatives, indiquer clairement que c'est terminé
      if (!shouldRetry && dataAnalysis.isPartial && canRefresh && retryCountRef.current >= maxRetries) {
        console.log(`[Stats] Nombre maximum de tentatives (${maxRetries}) atteint. Affichage des données partielles.`);
      }
      
      if (shouldRetry) {
        console.log(`[Stats] Données partielles, tentative ${retryCountRef.current}/${maxRetries} programmée dans 5s`);
        
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
      // Ignorer les erreurs d'appels obsolètes
      if (currentRequestId !== requestIdRef.current) return;
      
      console.error("[Stats] Erreur lors du chargement:", err);
      setError(err);
      setLoading(false);
      setAutoRetrying(false);
    } finally {
      isLoadingRef.current = false;
    }
  }, [repositoryId, simulateMode, maxRetries, isOpen]);
  
  // Réessayer manuellement
  const handleRetry = useCallback(() => {
    // Annuler tout timer d'auto-retry en cours
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Réinitialiser tous les états et les références
    retryCountRef.current = 0;
    setRetryCount(0);
    setStats(null);
    setAnalysis(null);
    setError(null);
    setAutoRetrying(false);
    initialLoadCompleted.current = false;
    fetchStats();
  }, [fetchStats]);
  
  // Effet pour gérer l'ouverture/fermeture du modal
  useEffect(() => {
    if (isOpen) {
      if (!initialLoadCompleted.current) {
        // Première ouverture ou retry manuel - s'assurer que les compteurs sont à zéro
        retryCountRef.current = 0;
        setRetryCount(0);
        fetchStats();
      }
    } else {
      // Nettoyage à la fermeture
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Réinitialiser tous les états et refs liés aux tentatives
      retryCountRef.current = 0;
      setRetryCount(0);
      setAutoRetrying(false);
      initialLoadCompleted.current = false;
      // Réinitialiser également l'ID de requête pour éviter les conflits futurs
      requestIdRef.current = 0;
    }
    
    // Nettoyage lors du démontage
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
