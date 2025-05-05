'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';

/**
 * Affiche une carte de chargement pour les statistiques
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.fromCache - Indique si les données viennent du cache
 */
export default function LoadingCard({ fromCache }) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <Card variant="default" className="p-6 mx-auto max-w-md">
        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <span className="
              animate-spin rounded-full h-10 w-10 
              border-b-2 border-[var(--accent-color)]">
            </span>
            <span className="ml-4 text-lg">Chargement des statistiques</span>
          </div>
          
          <p className="text-center text-sm text-gray-600">
            Récupération des données du dépôt en cours...
          </p>
          
          <p className="text-center text-xs text-gray-500">
            Le premier chargement peut prendre jusqu'à une minute.
            Les chargements suivants seront beaucoup plus rapides.
          </p>

          {fromCache && (
            <p className="text-center text-xs text-green-600 mt-2">
              Récupération des données depuis le cache...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
