'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import RepositoryStatsModal from '@/app/components/ui/modal/statistics/RepositoryStatsModal';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';

export default function RepositoryPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(false);
  const [error, setError] = useState(null);

  const repositoryId = '768767bf-80ad-4963-8c7d-d69e61fb7f8e';

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (cancelled) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, loading: stillLoading, retry: needsRetry } = await fetchRepositoryStatistics(
          repositoryId, 
          { backgroundMode: true }
        );
        
        if (cancelled) return;
        
        setStats(data);
        setLoading(stillLoading);
        setRetry(needsRetry);
        
        if (!stillLoading) {
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        
        setError(err);
        setLoading(false);
      }
    }

    if (modalOpen) {
      setStats(null);
      loadStats();
    }

    return () => { cancelled = true; };
  }, [modalOpen, repositoryId]);

  const handleOpen = () => setModalOpen(true);

  const handleClose = () => {
    setModalOpen(false);
    setStats(null);
    setLoading(false);
    setError(null);
    setRetry(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Button variant="default" onClick={handleOpen}>
        Voir les statistiques du dépôt {repositoryId}
      </Button>
      <RepositoryStatsModal
        isOpen={modalOpen}
        onClose={handleClose}
        stats={stats}
        loading={loading}
        error={error}
        retry={retry}
      />
    </div>
  );
}
