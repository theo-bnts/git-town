'use client';

import React from 'react';
import { AlertIcon } from '@primer/octicons-react'; 
import PropTypes from 'prop-types';
import Card from '@/app/components/ui/Card';
import { 
  LoadingCard, 
  StatsCard, 
  ContributionCard 
} from '@/app/components/ui/modal/statistics';
import { useFormattedStats } from '@/app/hooks/statistics/statsHooks';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
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
  
  const formattedStats = useFormattedStats(stats);

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
            {!formattedStats ? (
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
                  <StatsCard 
                    formattedStats={formattedStats}
                    onClose={onClose} 
                    isPartial={retry}
                  />
                </div>

                <div className="w-full">
                  <Card variant="default" className="p-3 lg:p-4 w-full h-full">
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="text-lg font-bold leading-none">Contributions par utilisateur</h3>
                      
                      {!formattedStats.hasUserCommits ? (
                        <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                          Aucune donnée de commits par utilisateur à afficher
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          {formattedStats.userStats.map((userData, index) => (
                            <ContributionCard 
                              key={userData.user?.Id || index}
                              userData={userData}
                              isTeam={false}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
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
