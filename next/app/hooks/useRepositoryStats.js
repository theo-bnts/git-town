'use client';

import { useMemo, useCallback } from 'react';
import { calculateDelta } from '@/app/utils/calculateDelta';

/**
 * Hook personnalisé pour le traitement des données statistiques d'un dépôt
 * @param {Object} stats - Données statistiques du dépôt
 * @returns {Object} Données statistiques traitées et fonctions utilitaires
 */
export function useRepositoryStats(stats) {
  const hasUserCommits = useMemo(() => 
    stats?.Users?.some(user => 
      user.Commits?.Weekly?.Counts?.some(count => count > 0)
    ) || false,
    [stats]
  );

  const getLineStatistics = (user) => {
    let addedLines = 0;
    let deletedLines = 0;
    
    if (user.Lines?.Total) {
      addedLines = user.Lines.Total.Additions || 0;
      deletedLines = user.Lines.Total.Deletions || 0;
    } 
    else if (user.Lines?.Weekly?.Counts) {
      const lineCounts = user.Lines.Weekly.Counts;
      addedLines = lineCounts.reduce((sum, week) => sum + (week.Additions || 0), 0);
      deletedLines = lineCounts.reduce((sum, week) => sum + (week.Deletions || 0), 0);
    }
    
    return { addedLines, deletedLines };
  };

  const calculateUserTotals = useCallback((user) => {
    if (!user || !user.Commits?.Weekly?.Counts) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0, delta: 0 };
    }
    
    const counts = user.Commits.Weekly.Counts || [];
    const totalCommits = Array.isArray(counts) 
      ? counts.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0)
      : 0;
    
    const { addedLines, deletedLines } = getLineStatistics(user);
    const delta = calculateDelta(addedLines, deletedLines);
    
    return { totalCommits, addedLines, deletedLines, delta };
  }, []);

  const calculateTeamTotals = useCallback(() => {
    if (!stats?.Global) {
      return { totalCommits: 0, totalPullRequests: 0, addedLines: 0, deletedLines: 0, delta: 0 };
    }
    
    const commitsArray = stats.Global.Commits?.Weekly?.Counts || [];
    const totalCommits = commitsArray.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0);
    
    const totalPullRequests = (stats.Global.PullRequests?.Open || 0) + 
                              (stats.Global.PullRequests?.Closed || 0);
    
    let addedLines = 0;
    let deletedLines = 0;
    
    const linesCounts = stats.Global.Lines?.Weekly?.Counts || [];
    addedLines = linesCounts.reduce((sum, week) => sum + (week?.Additions || 0), 0);
    deletedLines = linesCounts.reduce((sum, week) => sum + (week?.Deletions || 0), 0);
    
    const delta = calculateDelta(addedLines, deletedLines);
    
    return { totalCommits, totalPullRequests, addedLines, deletedLines, delta };
  }, [stats]);

  const calculateContributorTotals = useCallback((contributor) => {
    if (contributor === stats?.Global) {
      return calculateTeamTotals();
    }
    return calculateUserTotals(contributor);
  }, [calculateUserTotals, calculateTeamTotals, stats]);

  return { hasUserCommits, calculateUserTotals, calculateTeamTotals, calculateContributorTotals };
}
