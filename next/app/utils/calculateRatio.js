/**
 * Calcule le ratio entre les lignes ajoutées et supprimées
 * @param {number} additions - Nombre de lignes ajoutées
 * @param {number} deletions - Nombre de lignes supprimées
 * @param {number} [precision=1] - Nombre de décimales pour l'arrondi
 * @returns {number} - Ratio calculé (additions / deletions)
 */
export function calculateRatio(additions, deletions, precision = 1) {
  if (additions === 0 && deletions === 0) {
    return 0;
  }
  
  if (deletions === 0) {
    return additions > 0 ? 1 : 0;
  }
  
  if (additions === 0) {
    return 0; 
  }
  
  const rawRatio = additions / deletions;

  const clampedRatio = Math.min(Math.max(rawRatio, 0), 5);
  
  const factor = Math.pow(10, precision);
  return Math.round(clampedRatio * factor) / factor;
}

/**
 * Formate un ratio pour l'affichage
 * @param {number} ratio - Ratio calculé
 * @returns {string} - Ratio formaté pour l'affichage
 */
export function formatRatio(ratio, precision = 1) {
  if (ratio === Infinity || ratio > 10) {
    return "∞";
  }
  return ratio.toFixed(precision);
}
