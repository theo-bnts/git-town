'use client';

import React, { useState } from 'react';
import DynamicModal from './DynamicModal';

export default function UserModal({ isOpen, onClose, onSubmit, initialData = {} }) {
  const [errors, setErrors] = useState({});

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

  const validateFields = (fieldsValues) => {
    const newErrors = {};
    if (!fieldsValues["Nom"] || fieldsValues["Nom"].trim() === "") {
      newErrors["Nom"] = "Le nom est obligatoire.";
    }
    if (!fieldsValues["Email"] || fieldsValues["Email"].trim() === "") {
      newErrors["Email"] = "L'email est obligatoire.";
    } else {
      const emailPattern = new RegExp(process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN, 'u');
      if (!emailPattern.test(fieldsValues["Email"])) {
        newErrors["Email"] = "L'email n'est pas valide.";
      }
    }
    if (!fieldsValues["Rôle"] || !fieldsValues["Rôle"].id) {
      newErrors["Rôle"] = "Veuillez sélectionner un rôle.";
    }
    if (!fieldsValues["Promotions"] || fieldsValues["Promotions"].length === 0) {
      newErrors["Promotions"] = "Veuillez sélectionner au moins une promotion.";
    }
    return newErrors;
  };

  const handleSubmit = (fieldsValues) => {
    const newErrors = validateFields(fieldsValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      onSubmit(fieldsValues);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const clearError = (label) => {
    setErrors(prev => ({ ...prev, [label]: "" }));
  };

  return (
    <DynamicModal 
      title={initialData && Object.keys(initialData).length > 0 ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
      errors={errors}
      fields={fields} 
      isOpen={isOpen}
      onClose={handleClose} 
      onSubmit={handleSubmit}
      onClearError={clearError}
    />
  );
}
