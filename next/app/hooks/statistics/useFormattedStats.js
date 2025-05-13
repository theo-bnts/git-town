import { useMemo } from 'react';
import { calculateStats, generateGlobalStatsFromUsers } from '@/app/utils/statisticsUtils';

/**
 * Hook qui prépare toutes les données statistiques formatées
 */
export function useFormattedStats(rawStats) {
  return useMemo(() => {
    if (!rawStats) return null;
    
    // Vérifie si les stats globales sont présentes
    const hasGlobalData = Boolean(
      rawStats?.Global?.Commits?.Weekly?.Counts && 
      rawStats?.Global?.Lines?.Weekly?.Counts
    );
    
    // Récupère ou génère les stats globales
    const globalStats = hasGlobalData 
      ? rawStats.Global 
      : generateGlobalStatsFromUsers(rawStats?.Users);
    
    // Calcule les statistiques globales
    const teamStats = calculateStats(globalStats, { 
      isTeam: true, 
      users: rawStats?.Users 
    });
    
    // Calcule les statistiques par utilisateur et inclut les données brutes
    const userStats = (rawStats?.Users || []).map(user => ({
      user: user.User,
      stats: calculateStats(user),
      rawData: user
    }));
    
    const hasUserCommits = userStats?.some(user => user.stats.totalCommits > 0);

    return {
      globalStats,
      teamStats,
      userStats,
      hasUsers: Array.isArray(rawStats?.Users) && rawStats.Users.length > 0,
      hasGlobalData,
      hasUserCommits,
      languages: rawStats?.Global?.Languages || []
    };
  }, [rawStats]);
}
