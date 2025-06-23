'use client';

import { useMemo, useState } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import saveEnseignementUnit from '@/app/services/api/enseignementUnit/saveEnseignementUnit';
import FormModal from '@/app/components/ui/modal/FormModal';
import { useNotification } from '@/app/context/NotificationContext';

export default function EnseignementUnitModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [fieldErrors, setFieldErrors] = useState({});

  const fields = useMemo(() => [
    { name: 'Sigle', value: initialData.Initialism || '' },
    { name: 'Nom', value: initialData.Name || '' },
  ], [initialData]);

  function validate(values) {
    const errs = {};
    if (!values.Sigle) errs.Sigle = 'Le sigle est obligatoire.';
    if (!values.Nom) errs.Nom = 'Le nom est obligatoire.';
    return errs;
  }

  const handleSubmit = async (values) => {
    values.Sigle = values.Sigle.trim().toUpperCase();
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    let payload;
    if (initialData.Id) {
      payload = {};
      if (values.Sigle !== initialData.Initialism) payload.Initialism = values.Sigle;
      if (values.Nom !== initialData.Name ) payload.Name = values.Nom;
      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
    } else {
      payload = {
        Initialism: values.Sigle,
        Name: values.Nom,
      };
    }

    try {
      await saveEnseignementUnit(initialData.Id || null, payload, token);
      notify(
        initialData.Id
          ? 'UE mise à jour avec succès'
          : 'Nouvelle UE créée avec succès',
        'success'
      );
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      notify(err.message || 'Échec de la sauvegarde de l’UE', 'error');
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
      errors={fieldErrors}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
