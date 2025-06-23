'use client';

import { normalizeString } from './stringUtils';

/**
 * Vérifie si une valeur contient un filtre (insensible à la casse/accents)
 * @param {any} cellValue - Valeur de la cellule à vérifier
 * @param {string} filterValue - Texte de filtre à rechercher
 * @returns {boolean} - True si la valeur contient le filtre
 */
export function valueMatchesFilter(cellValue, filterValue) {
  if (!filterValue || filterValue === '') return true;
  if (cellValue === undefined || cellValue === null) return false;
  
  const normalizedFilter = normalizeString(filterValue);
  
  if (typeof cellValue === 'string') {
    return normalizeString(cellValue).includes(normalizedFilter);
  }
  
  if (Array.isArray(cellValue)) {
    if (cellValue.every(item => typeof item === 'string')) {
      return cellValue.some(item => normalizeString(item).includes(normalizedFilter));
    }
    
    if (cellValue.every(item => typeof item === 'object' && item?.value)) {
      return cellValue.some(item => normalizeString(item.value).includes(normalizedFilter));
    }
  }
  
  if (typeof cellValue === 'object' && cellValue !== null && cellValue.value) {
    return normalizeString(cellValue.value).includes(normalizedFilter);
  }
  
  return normalizeString(String(cellValue)).includes(normalizedFilter);
}

/**
 * Extrait les valeurs uniques d'une colonne pour les filtres
 * @param {Array} data - Données de la table
 * @param {string} columnKey - Clé de la colonne
 * @returns {Array} - Tableau de valeurs uniques
 */
export function extractUniqueFilterValues(data, columnKey) {
  const values = data.reduce((acc, row) => {
    const cell = row[columnKey];
    if (cell === undefined || cell === null) return acc;
    
    if (typeof cell === 'string') {
      return acc.concat(
        cell
          .split(/[,\;\/]+/)
          .map((t) => t.trim())
          .filter(Boolean),
      );
    }
    
    if (typeof cell === 'number') {
      return acc.concat(String(cell));
    }
    
    if (Array.isArray(cell)) {
      if (cell.every((v) => typeof v === 'string')) {
        return acc.concat(cell);
      }
      if (cell.every((v) => typeof v === 'object' && v?.value)) {
        return acc.concat(cell.map(v => v.value));
      }
    }
    
    if (typeof cell === 'object' && cell !== null && 'value' in cell) {
      return acc.concat(String(cell.value));
    }
    
    return acc.concat(String(cell));
  }, []);
  
  const uniqueValues = [...new Set(values)];
  
  return uniqueValues.sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return String(a).localeCompare(String(b));
  });
}

/**
 * Filtre un ensemble de données selon un ensemble de filtres
 * @param {Array} data - Données à filtrer
 * @param {Object} filters - Paires clé-valeur de filtres à appliquer
 * @returns {Array} - Données filtrées
 */
export function filterData(data, filters) {
  return data.filter((row) =>
    Object.entries(filters).every(([key, filterValue]) => 
      valueMatchesFilter(row[key], filterValue)
    )
  );
}
