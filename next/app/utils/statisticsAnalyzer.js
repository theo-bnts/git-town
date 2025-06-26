/**
 * Utilitaire pour analyser et identifier les données partielles/manquantes
 */

import { EXPECTED_STRUCTURE } from '@/app/config/config';

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
  
  const hasMinimumData = Boolean(
    (data.Global?.Commits?.Weekly?.Counts?.length > 0) || 
    (data.Global?.Languages && Object.keys(data.Global.Languages).length > 0) || 
    (Array.isArray(data.Users) && data.Users.length > 0)
  );
  
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
  
  const hasUsers = Array.isArray(data.Users) && data.Users.length > 0;
  if (hasUsers) {
    const incompleteUsers = data.Users.filter(user => 
      !user.Lines || 
      !user.Lines.Weekly || 
      !user.Lines.Weekly.Counts ||
      (user.Lines?.Weekly?.Counts && user.Lines.Weekly.Counts
        .some(count => count === undefined || count === null))
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
  
  let hasUndefinedData = false;
  
  if (data.Global?.Commits?.Weekly?.Counts) {
    if (data.Global.Commits.Weekly.Counts.some(
      count => count === undefined || 
      count === null)
    ) {
      hasUndefinedData = true;
      missingFields.push('Certaines données de commits sont en cours de chargement');
      missingFieldKeys.push('Global.Commits.Undefined');
    }
  }
  
  if (data.Global?.Lines?.Weekly?.Counts) {
    if (data.Global.Lines.Weekly.Counts.some(
      count => count === undefined || 
      count === null)
    ) {
      hasUndefinedData = true;
      missingFields.push('Certaines données de lignes sont en cours de chargement');
      missingFieldKeys.push('Global.Lines.Undefined');
    }
  }
  
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
 * Vérifie si l'analyse permet de rafraîchir les données manquantes
 * @param {*} analysis 
 * @returns {boolean} - True si le rafraîchissement est possible
 */
export function canRefreshForMissingData(analysis) {
  if (analysis.isEmpty) {
    return false;
  }
  
  if (analysis.isComplete) {
    return false;
  }
  
  if (analysis.hasUndefinedData) {
    return true;
  }
  
  const importantMissingFields = 
    analysis.missingFieldKeys.some(key => 
      key === 'Users' || 
      key === 'Users.Lines' || 
      key === 'Global.Lines' ||
      key === 'Global.Commits' ||
      key === 'Global.Languages'
  );
  
  return importantMissingFields;
}
