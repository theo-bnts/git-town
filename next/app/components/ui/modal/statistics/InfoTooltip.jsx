'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import { textStyles } from '@/app/styles/tailwindStyles';

/**
 * Affiche une infobulle avec un message personnalisable
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.show - Si l'infobulle doit être affichée
 * @param {string|React.ReactNode} props.text - Le contenu textuel de l'infobulle
 * @param {string} [props.position="top-8 left-0"] - Position de l'infobulle (classes Tailwind)
 * @param {string} [props.width="w-80"] - Largeur de l'infobulle (classe Tailwind)
 * @param {string} [props.variant="success"] - Variante de la Card
 */
export default function InfoTooltip({ 
  show, 
  text,
  children,
  position = "top-8 left-0",
  width = "w-80",
  variant = "success" 
}) {
  if (!show) return null;
  
  const content = text || children;
  
  return (
    <div className={`absolute ${position} z-50 ${width}`}>
      <Card variant={variant}>
        <p className={textStyles.defaultWhite}>
          {content}
        </p>
      </Card>
    </div>
  );
}
