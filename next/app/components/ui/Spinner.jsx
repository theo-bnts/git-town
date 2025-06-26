'use client';

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Composant Spinner réutilisable
 * @param {Object} props - Propriétés du composant
 * @param {string} [props.size='md'] - Taille du spinner (sm, md, lg)
 * @param {string} [props.accentColor='var(--accent-color)'] - Couleur de l'accent (partie supérieure)
 * @param {string} [props.baseColor='var(--primary-color)'] - Couleur de base
 * @param {string} [props.thickness='4'] - Épaisseur de la bordure (en px ou avec border-{n})
 * @param {string} [props.className=''] - Classes CSS supplémentaires
 */
export default function Spinner({
  size = 'md',
  accentColor = 'var(--accent-color)',
  baseColor = 'var(--primary-color)',
  thickness = '4',
  className = '',
}) {
  const dimensions = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-16 h-16',
  }[size] || 'w-8 h-8';
  
  const borderThickness = thickness.toString().match(/^\d+$/) 
    ? `border-${thickness}` 
    : thickness;
  
  return (
    <div className={`relative ${dimensions} ${className}`}>
      <span 
        className={`absolute inset-0 ${borderThickness} rounded-full animate-spin`}
        style={{
          borderTopColor: accentColor,
          borderRightColor: baseColor,
          borderBottomColor: baseColor,
          borderLeftColor: baseColor
        }}
      ></span>
    </div>
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  accentColor: PropTypes.string,
  baseColor: PropTypes.string,
  thickness: PropTypes.string,
  className: PropTypes.string,
};
