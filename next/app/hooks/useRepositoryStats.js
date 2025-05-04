'use client';

import { useMemo, useCallback } from 'react';

/**
 * Hook personnalisé pour le traitement des données statistiques d'un dépôt
 * @param {Object} stats - Données statistiques du dépôt
 * @returns {Object} Données statistiques traitées et fonctions utilitaires
 */
export function useRepositoryStats(stats) {
  const hasUserCommits = useMemo(() => 
    Boolean(stats?.Users?.some(user => 
      user.Commits?.Weekly?.Counts?.some(count => count > 0)
    )),
    [stats]
  );

  /**
   * Calcule les statistiques totales pour un utilisateur
   * @param {Object} user - Données de l'utilisateur
   * @returns {Object} Statistiques calculées (commits, lignes, ratio)
   */
  const calculateUserTotals = useCallback((user) => {
    if (!user || !user.Commits?.Weekly?.Counts) {
      return { totalCommits: 0, addedLines: 0, deletedLines: 0, ratio: 0 };
    }
    
    // Calcul du total des commits
    const totalCommits = user.Commits.Weekly.Counts.reduce((sum, count) => sum + count, 0);
    
    // Calcul des lignes ajoutées/supprimées
    let addedLines = 0;
    let deletedLines = 0;
    
    // Cas 1: Total directement disponible
    if (user.Lines?.Total) {
      addedLines = user.Lines.Total.Additions || 0;
      deletedLines = user.Lines.Total.Deletions || 0;
    } 
    // Cas 2: Calcul à partir des données hebdomadaires
    else if (user.Lines?.Weekly?.Counts) {
      const lineCounts = user.Lines.Weekly.Counts;
      addedLines = lineCounts.reduce((sum, week) => sum + (week.Additions || 0), 0);
      deletedLines = lineCounts.reduce((sum, week) => sum + (week.Deletions || 0), 0);
    }
    
    // Calcul du ratio (éviter la division par zéro)
    let ratio = 0;
    if (deletedLines > 0) {
      ratio = parseFloat((addedLines / deletedLines).toFixed(2));
    } else if (addedLines > 0) {
      ratio = Infinity;
    }
    
    return { totalCommits, addedLines, deletedLines, ratio };
  }, []);

  return { hasUserCommits, calculateUserTotals };
}
