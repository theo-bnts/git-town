'use client';

import { useMemo, useCallback } from 'react';
import { calculateDelta } from '@/app/utils/calculateDelta';
import { extractLineStatistics } from '@/app/utils/statisticsUtils';

/**
 * Hook personnalisé pour le traitement des données statistiques d'un dépôt
 */
export function useRepositoryStats(stats) {
  const hasUserCommits = useMemo(() => 
    stats?.Users?.some(user => 
      user.Commits?.Weekly?.Counts?.some(count => count > 0)
    ) || false,
    [stats]
  );

  /**
   * Calcule les statistiques totales pour un utilisateur
   */
  const calculateUserTotals = useCallback((user) => {
    if (!user || !user.Commits?.Weekly?.Counts) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0, delta: 0 };
    }
    
    const counts = user.Commits.Weekly.Counts || [];
    const totalCommits = Array.isArray(counts) 
      ? counts.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0)
      : 0;
    
    const { addedLines, deletedLines } = extractLineStatistics(user);
    const delta = calculateDelta(addedLines, deletedLines);
    
    return { totalCommits, addedLines, deletedLines, delta };
  }, []);

  /**
   * Calcule les statistiques totales pour l'équipe
   */
  const calculateTeamTotals = useCallback(() => {
    if (!stats?.Global) {
      return { 
        totalCommits: 0, 
        totalPullRequests: 0, 
        addedLines: 0, 
        deletedLines: 0, 
        delta: 0 
      };
    }
    
    const commitsArray = stats.Global.Commits?.Weekly?.Counts || [];
    const totalCommits = commitsArray.reduce(
      (sum, count) => sum + (Number.isFinite(count) ? count : 0),
      0
    );
    
    const totalPullRequests = (stats.Global.PullRequests?.Open || 0) + 
                             (stats.Global.PullRequests?.Closed || 0);
    
    const { addedLines, deletedLines } = extractLineStatistics(stats.Global);
    const delta = calculateDelta(addedLines, deletedLines);
    
    return { totalCommits, totalPullRequests, addedLines, deletedLines, delta };
  }, [stats]);

  return { 
    hasUserCommits, 
    calculateUserTotals, 
    calculateTeamTotals
  };
}
