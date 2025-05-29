'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import { textStyles } from "@/app/styles/tailwindStyles";

/**
 * Affiche une carte de chargement pour les statistiques
 */
export default function LoadingCard() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card variant="default" className="p-6 mx-auto max-w-md">
        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <span 
              className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--accent-color)]"
            />
            <span className="ml-4 text-lg">Chargement des statistiques</span>
          </div>
          
          <p className={textStyles.subtle}>
            Récupération des données du dépôt en cours...
          </p>
          
          <p className={textStyles.verySubtle}>
            Le premier chargement peut prendre jusqu'à une minute.
          </p>
        </div>
      </Card>
    </div>
  );
}
