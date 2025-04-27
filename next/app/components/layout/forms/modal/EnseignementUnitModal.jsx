'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import saveEnseignementUnit from '@/app/services/api/enseignementUnit/saveEnseignementUnit';

export default function EnseignementUnitModal({
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

  const fields = [
    { label: 'Sigle', value: initialData.Initialism || '' },
    { label: 'Nom', value: initialData.Name || '' },
  ];

  const validateFields = values => {
    const validationErrors = {};
    if (!values.Sigle?.trim()) validationErrors.Sigle = 'Le sigle est obligatoire.';
    if (!values.Nom?.trim()) validationErrors.Nom = 'Le nom est obligatoire.';
    return validationErrors;
  };

  const computeUnitChanges = (originalUnit, updatedUnit) => {
    const changes = {};
    if ((originalUnit.Initialism || '').trim() !== updatedUnit.Initialism) {
      changes.Initialism = updatedUnit.Initialism;
    }
    if ((originalUnit.Name || '').trim() !== updatedUnit.Name) {
      changes.Name = updatedUnit.Name;
    }
    return changes;
  };

  const handleSubmit = async values => {
    const validationErrors = validateFields(values);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setFieldErrors({});
    setServerError('');

    const updatedUnit = {
      Initialism: values.Sigle.trim(),
      Name: values.Nom.trim(),
    };

    const isEditing = Boolean(initialData.Id);
    const payload = isEditing
      ? computeUnitChanges(initialData, updatedUnit)
      : updatedUnit;

    if (isEditing && Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await saveEnseignementUnit(isEditing ? initialData.Id : null, payload, authToken);
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
