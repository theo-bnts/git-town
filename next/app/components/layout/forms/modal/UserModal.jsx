'use client';

import React, { useState, useEffect } from 'react';
import DynamicModal from './DynamicModal';
import saveUser from '@/app/services/api/users/saveUser';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import saveUserPromotions from '@/app/services/api/users/saveUserPromotions';
import { getCookie } from '@/app/services/cookies';
import { isEmailValid } from '@/app/services/validators';

export default function UserModal({ isOpen, onClose, initialData = {}, onUserUpdated }) {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [promotionsOptions, setPromotionsOptions] = useState([]);

  const roleOptions = [
    { id: "administrator", name: "Administrateur" },
    { id: "teacher", name: "Enseignant" },
    { id: "student", name: "Étudiant" }
  ];

  useEffect(() => {
    if (isOpen) {
      const token = getCookie('token');
      getPromotions(token)
        .then(data => setPromotionsOptions(data))
        .catch(error => console.error("Erreur de chargement des promotions:", error));
    }
  }, [isOpen]);

  const fields = [
    { label: "Nom", value: initialData.nom || "" },
    { label: "Email", value: initialData.email || "" },
    { label: "Rôle", value: initialData.role || {}, options: roleOptions },
    { 
      label: "Promotions", 
      value: initialData.promotions || [], 
      options: promotionsOptions.map(promo => ({
        id: promo.Id,
        value: `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} - ${promo.Year}`,
        full: {
          Diploma: { Initialism: promo.Diploma.Initialism },
          PromotionLevel: { Initialism: promo.PromotionLevel.Initialism },
          Year: promo.Year
        }
      }))
    }
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
        const userResponse = await saveUser(payload, token);
        if (userResponse && userResponse.Id) {
          const userId = userResponse.Id;
          const promotionsSelection = fieldsValues["Promotions"];
          if (promotionsSelection && promotionsSelection.length > 0) {
            for (const promo of promotionsSelection) {
              const promotionsData = { Promotion: promo.full };
              await saveUserPromotions(userId, promotionsData, token);
            }
          }
        }
        if (typeof onUserUpdated === 'function') {
          onUserUpdated();
        }
        onClose();
      } catch (error) {
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
