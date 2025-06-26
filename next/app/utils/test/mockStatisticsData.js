/**
 * Générateur de données statistiques partielles pour les tests
 */

// Données complètes (référence)
export const COMPLETE_STATS = {
  Global: {
    Commits: {
      Weekly: {
        FirstDayOfFirstWeek: "2024-06-01",
        Counts: [5, 7, 2, 0, 5, 9, 3]
      }
    },
    Lines: {
      Weekly: {
        Counts: [
          { Additions: 120, Deletions: 30 },
          { Additions: 80, Deletions: 50 },
          { Additions: 20, Deletions: 10 },
          { Additions: 0, Deletions: 0 },
          { Additions: 90, Deletions: 20 },
          { Additions: 150, Deletions: 40 },
          { Additions: 60, Deletions: 25 }
        ]
      }
    },
    Languages: {
      JavaScript: 70,
      CSS: 20,
      HTML: 10
    }
  },
  Users: [
    {
      User: {
        Id: "user-1",
        FullName: "Anne Lapujade"
      },
      Commits: {
        Weekly: {
          Counts: [3, 4, 1, 0, 2, 5, 2]
        }
      },
      Lines: {
        Weekly: {
          Counts: [
            { Additions: 80, Deletions: 20 },
            { Additions: 50, Deletions: 30 },
            { Additions: 15, Deletions: 5 },
            { Additions: 0, Deletions: 0 },
            { Additions: 60, Deletions: 10 },
            { Additions: 90, Deletions: 30 },
            { Additions: 40, Deletions: 15 }
          ]
        }
      },
      PullRequests: {
        Open: 2,
        Closed: 5
      }
    },
    {
      User: {
        Id: "user-2",
        FullName: "Maël Rhuin"
      },
      Commits: {
        Weekly: {
          Counts: [2, 3, 1, 0, 3, 4, 1]
        }
      },
      Lines: {
        Weekly: {
          Counts: [
            { Additions: 40, Deletions: 10 },
            { Additions: 30, Deletions: 20 },
            { Additions: 5, Deletions: 5 },
            { Additions: 0, Deletions: 0 },
            { Additions: 30, Deletions: 10 },
            { Additions: 60, Deletions: 10 },
            { Additions: 20, Deletions: 10 }
          ]
        }
      },
      PullRequests: {
        Open: 1,
        Closed: 3
      }
    }
  ]
};

// Données partielles (certaines sections sont undefined)
export const PARTIAL_STATS = {
  Global: {
    Commits: {
      Weekly: {
        FirstDayOfFirstWeek: "2024-06-01",
        Counts: [5, 7, 2, 0, 5, 9, 3]
      }
    },
    Lines: undefined,
    Languages: {
      JavaScript: 70,
      CSS: 20,
      HTML: 10
    }
  },
  Users: [
    {
      User: {
        Id: "user-1",
        FullName: "Anne Lapujade"
      },
      Commits: {
        Weekly: {
          Counts: [3, 4, 1, 0, 2, 5, 2]
        }
      },
      Lines: undefined,
      PullRequests: {
        Open: 2,
        Closed: 5
      }
    }
  ]
};

// Données minimales (juste assez pour afficher quelque chose)
export const MINIMAL_STATS = {
  Global: {
    Commits: {
      Weekly: {
        Counts: [5, 7, 2, 0, 5, 9, 3]
      }
    },
    Lines: undefined,
    Languages: undefined
  },
  Users: []
};

// Aucune donnée
export const EMPTY_STATS = {
  Global: {
    Commits: {
      Weekly: {
        Counts: []
      }
    },
    Lines: undefined,
    Languages: undefined
  },
  Users: []
};