'use client';

/**
 * Vérifie si un objet possède toutes les propriétés définies dans un schéma de validation
 * 
 * @param {object|any} obj - L'objet à vérifier
 * @param {object|boolean} shape - Le schéma à respecter:
 *   - Si `true`: vérifie que l'objet n'est pas undefined
 *   - Si `false`: retourne toujours true (aucune validation)
 *   - Si objet: vérifie récursivement les propriétés
 * @returns {boolean} - `true` si l'objet correspond au schéma, sinon `false`
 * 
 * @example
 * // Vérifie si l'objet a les propriétés id et name
 * hasAllProperties({ id: 1, name: 'test' }, { id: true, name: true })
 */
export function hasAllProperties(obj, shape) {
    if (shape === true) return obj !== undefined;
    if (shape === false) return true;
    if (obj === undefined || obj === null) return false;
    if (Array.isArray(obj)) return obj !== undefined;
    if (typeof shape !== 'object' || typeof obj !== 'object') return false;
    
    return Object.entries(shape).every(([key, subShape]) => {
        const hasKey = Object.prototype.hasOwnProperty.call(obj, key);
        return hasKey && hasAllProperties(obj[key], subShape);
    });
}