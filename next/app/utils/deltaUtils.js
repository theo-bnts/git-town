/**
 * Utilitaires pour les calculs et qualifications de delta
 */

/**
 * Calcule le delta normalisé entre -1 et 1 à partir des lignes ajoutées et supprimées
 */
export function calculateDelta(additions, deletions) {
  if (additions === 0 && deletions === 0) {
    return 0;
  }
  
  return (additions - deletions) / (additions + deletions);
}

/**
 * Qualifie un delta selon sa valeur
 */
export function deltaQualifier(delta) {
  if (delta >= 0.8) {
    return {
      label: "Développement intensif",
      class: "text-green-700"
    };
  } else if (delta >= 0.3) {
    return {
      label: "Plus d'ajouts",
      class: "text-green-600"
    };
  } else if (delta >= 0.1) {
    return {
      label: "Légèrement positif",
      class: "text-green-500" 
    };
  } else if (delta >= -0.1) {
    return {
      label: "Équilibré",
      class: "text-gray-500"
    };
  } else if (delta >= -0.3) {
    return {
      label: "Légèrement négatif",
      class: "text-orange-500"
    };
  } else if (delta >= -0.8) {
    return {
      label: "Plus de suppressions",
      class: "text-orange-600"
    };
  } else {
    return {
      label: "Refactoring majeur",
      class: "text-red-700"
    };
  }
}
