'use client';

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Card from '@/app/components/ui/Card';
import { 
  LoadingCard, 
  StatsCard,
  PartialDataAlert,
  UserContributionsSection
} from '@/app/components/ui/modal/statistics';
import { useRepositoryStats } from '@/app/hooks/statistics/useRepositoryStats';
import { modalStyles } from '@/app/styles/tailwindStyles';

/**
 * Modal affichant les statistiques détaillées d'un dépôt
 * Gère le chargement, les timeouts et les données partielles
 */
export default function RepositoryStatsModal({ isOpen, onClose, repositoryId, onError, options = {} }) {
  const { 
    formattedStats, 
    loading, 
    error, 
    isPartialData,
    canRefresh,
    missingFields,
    handleRetry,
    isEmpty
  } = useRepositoryStats(repositoryId, isOpen, options);
  
  const modalContentRef = useRef(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 2;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (error) {
      onError(error.message || "Une erreur est survenue lors du chargement des statistiques");
    }
  }, [error, onError]);

  const retryWithClear = () => {
    if (attemptCount >= maxAttempts) {
      onError("Impossible de charger les statistiques complètes après plusieurs tentatives.");
      return;
    }
    
    setAttemptCount(prev => prev + 1);
    handleRetry();
  };

  const handleTimeout = (message) => {
    onError(message);
  };

  const handleOutsideClick = (e) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Modifier cette condition pour afficher la LoadingCard même pour les dépôts vides
  const shouldShowLoadingCard = loading || isEmpty || !formattedStats;

  return (
    <div className={modalStyles.overlay} onClick={handleOutsideClick}>
      {shouldShowLoadingCard ? (
        <LoadingCard 
          onClose={onClose} 
          onTimeout={handleTimeout}
          error={error}
          hasPartialData={Boolean(formattedStats && isPartialData)} 
        />
      ) : (
        <div className={modalStyles.container}>
          <div className={modalStyles.content} ref={modalContentRef}>
            {renderStatsContent()}
          </div>
        </div>
      )}
    </div>
  );

  function renderStatsContent() {
    if (!formattedStats) {
      return (
        <Card variant="default" className="p-4 mx-auto max-w-md">
          <div className="text-center text-gray-500">
            Aucune donnée à afficher.
          </div>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        {isPartialData && (
          <div className="col-span-1 xl:col-span-2">
            <PartialDataAlert 
              onRetry={retryWithClear}
              missingFields={missingFields}
              canRefresh={canRefresh}
            />
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
          />
        </div>
      </div>
    );
  }
}

RepositoryStatsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  repositoryId: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  options: PropTypes.object
};
