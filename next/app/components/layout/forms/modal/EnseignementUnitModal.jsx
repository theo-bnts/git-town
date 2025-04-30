'use client';

import { useMemo, useState } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import saveEnseignementUnit from '@/app/services/api/enseignementUnit/saveEnseignementUnit';
import FormModal from '@/app/components/ui/modal/FormModal';

export default function EnseignementUnitModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const fields = useMemo(
    () => [
      { name: 'Sigle', value: initialData.Initialism || '' },
      { name: 'Nom', value: initialData.Name || '' },
    ],
    [initialData]
  );

  const validate = (v) => {
    const e = {};
    if (!v.Sigle) e.Sigle = 'Le sigle est obligatoire.';
    if (!v.Nom) e.Nom = 'Le nom est obligatoire.';
    return e;
  };

  const handleSubmit = async (v) => {
    const e = validate(v);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    let payload;
    if (initialData.Id) {
      payload = {};
      if (v.Sigle !== initialData.Initialism) { 
        payload.Initialism = v.Sigle;
      }

      if (v.Nom !== initialData.Name) {
        payload.Name = v.Nom;
      }

      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
    } else {
      payload = { Initialism: v.Sigle, Name: v.Nom };
    }

    try {
      await saveEnseignementUnit(initialData.Id || null, payload, token);
      onSave();
      onClose();
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={initialData.Id ? 'Modifier l’UE' : 'Nouvelle UE'}
      metadata={{
        createdAt: initialData.CreatedAt,
        updatedAt: initialData.UpdatedAt,
      }}
      fields={fields}
      errors={errors}
      apiError={apiError}
      onClearApiError={() => setApiError('')}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
