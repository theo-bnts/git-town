/**
 * Configuration globale de l'application
 */

// Configuration des statistiques
export const STATISTICS_CONFIG = {
  CACHE_INFO_TEXT: "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. " +
    "Les données peuvent présenter un retard jusqu'à une heure."
};

// Valeurs par défaut pour les statistiques
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

// Configuration des requêtes API
export const REPOSITORY_STATS_CONFIG = {
  standard: {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 1.5,
  },
  background: {
    maxRetries: 6,
    initialDelay: 2000,
    backoffFactor: 1.5,
  }
};
