/**
 * Utilitaires pour le calcul des statistiques
 */

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
 * @param {Array} data - Tableau de données
 * @param {string} key - Clé de la propriété à additionner
 * @returns {number} - Somme des valeurs
 */
export function calculateTotal(data, key) {
  if (!Array.isArray(data) || !data.length) return 0;
  return data.reduce((sum, item) => sum + (Number.isFinite(item?.[key]) ? item[key] : 0), 0);
}

/**
 * Extrait les statistiques de lignes (ajoutées/supprimées) d'une entité
 * @param {Object} entity - Objet contenant les statistiques
 * @returns {Object} - Statistiques extraites
 */
export function extractLineStatistics(entity) {
  if (!entity) {
    return { addedLines: 0, deletedLines: 0 };
  }
  
  let addedLines = 0;
  let deletedLines = 0;
  
  if (entity.Lines?.Total) {
    addedLines = entity.Lines.Total.Additions || 0;
    deletedLines = entity.Lines.Total.Deletions || 0;
  } 
  else if (entity.Lines?.Weekly?.Counts) {
    const lineCounts = entity.Lines.Weekly.Counts;
    addedLines = lineCounts.reduce((sum, week) => sum + (week?.Additions || 0), 0);
    deletedLines = lineCounts.reduce((sum, week) => sum + (week?.Deletions || 0), 0);
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
 * Génère des statistiques globales à partir des données utilisateurs
 * @param {Array} users - Tableau d'utilisateurs
 * @returns {Object} - Statistiques globales agrégées
 */
export function generateGlobalStatsFromUsers(users) {
  if (!users || users.length === 0) return null;
  
  // Trouver un utilisateur avec des données de dates
  const userWithDates = users.find(user => 
    user?.Commits?.Weekly?.FirstDayOfFirstWeek && 
    user?.Lines?.Weekly?.FirstDayOfFirstWeek
  );
  
  // Créer la structure de base
  const globalStats = {
    Commits: {
      Weekly: {
        Counts: [],
        FirstDayOfFirstWeek: userWithDates?.Commits?.Weekly?.FirstDayOfFirstWeek || 
                          new Date().toISOString(),
        FirstDayOfLastWeek: userWithDates?.Commits?.Weekly?.FirstDayOfLastWeek
      }
    },
    Lines: {
      Weekly: {
        Counts: [],
        FirstDayOfFirstWeek: userWithDates?.Lines?.Weekly?.FirstDayOfFirstWeek || 
                          new Date().toISOString()
      }
    }
  };
  
  // Déterminer la longueur maximale des tableaux
  const weeksCount = Math.max(...users.map(
    user => user?.Commits?.Weekly?.Counts?.length || 0
  ));
  
  // Initialiser les tableaux
  for (let i = 0; i < weeksCount; i++) {
    globalStats.Commits.Weekly.Counts[i] = 0;
    globalStats.Lines.Weekly.Counts[i] = { Additions: 0, Deletions: 0 };
  }
  
  // Agréger les données
  users.forEach(user => {
    // Commits
    if (user?.Commits?.Weekly?.Counts) {
      user.Commits.Weekly.Counts.forEach((count, index) => {
        if (index < weeksCount) {
          globalStats.Commits.Weekly.Counts[index] += count || 0;
        }
      });
    }
    
    // Lignes
    if (user?.Lines?.Weekly?.Counts) {
      user.Lines.Weekly.Counts.forEach((line, index) => {
        if (index < weeksCount && line) {
          globalStats.Lines.Weekly.Counts[index].Additions += line.Additions || 0;
          globalStats.Lines.Weekly.Counts[index].Deletions += line.Deletions || 0;
        }
      });
    }
  });
  
  return globalStats;
}
