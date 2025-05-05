'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import { textStyles } from '@/app/styles/tailwindStyles';

/**
 * Affiche une infobulle avec un message personnalisable et responsive
 */
export default function InfoTooltip({ 
  show, 
  text,
  children,
  position = "top-8 left-0",
  variant = "success" 
}) {
  if (!show) return null;
  
  const content = text || children;

  return (
    <div className={`absolute z-50 ${position} 
      w-60 sm:w-72 md:w-80 lg:w-96
      max-w-[95vw] sm:max-w-[80vw]`}>
      <Card variant={variant} className="p-3">
        <p className={`${textStyles.defaultWhite} text-sm sm:text-base`}>
          {content}
        </p>
      </Card>
    </div>
  );
}
