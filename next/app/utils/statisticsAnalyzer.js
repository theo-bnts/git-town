/**
 * Utilitaire pour analyser et identifier les données partielles/manquantes
 */

// Structure attendue des données complètes
const EXPECTED_STRUCTURE = {
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

/**
 * Vérifie si les données sont partielles et identifie les éléments manquants
 * @param {Object} data - Données statistiques à analyser
 * @returns {Object} Résultat de l'analyse
 */
export function analyzeStatistics(data) {
  if (!data) {
    return {
      isPartial: true,
      isComplete: false,
      isEmpty: true,
      missingFields: ['Toutes les données sont manquantes'],
      missingFieldKeys: ['Global', 'Users']
    };
  }

  const missingFields = [];
  const missingFieldKeys = [];
  
  // Vérifier si des données minimales existent
  // On considère les données comme exploitables même si elles sont incomplètes
  const hasMinimumData = Boolean(
    // Accepter que les commits existent
    (data.Global?.Commits?.Weekly?.Counts?.length > 0) || 
    // OU que les langages existent
    (data.Global?.Languages && Object.keys(data.Global.Languages).length > 0) || 
    // OU qu'il y ait au moins un utilisateur
    (Array.isArray(data.Users) && data.Users.length > 0)
  );
  
  // Vérifier si toutes les données sont présentes
  function checkPath(obj, path, expectedValue, fullPath = []) {
    if (expectedValue === 'array') {
      if (!Array.isArray(obj) || obj.length === 0) {
        const pathStr = [...fullPath, path].join('.');
        missingFields.push(pathStr);
        missingFieldKeys.push(path);
        return false;
      }
      return true;
    } 
    else if (expectedValue === 'object') {
      if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
        const pathStr = [...fullPath, path].join('.');
        missingFields.push(pathStr);
        missingFieldKeys.push(path);
        return false;
      }
      return true;
    } 
    else if (typeof expectedValue === 'object') {
      if (!obj || typeof obj !== 'object') {
        const pathStr = [...fullPath, path].join('.');
        missingFields.push(pathStr);
        missingFieldKeys.push(path);
        return false;
      }
      
      let allPresent = true;
      for (const key in expectedValue) {
        const newPath = [...fullPath, path];
        const result = checkPath(obj[key], key, expectedValue[key], newPath);
        allPresent = allPresent && result;
      }
      return allPresent;
    } 
    else if (expectedValue === true) {
      if (obj === undefined || obj === null) {
        const pathStr = [...fullPath, path].join('.');
        missingFields.push(pathStr);
        missingFieldKeys.push(path);
        return false;
      }
      return true;
    }
    
    return true;
  }

  // Vérifier la structure complète pour signaler toutes les données manquantes
  let isComplete = true;
  for (const key in EXPECTED_STRUCTURE) {
    const result = checkPath(data[key], key, EXPECTED_STRUCTURE[key]);
    isComplete = isComplete && result;
  }
  
  // Vérifier si les données utilisateurs sont présentes et complètes
  const hasUsers = Array.isArray(data.Users) && data.Users.length > 0;
  if (hasUsers) {
    // Détecter si certains utilisateurs ont des données undefined ou null
    const incompleteUsers = data.Users.filter(user => 
      !user.Lines || 
      !user.Lines.Weekly || 
      !user.Lines.Weekly.Counts ||
      // Vérifier également les données undefined dans les tableaux
      (user.Lines?.Weekly?.Counts && user.Lines.Weekly.Counts.some(count => count === undefined || count === null))
    );
    
    if (incompleteUsers.length > 0) {
      missingFields.push('Données de lignes manquantes pour certains utilisateurs');
      missingFieldKeys.push('Users.Lines');
      isComplete = false;
    }
  } else {
    missingFields.push('Aucune donnée utilisateur disponible');
    missingFieldKeys.push('Users');
    isComplete = false;
  }
  
  // Vérifier si des données importantes contiennent des undefined (données en cours de chargement)
  let hasUndefinedData = false;
  
  // Vérifier les commits
  if (data.Global?.Commits?.Weekly?.Counts) {
    if (data.Global.Commits.Weekly.Counts.some(count => count === undefined || count === null)) {
      hasUndefinedData = true;
      missingFields.push('Certaines données de commits sont en cours de chargement');
      missingFieldKeys.push('Global.Commits.Undefined');
    }
  }
  
  // Vérifier les lignes
  if (data.Global?.Lines?.Weekly?.Counts) {
    if (data.Global.Lines.Weekly.Counts.some(count => count === undefined || count === null)) {
      hasUndefinedData = true;
      missingFields.push('Certaines données de lignes sont en cours de chargement');
      missingFieldKeys.push('Global.Lines.Undefined');
    }
  }
  
  // Les données sont partielles si:
  // 1. Elles ne sont pas complètes selon la structure attendue OU
  // 2. Elles contiennent des undefined/null dans des tableaux de données
  // Mais elles ont au minimum quelques données à afficher
  const isPartial = (!isComplete || hasUndefinedData) && hasMinimumData;

  return {
    isPartial,
    isComplete,
    isEmpty: !hasMinimumData,
    hasUndefinedData,
    missingFields,
    missingFieldKeys
  };
}

/**
 * Évalue si les données peuvent être rafraîchies pour compléter les données manquantes
 */
export function canRefreshForMissingData(analysis) {
  if (analysis.isEmpty) {
    // Si aucune donnée n'est disponible, probablement un dépôt vide
    return false;
  }
  
  // Si on a toutes les données essentielles, pas besoin de rafraîchir
  if (analysis.isComplete) {
    return false;
  }
  
  // Si des données undefined sont détectées, on peut toujours rafraîchir
  if (analysis.hasUndefinedData) {
    return true;
  }
  
  // Les données manquantes liées aux utilisateurs ou aux lignes peuvent souvent
  // être récupérées lors d'un rafraîchissement
  const importantMissingFields = analysis.missingFieldKeys.some(key => 
    key === 'Users' || 
    key === 'Users.Lines' || 
    key === 'Global.Lines' ||
    key === 'Global.Commits' ||
    key === 'Global.Languages'
  );
  
  // Ne proposer le rafraîchissement que si des données importantes sont manquantes
  return importantMissingFields;
}