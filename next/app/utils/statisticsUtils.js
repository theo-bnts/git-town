/**
 * Utilitaires pour le calcul des statistiques
 */

import { calculateDelta } from "@/app/utils/deltaUtils";
import { DEFAULT_STATS } from "@/app/config/config";

/**
 * Calcule la somme des valeurs d'un tableau en gérant les cas spéciaux
 */
export function safeArraySum(array, accessor = null) {
  if (!Array.isArray(array) || array.length === 0) return 0;
  
  return array.reduce((sum, item) => {
    const value = accessor ? accessor(item) : item;
    const numberValue = Number.isFinite(value) ? value : 0;
    return sum + numberValue;
  }, 0);
}

/**
 * Extraction de statistiques optimisée
 */
export function extractLineStatistics(entity) {
  if (!entity?.Lines?.Weekly?.Counts) {
    return { addedLines: 0, deletedLines: 0 };
  }
  
  const lineCounts = entity.Lines.Weekly.Counts;
  let addedLines = 0;
  let deletedLines = 0;
  
  for (let i = 0; i < lineCounts.length; i++) {
    const lineData = lineCounts[i];
    if (lineData) {
      addedLines += lineData.Additions || 0;
      deletedLines += lineData.Deletions || 0;
    }
  }
  
  return { addedLines, deletedLines };
}

/**
 * Fonction unifiée pour calculer les statistiques d'une entité (utilisateur ou équipe)
 */
export function calculateStats(entity, options = {}) {
  const { isTeam = false, users = [] } = options;
  
  if (!entity) {
    return isTeam ? {...DEFAULT_STATS.team} : {...DEFAULT_STATS.user};
  }
  
  let totalCommits;
  
  if (isTeam && entity.TotalCommits !== undefined) {
    totalCommits = entity.TotalCommits;
  } else {
    const counts = entity.Commits?.Weekly?.Counts || [];
    totalCommits = safeArraySum(counts);
  }
  
  const { addedLines, deletedLines } = extractLineStatistics(entity);
  const delta = calculateDelta(addedLines, deletedLines);
  
  const merges = entity.PullRequests?.Closed || 0;
  const pullRequests = (entity.PullRequests?.Open || 0) + merges;
  
  return { 
    totalCommits, 
    addedLines, 
    deletedLines, 
    delta,
    pullRequests,
    merges,
    membersCount: isTeam && Array.isArray(users) ? users.length : 0
  };
}

/**
 * Génère des statistiques globales à partir des statistiques des utilisateurs
 */
export function generateGlobalStatsFromUsers(users = []) {
  if (!Array.isArray(users) || users.length === 0) {
    return null;
  }
  
  const aggregatedStats = {
    Commits: {
      Weekly: { 
        Counts: [], 
        FirstDayOfFirstWeek: null 
      }
    },
    Lines: {
      Weekly: { 
        Counts: [] 
      }
    },
    PullRequests: {
      Open: 0,
      Closed: 0
    }
  };
  
  const firstUserWithCommits = users.find(u => u.Commits?.Weekly?.Counts?.length > 0);
  
  if (firstUserWithCommits) {
    aggregatedStats.Commits.Weekly.FirstDayOfFirstWeek = 
      firstUserWithCommits.Commits.Weekly.FirstDayOfFirstWeek;
    
    const maxLength = Math.max(
      ...users.map(u => (u.Commits?.Weekly?.Counts?.length || 0))
    );
    
    for (let i = 0; i < maxLength; i++) {
      aggregatedStats.Commits.Weekly.Counts[i] = 0;
      aggregatedStats.Lines.Weekly.Counts[i] = { Additions: 0, Deletions: 0 };
    }
    
    users.forEach(user => {
      if (user.Commits?.Weekly?.Counts) {
        user.Commits.Weekly.Counts.forEach((count, idx) => {
          if (idx < aggregatedStats.Commits.Weekly.Counts.length) {
            aggregatedStats.Commits.Weekly.Counts[idx] += (count || 0);
          }
        });
      }
      
      if (user.Lines?.Weekly?.Counts) {
        user.Lines.Weekly.Counts.forEach((lineData, idx) => {
          if (idx < aggregatedStats.Lines.Weekly.Counts.length) {
            aggregatedStats.Lines.Weekly.Counts[idx].Additions += (lineData?.Additions || 0);
            aggregatedStats.Lines.Weekly.Counts[idx].Deletions += (lineData?.Deletions || 0);
          }
        });
      }
      
      aggregatedStats.PullRequests.Open += (user.PullRequests?.Open || 0);
      aggregatedStats.PullRequests.Closed += (user.PullRequests?.Closed || 0);
    });
  }
  
  return aggregatedStats;
}
