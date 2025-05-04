/**
 * Qualifie un delta selon sa valeur
 * @param {number} delta - La valeur du delta à qualifier
 * @returns {Object} - Un objet contenant le label et la classe CSS associée
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