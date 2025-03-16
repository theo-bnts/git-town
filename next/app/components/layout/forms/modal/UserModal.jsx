'use client';

import React from 'react';
import DynamicModal from './DynamicModal';

export default function UserModal({ isOpen, onClose, onCreate }) {
  // Options pour le ComboBox (Rôle) : tableau plat de couples [id, value]
  const roleOptions = [];
  for (let i = 1; i <= 100; i++) {
    roleOptions.push([i, `Role ${i}`]);
  }

  // Options pour le ListBox (Promotions) : tableau de couples (tableau à 2 dimensions)
  const promotionsOptions = [];
  for (let i = 1; i <= 100; i++) {
    promotionsOptions.push([`Promo ${i}A`, `Promo ${i}B`]);
  }

  const fields = [
    { label: "Nom", value: "" },
    { label: "Email", value: "" },
    { label: "Rôle", value: "", options: roleOptions },
    { label: "Promotions", value: [], options: promotionsOptions }
  ];

  const handleSubmit = (data) => {
    onCreate(data);
  };

  return (
    <DynamicModal 
      title="User Modal"
      fields={fields} 
      isOpen={isOpen}
      onClose={onClose} 
      onSubmit={handleSubmit}
    />
  );
}
