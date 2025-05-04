'use client';

import React from 'react';

import { textStyles } from '@/app/styles/tailwindStyles';

/**
 * Affiche la liste des langages de programmation utilisés dans le dépôt
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.languages - Liste des langages avec pourcentages
 */
export default function LanguagesSection({ languages = [] }) {
  if (!languages?.length) return null;
  
  return (
    <div>
      <p className={textStyles.bold}>Langage(s) de programmation</p>
      <ul className="flex flex-wrap gap-4 mt-2">
        {languages.map(lang => (
          <li key={lang.Name} className="flex items-center gap-2">
            <span className={textStyles.default}>{lang.Name}</span>
            <span className="text-sm text-gray-500">{lang.Percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
