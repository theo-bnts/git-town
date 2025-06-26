/**
 * Configuration globale de l'application
 */

// Configuration des statistiques
export const STATISTICS_CONFIG = {
  CACHE_INFO_TEXT: "Ces données peuvent venir du cache pour que votre expérience ne soit pas ralentie. " +
    "Les données peuvent présenter un retard jusqu'à une heure.",
  ERROR_MESSAGES: {
    GATEWAY_TIMEOUT: "Le serveur a mis trop de temps à répondre. Le dépôt est peut-être trop volumineux ou vide.",
    LOADING_FAILED: "Le chargement des statistiques a échoué. Le dépôt est peut-être vide ou l'API GitHub n'est pas disponible."
  },
  PARTIAL_DATA_MESSAGES: {
    AUTO_RETRYING: "Récupération automatique des données manquantes en cours...",
    MANUAL_REFRESH: "Certaines statistiques sont en cours de calcul par GitHub. Vous pouvez rafraîchir pour tenter de récupérer les données manquantes."
  },
  LOADING: {
    TIMEOUT_THRESHOLD: 10,
    FIRST_WARNING_THRESHOLD: 5,
    SECOND_WARNING_THRESHOLD: 8,
    MESSAGES: {
      AUTO_RETRYING_TITLE: "Amélioration des données...",
      AUTO_RETRYING_SUBTITLE: "Récupération de données supplémentaires en cours. L'affichage sera automatiquement mis à jour.",
      STANDARD_TITLE: "Chargement des statistiques...",
      STANDARD_SUBTITLE: "Veuillez patienter pendant la récupération des données.",
      LONG_WAIT_WARNING: "Le chargement prend plus de temps que prévu...",
      VERY_LONG_WAIT_WARNING: "Le dépôt est peut-être vide ou contient peu de commits."
    }
  }
};

// Valeurs espérées
export const EXPECTED_STRUCTURE = {
  Global: {
    Commits: {
      Weekly: {
        FirstDayOfFirstWeek: true,
        Counts: 'array'
      }
    },
    Lines: {
      Weekly: {
        Counts: 'array'
      }
    },
    Languages: 'object'
  },
  Users: 'array'
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
