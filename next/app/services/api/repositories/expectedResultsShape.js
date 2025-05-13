/**
 * Structure attendue des données de statistiques d'un dépôt
 */
export const REPOSITORY_STATISTICS_SHAPES = {
  // Structure complète attendue pour un fonctionnement optimal
  complete: {
    Global: {
      Commits: {
        Weekly: {
          FirstDayOfFirstWeek: true,
          Counts: true,
        },
      },
      Lines: {
        Weekly: {
          Counts: true,
        },
      },
      Languages: true,
    },
    Users: [{
      User: {
        Id: true,
        FullName: true,
      },
      Commits: {
        Weekly: {
          Counts: true,
        },
      },
      Lines: {
        Weekly: {
          Counts: true,
        },
      },
    }],
  },
  
  // Structure minimale pour fonctionner avec des fonctionnalités limitées
  minimal: {
    Global: {
      Commits: {
        Weekly: {
          Counts: true,
        },
      },
    },
    Users: true,
  }
};
