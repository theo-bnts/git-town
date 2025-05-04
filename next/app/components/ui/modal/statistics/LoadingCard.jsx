'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';

/**
 * Affiche une carte de chargement centrée avec animation
 */
export default function LoadingCard() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card variant="default" className="p-4 mx-auto max-w-md">
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)]"></span>
          <span className="ml-4">Chargement des statistiques...</span>
        </div>
      </Card>
    </div>
  );
}