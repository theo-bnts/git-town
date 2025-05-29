'use client';

import React from 'react';
import PropTypes from 'prop-types';
import Card from '@/app/components/ui/Card';
import { 
  LoadingCard, 
  StatsCard,
  ErrorView,
  PartialDataAlert,
  UserContributionsSection
} from '@/app/components/ui/modal/statistics';
import { useRepositoryStats } from '@/app/hooks/statistics/useRepositoryStats';
import { modalStyles } from '@/app/styles/tailwindStyles';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
 */
export default function RepositoryStatsModal({ isOpen, onClose, repositoryId }) {
  const { 
    formattedStats, 
    loading, 
    error, 
    isPartialData, 
    handleRetry 
  } = useRepositoryStats(repositoryId, isOpen);

  if (!isOpen) return null;

  if (error) {
    return (
      <div className={modalStyles.overlay}>
        <ErrorView 
          error={error} 
          onClose={onClose} 
          onRetry={handleRetry} 
        />
      </div>
    );
  }

  return (
    <div className={modalStyles.overlay}>
      {loading ? (
        <LoadingCard />
      ) : (
        <div className={modalStyles.container}>
          <div className={modalStyles.content}>
            {!formattedStats ? (
              <Card variant="default" className="p-4 mx-auto max-w-md">
                <div className="text-center text-gray-500">
                  Aucune donnée à afficher.
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
                {isPartialData && (
                  <div className="col-span-1 xl:col-span-2">
                    <PartialDataAlert onRetry={handleRetry} />
                  </div>
                )}

                <div className="col-span-1">
                  <StatsCard 
                    formattedStats={formattedStats}
                    onClose={onClose}
                  />
                </div>
                
                <div className="col-span-1">
                  <UserContributionsSection 
                    formattedStats={formattedStats}
                    isPartialData={isPartialData}
                    onRetry={handleRetry}
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
  repositoryId: PropTypes.string.isRequired
};
