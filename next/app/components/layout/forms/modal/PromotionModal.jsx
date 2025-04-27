'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import savePromotions from '@/app/services/api/promotions/savePromotions';

const diplomaOptions = [{ id: 'MIAGE', name: 'MIAGE' }];
const levelOptions = [
  { id: 'M1', name: 'M1' },
  { id: 'M2', name: 'M2' },
];

const transformedDiplomaOptions = diplomaOptions.map(diploma => ({
  id: diploma.id,
  value: diploma.name,
}));

const transformedLevelOptions = levelOptions.map(level => ({
  id: level.id,
  value: level.name,
}));

export default function PromotionModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  const initialDiploma = initialData.Diploma?.Initialism
    ? transformedDiplomaOptions.find(opt => opt.id === initialData.Diploma.Initialism)
    : null;

  const initialLevel = initialData.PromotionLevel?.Initialism
    ? transformedLevelOptions.find(opt => opt.id === initialData.PromotionLevel.Initialism)
    : null;

  const fields = [
    { label: 'Diplôme', value: initialDiploma, options: transformedDiplomaOptions },
    { label: 'Niveau', value: initialLevel, options: transformedLevelOptions },
    { label: 'Année', value: initialData.Year || '' },
  ];

  const validate = values => {
    const validationErrors = {};
    if (!values.Diplôme?.id) validationErrors.Diplôme = 'Veuillez sélectionner un diplôme.';
    if (!values.Niveau?.id) validationErrors.Niveau = 'Veuillez sélectionner un niveau.';
    if (!values.Année) {
      validationErrors.Année = "L'année est obligatoire.";
    } else {
      const yearNum = parseInt(values.Année, 10);
      if (isNaN(yearNum)) {
        validationErrors.Année = "L'année doit être un nombre valide.";
      } else if (yearNum < 2000 || yearNum > 2099) {
        validationErrors.Année = "L'année doit être comprise entre 2000 et 2099.";
      }
    }
    return validationErrors;
  };

  const computePromotionChanges = (original, updated) => {
    const changes = {};
    if ((original.Diploma?.Initialism || '') !== updated.Diploma.Initialism) {
      changes.Diploma = { Initialism: updated.Diploma.Initialism };
    }
    if ((original.PromotionLevel?.Initialism || '') !== updated.PromotionLevel.Initialism) {
      changes.PromotionLevel = { Initialism: updated.PromotionLevel.Initialism };
    }
    if (original.Year !== updated.Year) {
      changes.Year = updated.Year;
    }
    return changes;
  };

  const handleSubmit = async values => {
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setFieldErrors({});
    setServerError('');

    const diplomaChoice = { Initialism: values.Diplôme.id };
    const levelChoice = { Initialism: values.Niveau.id };
    const yearValue = parseInt(values.Année, 10);

    const promotionData = {
      Diploma: diplomaChoice,
      PromotionLevel: levelChoice,
      Year: yearValue,
    };

    const isEdit = Boolean(initialData.Id);
    const payload = isEdit
      ? computePromotionChanges(initialData, promotionData)
      : promotionData;

    if (isEdit && Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await savePromotions(isEdit ? initialData.Id : null, payload, authToken);
      onSave();
      onClose();
    } catch (error) {
      setServerError(error.message);
    }
  };

  const clearFieldError = label => {
    setFieldErrors(prev => ({ ...prev, [label]: '' }));
    if (serverError) setServerError('');
  };

  const clearServerError = () => setServerError('');

  const handleClose = () => {
    setFieldErrors({});
    setServerError('');
    onClose();
  };

  return (
    <DynamicModal
      metadata={{
        createdAt: initialData.createdAt,
        updatedAt: initialData.updatedAt,
      }}
      fields={fields}
      errors={fieldErrors}
      apiError={serverError}
      clearApiError={clearServerError}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onClearError={clearFieldError}
    />
  );
}
