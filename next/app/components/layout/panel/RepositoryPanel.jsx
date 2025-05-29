'use client';

import React, { useState } from 'react';
import Button from '@/app/components/ui/Button';
import RepositoryStatsModal from '@/app/components/ui/modal/statistics/RepositoryStatsModal';

export default function RepositoryPanel() {
  const [modalOpen, setModalOpen] = useState(false);
  
  // ID de test en dur pour le moment
  const repositoryId = 'b53bd51e-f23b-41e2-b355-f186ea52aa48';

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Button variant="default" onClick={handleOpen}>
        Voir les statistiques du dépôt {repositoryId}
      </Button>
      <RepositoryStatsModal
        isOpen={modalOpen}
        onClose={handleClose}
        repositoryId={repositoryId}
      />
    </div>
  );
}
