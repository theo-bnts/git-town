'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { useRepositoryStats } from '@/app/hooks/useRepositoryStats';
import Card from '@/app/components/ui/Card';
import { 
  LoadingCard, 
  StatsCard, 
  UserContributionsCard 
} from '@/app/components/ui/modal/statistics';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.isOpen - État d'ouverture de la modal
 * @param {Function} props.onClose - Fonction de fermeture de la modal
 * @param {Object} props.stats - Données statistiques du dépôt
 * @param {boolean} props.loading - État de chargement des données
 * @param {Error} [props.error] - Erreur éventuelle lors du chargement
 * @param {boolean} [props.retry] - Indique si les données sont partielles et nécessitent un rechargement
 */
export default function RepositoryStatsModal({ 
  isOpen, 
  onClose, 
  stats, 
  loading, 
  error,
  retry 
}) {
  if (!isOpen) return null;
  
  const { hasUserCommits, calculateUserTotals } = useRepositoryStats(stats);

  if (error) {
    return (
      <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50 overflow-hidden">
        <Card variant="error" className="p-4 mx-auto max-w-md">
          <div className="text-center">
            <h3 className="text-lg font-bold text-red-700 mb-2">Erreur de chargement</h3>
            <p className="text-gray-700 mb-4">{error.message || "Impossible de charger les statistiques"}</p>
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
                {retry && (
                  <div className="col-span-1 2xl:col-span-3 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Certaines données sont encore en cours de traitement. Les statistiques affichées peuvent être incomplètes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full 2xl:col-span-2">
                  <StatsCard stats={stats} onClose={onClose} isPartial={retry} />
                </div>

                <div className="w-full 2xl:col-span-1">
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
  retry: PropTypes.bool
};

RepositoryStatsModal.defaultProps = {
  loading: false,
  retry: false
};
