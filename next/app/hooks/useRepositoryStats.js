'use client';

import { useMemo, useCallback } from 'react';
import { calculateDelta } from '@/app/utils/calculateDelta';
import { extractLineStatistics, safeArraySum } from '@/app/utils/statisticsUtils';

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

  const calculateEntityStats = useCallback((entity, isTeam = false) => {
    if (!entity) {
      return { 
        totalCommits: 0, 
        addedLines: 0, 
        deletedLines: 0, 
        delta: 0,
        totalPullRequests: 0
      };
    }
    
    const counts = entity.Commits?.Weekly?.Counts || [];
    const totalCommits = safeArraySum(counts);
    
    const { addedLines, deletedLines } = extractLineStatistics(entity);
    const delta = calculateDelta(addedLines, deletedLines);
    const totalPullRequests = (entity.PullRequests?.Open || 0) + 
                             (entity.PullRequests?.Closed || 0);
    
    return { 
      totalCommits, 
      totalPullRequests, 
      addedLines, 
      deletedLines, 
      delta,
      membersCount: isTeam && Array.isArray(entity.Users) ? entity.Users.length : 0
    };
  }, []);

  const calculateUserTotals = useCallback((user) => {
    return calculateEntityStats(user);
  }, [calculateEntityStats]);

  const calculateTeamTotals = useCallback(() => {
    return calculateEntityStats(stats?.Global, true);
  }, [calculateEntityStats, stats]);

  return { 
    hasUserCommits, 
    calculateUserTotals, 
    calculateTeamTotals,
    calculateEntityStats
  };
}
