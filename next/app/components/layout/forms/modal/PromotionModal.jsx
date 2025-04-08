// /app/components/layout/forms/modal/PromotionModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import savePromotions from '@/app/services/api/promotions/savePromotions';

const diplomaOptions = [
  { id: 'MIAGE', name: 'MIAGE' }
];
const transformedDiplomaOptions = diplomaOptions.map(d => ({
  id: d.id,
  value: d.name
}));

const levelOptions = [
  { id: 'M1', name: 'M1' },
  { id: 'M2', name: 'M2' }
];
const transformedLevelOptions = levelOptions.map(l => ({
  id: l.id,
  value: l.name
}));

export default function PromotionModal({ 
  isOpen, 
  initialData = {}, 
  onClose, 
  onSave, 
}) {
  const [initialPromotion, setInitialPromotion] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [authToken, setAuthToken] = useState('');

  const initialDiploma = initialData.Diploma && initialData.Diploma.Initialism
    ? transformedDiplomaOptions.find(opt => opt.id === initialData.Diploma.Initialism)
    : null;
  const initialLevel = initialData.PromotionLevel && initialData.PromotionLevel.Initialism
    ? transformedLevelOptions.find(opt => opt.id === initialData.PromotionLevel.Initialism)
    : null;

  const fields = [
    { label: "Diplôme", value: initialDiploma, options: transformedDiplomaOptions },
    { label: "Niveau", value: initialLevel, options: transformedLevelOptions },
    { label: "Année", value: initialData.Year || "" }
  ];

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const validateFields = (fieldsValues) => {
    let newErrors = {};
    if (!fieldsValues["Diplôme"] || !fieldsValues["Diplôme"].id) {
      newErrors["Diplôme"] = "Veuillez sélectionner un diplôme.";
    }
    if (!fieldsValues["Niveau"] || !fieldsValues["Niveau"].id) {
      newErrors["Niveau"] = "Veuillez sélectionner un niveau.";
    }
    if (!fieldsValues["Année"]) {
      newErrors["Année"] = "L'année est obligatoire.";
    } else {
      const yearVal = parseInt(fieldsValues["Année"], 10);
      if (isNaN(yearVal)) {
        newErrors["Année"] = "L'année doit être un nombre valide.";
      } else if (yearVal < 2000 || yearVal > 2099) {
        newErrors["Année"] = "L'année doit être comprise entre 2000 et 2099.";
      }
    }
    return newErrors;
  };

  const diffPromotion = (original, modified) => {
    const diff = {};
    const initialDiploma = (original.Diploma && original.Diploma.Initialism) || "";
    if (initialDiploma.trim() !== modified.Diploma.Initialism.trim()) {
      diff.Diploma = { Initialism: modified.Diploma.Initialism.trim() };
    }
    const initialLevel = (original.PromotionLevel && original.PromotionLevel.Initialism) || "";
    if (initialLevel.trim() !== modified.PromotionLevel.Initialism.trim()) {
      diff.PromotionLevel = { Initialism: modified.PromotionLevel.Initialism.trim() };
    }
    if (original.Year !== modified.Year) {
      diff.Year = modified.Year;
    }
    return diff;
  };

  const handleSubmit = async (fieldsValues) => {
    const newErrors = validateFields(fieldsValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiError('');

    const selectedDiploma = fieldsValues["Diplôme"];
    const selectedLevel = fieldsValues["Niveau"];
    const yearVal = parseInt(fieldsValues["Année"], 10);

    const modifiedPromotion = {
      Diploma: { Initialism: selectedDiploma.id },
      PromotionLevel: { Initialism: selectedLevel.id },
      Year: yearVal
    };

    if (initialData && initialData.Id) {
      const differences = diffPromotion(initialPromotion, modifiedPromotion);

      if (Object.keys(differences).length === 0) {
        onClose();
        return;
      }
      try {
        await savePromotions(initialPromotion.Id, differences, authToken);
        onSave();
        onClose();
      } catch (error) {
        setApiError(error.message);
      }
    } else {
      try {
        await savePromotions(null, modifiedPromotion, authToken);
        onSave();
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
    if (apiError) setApiError('');
  };

  return (
    <DynamicModal 
      metadata={{ 
        createdAt: initialData.createdAt, 
        updatedAt: initialData.updatedAt 
      }}
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
