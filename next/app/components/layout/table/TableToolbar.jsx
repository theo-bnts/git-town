'use client';

import React, { useState } from 'react';
import Button from '@/app/components/ui/Button';
import { PlusIcon } from '@primer/octicons-react';

export default function TableToolbar({ ModalComponent, onUserUpdated }) {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCloseModal = () => {
    setModalOpen(false);
    if (typeof onUserUpdated === 'function') {
      onUserUpdated();
    }
  };

  return (
    <div className="flex items-center justify-start pb-8">
      <Button variant="default_sq" onClick={() => setModalOpen(true)}>
        <PlusIcon size={24} className="text-white" />
      </Button>

      <ModalComponent
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
