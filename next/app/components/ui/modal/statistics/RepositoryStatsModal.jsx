'use client';

import React from 'react';
import Card from '@/app/components/ui/Card';
import LoadingCard from './LoadingCard';
import StatsCard from './StatsCard';
import UserContributionsCard from './UserContributionsCard';
import { useRepositoryStats } from '@/app/hooks/useRepositoryStats';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture de la modal
 * @param {Object} props.stats - Données statistiques du dépôt
 * @param {boolean} props.loading - État de chargement des données
 */
export default function RepositoryStatsModal({ isOpen, onClose, stats, loading }) {
  if (!isOpen) return null;
  
  const { hasUserCommits, calculateUserTotals } = useRepositoryStats(stats);

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50 overflow-hidden">
      {loading ? (
        <LoadingCard />
      ) : (
        <div className="w-full h-full overflow-y-auto py-6 lg:py-8">
          <div className="w-full max-w-[95vw] 2xl:max-w-[75vw] mx-auto px-2 lg:px-4">
            {!stats ? (
              <Card variant="default" className="p-4 mx-auto max-w-md">
                <div className="text-center text-gray-500">
                  Aucune donnée à afficher.
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-3 gap-4 2xl:gap-6">
                <div className="w-full 2xl:col-span-2">
                  <StatsCard stats={stats} onClose={onClose} />
                </div>

                <div className="w-full 2xl:col-span-1">
                  <UserContributionsCard 
                    users={stats.Users} 
                    hasUserCommits={hasUserCommits} 
                    calculateUserTotals={calculateUserTotals} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
