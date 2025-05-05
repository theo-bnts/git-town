'use client';

import React from 'react';
import { AlertIcon } from '@primer/octicons-react'; 
import PropTypes from 'prop-types';
import Card from '@/app/components/ui/Card';
import { LoadingCard, StatsCard, UserContributionsCard } from '@/app/components/ui/modal/statistics';
import { useRepositoryStats } from '@/app/hooks/useRepositoryStats';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture de la modal
 * @param {Object} props.stats - Données statistiques du dépôt
 * @param {boolean} props.loading - État de chargement des données
 * @param {Error} [props.error] - Erreur éventuelle lors du chargement
 * @param {boolean} [props.retry] - Indique si les données sont partielles
 * @param {boolean} [props.fromCache] - Indique si les données proviennent du cache
 */
export default function RepositoryStatsModal({ 
  isOpen, 
  onClose, 
  stats, 
  loading, 
  error,
  retry,
  fromCache
}) {
  if (!isOpen) return null;
  
  const { hasUserCommits, calculateUserTotals } = useRepositoryStats(stats);

  if (error) {
    return (
      <div className="fixed inset-0 bg-[var(--popup-color)] 
      flex items-center justify-center z-50 overflow-hidden">
        <Card variant="error" className="p-4 mx-auto max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-700 mb-2">Erreur de chargement</h3>
            <p className="text-gray-700 mb-4">
              {error.message || "Impossible de charger les statistiques"}
            </p>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] 
    flex items-center justify-center z-50 overflow-hidden">
      {loading ? (
        <LoadingCard fromCache={fromCache} />
      ) : (
        <div className="w-full h-full overflow-y-auto py-6 lg:py-8 2xl:py-4">
          <div className="w-full max-w-[95vw] 2xl:max-w-[75vw] mx-auto px-2 lg:px-4">
            {!stats ? (
              <Card variant="default" className="p-4 mx-auto max-w-md">
                <div className="text-center text-gray-500">
                  Aucune donnée à afficher.
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                {retry && (
                  <div className="col-span-1 xl:col-span-2 bg-yellow-50 
                  border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertIcon className="text-yellow-400" size={20} />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Certaines données sont encore en cours de traitement.
                          Les statistiques affichées peuvent être incomplètes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full">
                  <StatsCard stats={stats} onClose={onClose} isPartial={retry} />
                </div>

                <div className="w-full">
                  <UserContributionsCard 
                    users={stats.Users} 
                    hasUserCommits={hasUserCommits} 
                    calculateUserTotals={calculateUserTotals}
                    isPartial={retry}
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

RepositoryStatsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  stats: PropTypes.object,
  loading: PropTypes.bool,
  error: PropTypes.object,
  retry: PropTypes.bool,
  fromCache: PropTypes.bool
};

RepositoryStatsModal.defaultProps = {
  loading: false,
  retry: false,
  fromCache: false
};
