'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import { fetchRepositoryStatistics } from '@/app/services/api/repositories/fetchRepositoryStatistics';
import RepositoryStatsModal from '@/app/components/ui/modal/RepositoryStatsModals';

export default function RepositoryPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const repositoryId = '768767bf-80ad-4963-8c7d-d69e61fb7f8e';

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const maxRetries = Number(process.env.NEXT_PUBLIC_MAX_RETRIES);
    const retryDelay = Number(process.env.NEXT_PUBLIC_RETRY_DELAY);

    async function loadStats() {
      setLoading(true);
      let retry = true;
      let lastData = null;
      while (retry && tries < maxRetries && !cancelled) {
        const res = await fetchRepositoryStatistics(repositoryId, { retryDelay: 0, maxRetries: 1 });
        setStats(res.data);
        setLoading(res.loading);
        lastData = res.data;
        retry = res.retry;
        tries++;
        if (!res.loading || !retry || cancelled) break;
        await new Promise(r => setTimeout(r, retryDelay));
      }
      setLoading(false);
      setStats(lastData);
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
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Button variant="default" onClick={handleOpen}>
        Voir les statistiques du dépôt test
      </Button>
      <RepositoryStatsModal
        isOpen={modalOpen}
        onClose={handleClose}
        stats={stats}
        loading={loading}
      />
    </div>
  );
}