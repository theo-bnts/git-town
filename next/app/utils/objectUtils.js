'use client';

/**
 * Vérifie si un objet possède toutes les propriétés définies dans un schéma de validation
 */
export function hasAllProperties(obj, shape) {
    if (shape === true) return obj !== undefined;
    if (shape === false) return true;
    if (obj === undefined || obj === null) return false;
    if (Array.isArray(obj)) {
        if (!Array.isArray(shape)) return false;
        return obj.every(item => hasAllProperties(item, shape[0]));
    }
    if (typeof shape !== 'object' || typeof obj !== 'object') return false;
    
    return Object.entries(shape).every(([key, subShape]) => {
        const hasKey = Object.prototype.hasOwnProperty.call(obj, key);
        return hasKey && hasAllProperties(obj[key], subShape);
    });
}
