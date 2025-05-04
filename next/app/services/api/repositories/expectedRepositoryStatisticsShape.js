/**
 * Structure attendue des données de statistiques d'un dépôt
 * Utilisée pour vérifier la complétude des données reçues de l'API
 */
export const expectedShape = {
  Global: {
    Commits: {
      Weekly: {
        FirstDayOfFirstWeek: true,
        FirstDayOfLastWeek: true,
        Counts: true,
      },
      Total: {
        Count: true,
      },
    },
    Lines: {
      Total: {
        Additions: true,
        Deletions: true,
      },
      Weekly: {
        FirstDayOfFirstWeek: true,
        Counts: true,
      },
    },
    Languages: true,
  },
  Users: [{
    User: {
      Id: true,
      FullName: true,
      Email: true,
    },
    Commits: {
      Weekly: {
        FirstDayOfFirstWeek: true,
        Counts: true,
      },
      Total: true,
    },
    Lines: {
      Total: {
        Additions: true,
        Deletions: true,
      },
      Weekly: {
        Counts: true,
      },
    },
  }],
};

/**
 * Version minimale de la structure pour continuer avec des fonctionnalités réduites
 */
export const minimumExpectedShape = {
  Global: {
    Commits: {
      Weekly: {
        Counts: true,
      },
    },
    Languages: true,
  },
  Users: true,
};
