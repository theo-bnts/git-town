'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import saveEnseignementUnit from '@/app/services/api/enseignementUnit/saveEnseignementUnit';

export default function EnseignementUnitModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const [initialUnit, setInitialUnit] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
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

  const validateFields = (values) => {
    const errs = {};
    if (!values['Sigle'] || values['Sigle'].trim() === '') {
      errs['Sigle'] = 'Le sigle est obligatoire.';
    }
    if (!values['Nom'] || values['Nom'].trim() === '') {
      errs['Nom'] = 'Le nom est obligatoire.';
    }
    return errs;
  };

  const diffUnit = (orig, mod) => {
    const diff = {};
    if ((orig.Initialism || '').trim() !== mod.Initialism.trim()) {
      diff.Initialism = mod.Initialism.trim();
    }
    if ((orig.Name || '').trim() !== mod.Name.trim()) {
      diff.Name = mod.Name.trim();
    }
    return diff;
  };

  const handleSubmit = async (values) => {
    const newErrs = validateFields(values);
    if (Object.keys(newErrs).length) {
      setErrors(newErrs);
      return;
    }
    setErrors({});
    setApiError('');

    const modifiedUnit = {
      Initialism: values['Sigle'].trim(),
      Name:       values['Nom'].trim(),
    };

    const isEdit = !!initialUnit.Id;
    const payload = isEdit
      ? diffUnit(initialUnit, modifiedUnit)
      : modifiedUnit;

    if (isEdit && Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    try {
      await saveEnseignementUnit(isEdit ? initialUnit.Id : null, payload, authToken);
      onSave();
      onClose();
    } catch (err) {
      setApiError(err.message);
    }
  };

  const clearError = (label) => {
    setErrors((prev) => ({ ...prev, [label]: '' }));
    if (apiError) setApiError('');
  };
  const clearApiError = () => setApiError('');

  const handleClose = () => {
    setErrors({});
    setApiError('');
    onClose();
  };

  return (
    <DynamicModal
      metadata={{
        createdAt: initialUnit.createdAt,
        updatedAt: initialUnit.updatedAt,
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
