'use client';

export function hasAllProperties(obj, shape) {
    if (shape === true) return obj !== undefined;
    if (shape === false) return true;
    
    if (Array.isArray(obj)) return obj !== undefined;
    
    if (typeof shape !== 'object' || typeof obj !== 'object' || obj === null) return false;
    
    return Object.entries(shape).every(([key, subShape]) => {
        const hasKey = obj.hasOwnProperty(key);
        return hasKey && hasAllProperties(obj[key], subShape);
    });
}