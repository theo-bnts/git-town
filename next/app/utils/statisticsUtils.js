/**
 * Utilitaires pour le calcul des statistiques
 */
import { calculateDelta } from "./calculateDelta";

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
 * Calcule la somme des valeurs d'un tableau pour une propriété donnée
 */
export function calculateTotal(data, key) {
  if (!Array.isArray(data) || !data.length) return 0;
  return data.reduce((sum, item) => sum + (Number.isFinite(item?.[key]) ? item[key] : 0), 0);
}

/**
 * Extraction de statistiques optimisée avec memoization si nécessaire
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
 * Extrait et formate les données statistiques pour l'affichage
 */
export function formatUserStatistics(users) {
  if (!users || !Array.isArray(users)) return [];
  
  return users.map(user => {
    const name = user.User?.FullName || 'Inconnu';
    const email = user.User?.EmailAddress || '';
    
    const commits = safeArraySum(user.Commits?.Weekly?.Counts);
    const merges = user.PullRequests?.Closed || 0;
    const prs = (user.PullRequests?.Open || 0) + (user.PullRequests?.Closed || 0);
    
    const lines = user.Lines?.Weekly?.Counts || [];
    const additions = safeArraySum(lines, line => line?.Additions || 0);
    const deletions = safeArraySum(lines, line => line?.Deletions || 0);
    
    return {
      id: user.User?.Id || String(Math.random()),
      name,
      email,
      commits,
      merges,
      prs,
      additions,
      deletions
    };
  });
}

/**
 * Trouve un utilisateur avec des données temporelles valides
 */
function findUserWithDates(users) {
  return users.find(user => 
    user?.Commits?.Weekly?.FirstDayOfFirstWeek && 
    user?.Lines?.Weekly?.FirstDayOfFirstWeek
  );
}

/**
 * Crée la structure de base pour les statistiques globales
 */
function createEmptyGlobalStats(userWithDates) {
  const defaultDate = new Date().toISOString();
  return {
    Commits: {
      Weekly: {
        Counts: [],
        FirstDayOfFirstWeek: userWithDates?.Commits?.Weekly?.FirstDayOfFirstWeek || defaultDate,
        FirstDayOfLastWeek: userWithDates?.Commits?.Weekly?.FirstDayOfLastWeek
      }
    },
    Lines: {
      Weekly: {
        Counts: [],
        FirstDayOfFirstWeek: userWithDates?.Lines?.Weekly?.FirstDayOfFirstWeek || defaultDate
      }
    }
  };
}

/**
 * Calcule le nombre maximum de semaines dans les données utilisateurs
 */
function calculateMaxWeeks(users) {
  return Math.max(...users.map(
    user => user?.Commits?.Weekly?.Counts?.length || 0
  ));
}

/**
 * Initialise des tableaux de données vides pour les statistiques
 */
function initializeDataArrays(globalStats, weeksCount) {
  for (let i = 0; i < weeksCount; i++) {
    globalStats.Commits.Weekly.Counts[i] = 0;
    globalStats.Lines.Weekly.Counts[i] = { Additions: 0, Deletions: 0 };
  }
}

/**
 * Agrège les données de commits d'un utilisateur
 */
function aggregateUserCommits(user, globalStats, weeksCount) {
  if (user?.Commits?.Weekly?.Counts) {
    user.Commits.Weekly.Counts.forEach((count, index) => {
      if (index < weeksCount) {
        globalStats.Commits.Weekly.Counts[index] += count || 0;
      }
    });
  }
}

/**
 * Agrège les données de lignes d'un utilisateur
 */
function aggregateUserLines(user, globalStats, weeksCount) {
  if (user?.Lines?.Weekly?.Counts) {
    user.Lines.Weekly.Counts.forEach((line, index) => {
      if (index < weeksCount && line) {
        globalStats.Lines.Weekly.Counts[index].Additions += line.Additions || 0;
        globalStats.Lines.Weekly.Counts[index].Deletions += line.Deletions || 0;
      }
    });
  }
}

