'use client';

import React, { useState } from 'react';
import Button from '@/app/components/ui/Button';
import { PlusIcon } from '@primer/octicons-react';
import UserModal from '@/app/components/layout/forms/modal/UserModal';

export default function TableToolbar() {
  const [isModalOpen, setModalOpen] = useState(false);

  const handleCreateUser = async (userData) => {
    console.log("Création de l'utilisateur :", userData);
  };

  return (
    <div className="flex items-center justify-start pb-8">
      <Button variant="default_sq" onClick={() => setModalOpen(true)}>
        <PlusIcon size={24} className="text-white"/>
      </Button>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateUser}
      />
    </div>
  );
}
