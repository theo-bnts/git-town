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
export default function RepositoryStatsModal({ isOpen, onClose, repositoryId, onError }) {
  const { 
    formattedStats, 
    loading, 
    error, 
    isPartialData, 
    handleRetry 
  } = useRepositoryStats(repositoryId, isOpen);
  
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
      onError("Impossible de charger les statistiques après plusieurs tentatives. Le dépôt est probablement vide.");
      onClose();
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

  return (
    <div className={modalStyles.overlay} onClick={handleOutsideClick}>
      {loading ? (
        <LoadingCard 
          onClose={onClose} 
          onTimeout={handleTimeout}
          error={error}
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
            <PartialDataAlert onRetry={retryWithClear} />
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
            onRetry={retryWithClear}
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
  onError: PropTypes.func.isRequired
};
