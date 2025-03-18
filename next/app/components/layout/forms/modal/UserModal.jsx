'use client';

import React, { useState } from 'react';
import DynamicModal from './DynamicModal';
import saveUser from '@/app/services/api/users/saveUser';
import { getCookie } from '@/app/services/cookies';

export default function UserModal({ isOpen, onClose, initialData = {} }) {
  const [errors, setErrors] = useState({});

  const roleOptions = [
    { id: "administrator", name: "Administrateur" },
    { id: "teacher", name: "Enseignant" },
    { id: "student", name: "Étudiant" }
  ];

  const promotionsOptions = [];
  for (let i = 1; i <= 100; i++) {
    promotionsOptions.push([`Promo ${i}A`, `Promo ${i}B`]);
  }

  const fields = [
    { label: "Nom", value: initialData.nom || "" },
    { label: "Email", value: initialData.email || "" },
    { label: "Rôle", value: initialData.role || {}, options: roleOptions },
    // { label: "Promotions", value: initialData.promotions || [], options: promotionsOptions }
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
    // Désactivation temporaire de la vérification promotions
    // if (!fieldsValues["Promotions"] || fieldsValues["Promotions"].length === 0) {
    //   newErrors["Promotions"] = "Veuillez sélectionner au moins une promotion.";
    // }
    return newErrors;
  };

  const handleSubmit = async (fieldsValues) => {
    const newErrors = validateFields(fieldsValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      const roleValue = fieldsValues["Rôle"];
      const roleKeyword = (typeof roleValue === 'object' && roleValue.id)
        ? roleValue.id.toString().trim()
        : roleValue.toString().trim();
        
      const payload = {
        EmailAddress: fieldsValues["Email"].trim(),
        FullName: fieldsValues["Nom"].trim(),
        Role: {
          Keyword: roleKeyword
        }
        // promotions désactivé pour l'instant
      };
      console.log("Payload envoyé :", payload);
      try {
        const token = getCookie('token');
        await saveUser(payload, token);
        if (typeof onUserUpdated === 'function') {
          onUserUpdated();
        }
        onClose();
      } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'utilisateur :", error);
      }
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
      errors={errors}
      fields={fields} 
      isOpen={isOpen}
      onClose={handleClose} 
      onSubmit={handleSubmit}
      onClearError={clearError}
    />
  );
}
