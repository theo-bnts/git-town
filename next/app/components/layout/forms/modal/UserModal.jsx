'use client';

import React from 'react';
import DynamicModal from './DynamicModal';

export default function UserModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  const roleOptions = [];
  for (let i = 1; i <= 100; i++) {
    roleOptions.push([i, `Role ${i}`]);
  }

  const promotionsOptions = [];
  for (let i = 1; i <= 100; i++) {
    promotionsOptions.push([`Promo ${i}A`, `Promo ${i}B`]);
  }

  const fields = [
    { label: "Nom", value: initialData.nom || "" },
    { label: "Email", value: initialData.email || "" },
    { label: "Rôle", value: initialData.role || {}, options: roleOptions },
    { label: "Promotions", value: initialData.promotions || [], options: promotionsOptions }
  ];

  return (
    <DynamicModal 
      fields={fields} 
      isOpen={isOpen}
      onClose={onClose} 
      onSubmit={onSubmit}
    />
  );
}
