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

/**
 * @param {boolean}   isOpen         - Pour ouvrir/fermer le modal.
 * @param {object}    initialData    - Les données initiales de la promotion (pour édition).
 * @param {function}  onClose        - Callback à l'annulation ou fermeture du modal.
 * @param {function}  onSave         - Callback après enregistrement réussi.
 */
export default function PromotionModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const [authToken, setAuthToken] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [initialPromotion, setInitialPromotion] = useState(initialData);

  const isCreation = Object.keys(initialData).length === 0;

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const initialDiploma = !isCreation && initialPromotion?.Diploma?.Initialism
    ? transformedDiplomaOptions.find(opt => opt.id === initialPromotion.Diploma.Initialism)
    : null;
  const initialLevel = !isCreation && initialPromotion?.PromotionLevel?.Initialism
    ? transformedLevelOptions.find(opt => opt.id === initialPromotion.PromotionLevel.Initialism)
    : null;

  const fields = [
    {
      label: 'Diplôme',
      value: initialDiploma,
      options: transformedDiplomaOptions
    },
    {
      label: 'Niveau',
      value: initialLevel,
      options: transformedLevelOptions
    },
    {
      label: 'Année',
      value: !isCreation ? initialPromotion?.Year ?? '' : ''
    }
  ];

  const validateFields = (fieldValues) => {
    const newErrors = {};

    if (!fieldValues['Diplôme'] || !fieldValues['Diplôme'].id) {
      newErrors['Diplôme'] = 'Veuillez sélectionner un diplôme.';
    }
    if (!fieldValues['Niveau'] || !fieldValues['Niveau'].id) {
      newErrors['Niveau'] = 'Veuillez sélectionner un niveau.';
    }
    if (!fieldValues['Année']) {
      newErrors['Année'] = "L'année est obligatoire.";
    } else {
      const yearVal = parseInt(fieldValues['Année'], 10);
      if (isNaN(yearVal)) {
        newErrors['Année'] = "L'année doit être un nombre valide.";
      } else if (yearVal < 2000 || yearVal > 2099) {
        newErrors['Année'] = "L'année doit être comprise entre 2000 et 2099.";
      }
    }

    return newErrors;
  };

  const handleSubmit = async (fieldValues) => {
    const newErrors = validateFields(fieldValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiError('');

    const selectedDiploma = fieldValues['Diplôme'];
    const selectedLevel = fieldValues['Niveau'];
    const yearVal = parseInt(fieldValues['Année'], 10);

    const payload = {
      Diploma: {
        Initialism: selectedDiploma.id
      },
      PromotionLevel: {
        Initialism: selectedLevel.id
      },
      Year: yearVal
    };

    try {
      await savePromotions(initialPromotion.Id, payload, authToken);
      onSave?.();
      onClose?.();
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleClose = () => {
    setErrors({});
    setApiError('');
    onClose?.();
  };

  const clearApiError = () => {
    setApiError('');
  };

  const clearError = (label) => {
    setErrors(prev => ({ ...prev, [label]: '' }));
    if (apiError) setApiError('');
  };

  return (
    <DynamicModal
      metadata={{
        createdAt: initialPromotion.createdAt,
        updatedAt: initialPromotion.updatedAt
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
