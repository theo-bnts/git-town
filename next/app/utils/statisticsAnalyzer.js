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
  
  // Vérifier si les commits globaux existent (minimum requis)
  const hasMinimumData = data.Global?.Commits?.Weekly?.Counts?.length > 0;
  
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

  let isComplete = true;
  for (const key in EXPECTED_STRUCTURE) {
    const result = checkPath(data[key], key, EXPECTED_STRUCTURE[key]);
    isComplete = isComplete && result;
  }

  // Vérifier si les données utilisateurs sont présentes et complètes
  const hasUsers = Array.isArray(data.Users) && data.Users.length > 0;
  if (hasUsers) {
    const incompleteUsers = data.Users.filter(user => 
      !user.Lines || 
      !user.Lines.Weekly || 
      !user.Lines.Weekly.Counts
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

  return {
    isPartial: !isComplete && hasMinimumData,
    isComplete,
    isEmpty: !hasMinimumData,
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
  
  // Les données manquantes liées aux utilisateurs ou aux lignes peuvent souvent
  // être récupérées lors d'un rafraîchissement
  return analysis.missingFieldKeys.some(key => 
    key === 'Users' || 
    key === 'Users.Lines' || 
    key === 'Global.Lines'
  );
}