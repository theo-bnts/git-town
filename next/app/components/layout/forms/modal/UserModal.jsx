'use client';

import React, { useState } from 'react';
import DynamicModal from './DynamicModal';
import saveUser from '@/app/services/api/users/saveUser';
import { getCookie } from '@/app/services/cookies';
import { isEmailValid } from '@/app/services/validators';

export default function UserModal({ isOpen, onClose, initialData = {}, onUserUpdated }) {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const roleOptions = [
    { id: "administrator", name: "Administrateur" },
    { id: "teacher", name: "Enseignant" },
    { id: "student", name: "Étudiant" }
  ];

  const fields = [
    { label: "Nom", value: initialData.nom || "" },
    { label: "Email", value: initialData.email || "" },
    { label: "Rôle", value: initialData.role || {}, options: roleOptions },
    // promotions désactivé pour l'instant
  ];

  const validateFields = (fieldsValues) => {
    const newErrors = {};
    if (!fieldsValues["Nom"] || fieldsValues["Nom"].trim() === "") {
      newErrors["Nom"] = "Le nom est obligatoire.";
    }
    if (!fieldsValues["Email"] || fieldsValues["Email"].trim() === "") {
      newErrors["Email"] = "L'email est obligatoire.";
    } else if (!isEmailValid(fieldsValues["Email"])) {
      newErrors["Email"] = "L'email n'est pas valide.";
    }
    if (!fieldsValues["Rôle"] || !fieldsValues["Rôle"].id) {
      newErrors["Rôle"] = "Veuillez sélectionner un rôle.";
    }
    return newErrors;
  };

  const handleSubmit = async (fieldsValues) => {
    const newErrors = validateFields(fieldsValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setApiError('');
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
        setApiError(error.message);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    setApiError('');
    onClose();
  };

  const clearApiError = () => {
    setApiError('');
  };

  const clearError = (label) => {
    setErrors(prev => ({ ...prev, [label]: "" }));
    if (apiError) {
      setApiError('');
    }
  };

  return (
    <DynamicModal 
      errors={errors}
      apiError={apiError}
      clearApiError={clearApiError}
      fields={fields} 
      isOpen={isOpen}
      onClose={handleClose} 
      onSubmit={handleSubmit}
      onClearError={clearError}
    />
  );
}
