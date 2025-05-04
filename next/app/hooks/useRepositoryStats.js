'use client';

import { useMemo, useCallback } from 'react';

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

  /**
   * Calcule les statistiques totales pour un utilisateur
   * @param {Object} user - Données de l'utilisateur
   * @returns {Object} Statistiques calculées (commits, lignes, ratio)
   */
  const calculateUserTotals = useCallback((user) => {
    if (!user || !user.Commits?.Weekly?.Counts) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0, ratio: 0 };
    }
    
    const counts = user.Commits.Weekly.Counts || [];
    const totalCommits = Array.isArray(counts) 
      ? counts.reduce((sum, count) => sum + (Number.isFinite(count) ? count : 0), 0)
      : 0;
    
    const { addedLines, deletedLines } = getLineStatistics(user);
    
    const ratio = calculateRatio(addedLines, deletedLines);
    
    return { totalCommits, addedLines, deletedLines, ratio };
  }, []);

  const calculateRatio = (added, deleted) => {
    if (deleted === 0) {
      return added > 0 ? Infinity : 0;
    }
    return Math.round((added / deleted) * 100) / 100;
  };

  return { hasUserCommits, calculateUserTotals };
}