/**
 * Génère des statistiques globales à partir des données utilisateurs
 */
export function generateGlobalStatsFromUsers(users) {
  if (!users || users.length === 0) return null;
  
  const userWithDates = findUserWithDates(users);
  const globalStats = createEmptyGlobalStats(userWithDates);
  const weeksCount = calculateMaxWeeks(users);
  
  initializeDataArrays(globalStats, weeksCount);
  
  users.forEach(user => {
    aggregateUserCommits(user, globalStats, weeksCount);
    aggregateUserLines(user, globalStats, weeksCount);
  });
  
  return globalStats;
}

/**
 * Cache des résultats pour les calculs coûteux
 */
const statsCache = new Map();

/**
 * Calcule les statistiques utilisateur
 */
export function calculateUserStats(user) {
  if (!user) {
    return { 
      totalCommits: 0, 
      addedLines: 0, 
      deletedLines: 0, 
      delta: 0,
      pullRequests: 0,
      merges: 0
    };
  }
  
  const counts = user.Commits?.Weekly?.Counts || [];
  const totalCommits = safeArraySum(counts);
  
  const { addedLines, deletedLines } = extractLineStatistics(user);
  const delta = calculateDelta(addedLines, deletedLines);
  
  const merges = user.PullRequests?.Closed || 0;
  const pullRequests = (user.PullRequests?.Open || 0) + merges;
  
  const result = { 
    totalCommits, 
    addedLines, 
    deletedLines, 
    delta,
    pullRequests,
    merges
  };
  
  return result;
}

/**
 * Valeurs par défaut pour les statistiques
 */
export const DEFAULT_STATS = {
  user: {
    totalCommits: 0,
    addedLines: 0,
    deletedLines: 0,
    delta: 0,
    pullRequests: 0,
    merges: 0
  },
  team: {
    totalCommits: 0,
    addedLines: 0,
    deletedLines: 0,
    delta: 0,
    pullRequests: 0,
    merges: 0,
    membersCount: 0
  }
};

/**
 * Fournit des valeurs par défaut pour les statistiques d'une entité
 */
export function getDefaultStats(isTeam = false) {
  return isTeam ? {...DEFAULT_STATS.team} : {...DEFAULT_STATS.user};
}

/**
 * Calcule les statistiques globales de façon cohérente
 */
export function getGlobalCommitStats(stats) {
  if (!stats) return { 
    totalCommits: 0,
    addedLines: 0,
    deletedLines: 0,
    delta: 0,
    pullRequests: 0,
    merges: 0,
    membersCount: 0 
  };
  
  const membersCount = Array.isArray(stats.Users) ? stats.Users.length : 0;
  
  if (stats.Global?.Commits?.Weekly?.Counts) {
    const globalStats = calculateUserStats(stats.Global);
    return {
      ...globalStats,
      membersCount
    };
  }
  
  if (Array.isArray(stats.Users) && stats.Users.length > 0) {
    const totalCommits = stats.Users.reduce((sum, user) => {
      const userStats = calculateUserStats(user);
      return sum + userStats.totalCommits;
    }, 0);
    
    let totalAddedLines = 0;
    let totalDeletedLines = 0;
    let totalMerges = 0;
    let totalPRs = 0;
    
    stats.Users.forEach(user => {
      const userStats = calculateUserStats(user);
      totalAddedLines += userStats.addedLines;
      totalDeletedLines += userStats.deletedLines;
      totalMerges += userStats.merges;
      totalPRs += userStats.pullRequests;
    });
    
    const delta = calculateDelta(totalAddedLines, totalDeletedLines);
    
    return {
      totalCommits,
      addedLines: totalAddedLines,
      deletedLines: totalDeletedLines,
      delta,
      merges: totalMerges,
      pullRequests: totalPRs,
      membersCount
    };
  }
  
  return { 
    totalCommits: 0,
    addedLines: 0,
    deletedLines: 0,
    delta: 0,
    pullRequests: 0,
    merges: 0,
    membersCount: 0
  };
}
