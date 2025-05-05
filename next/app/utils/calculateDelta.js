/**
 * Calcule le delta normalisé entre -1 et 1 à partir des lignes ajoutées et supprimées
 */
export function calculateDelta(additions, deletions) {
  if (additions === 0 && deletions === 0) {
    return 0;
  }
  
  return (additions - deletions) / (additions + deletions);
}
