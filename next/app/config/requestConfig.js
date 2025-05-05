/**
 * Configuration des paramètres de requêtes API
 */
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
