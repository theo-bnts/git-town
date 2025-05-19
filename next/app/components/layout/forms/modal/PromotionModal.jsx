'use client';

import { useMemo, useState } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import savePromotions from '@/app/services/api/promotions/savePromotions';
import FormModal from '@/app/components/ui/modal/FormModal';
import { useNotification } from '@/app/context/NotificationContext';

const diplomaOptions = [
  { id: 'MIAGE', value: 'MIAGE' },
];

const levelOptions = [
  { id: 'M1', value: 'M1' },
  { id: 'M2', value: 'M2' },
];

export default function PromotionModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [fieldErrors, setFieldErrors] = useState({});

  const fields = useMemo(() => [
    {
      name: 'Diplôme',
      options: diplomaOptions,
      value:
        diplomaOptions.find(
          (o) => o.id === initialData.Diploma?.Initialism
        ) || null,
    },
    {
      name: 'Niveau',
      options: levelOptions,
      value:
        levelOptions.find(
          (o) => o.id === initialData.PromotionLevel?.Initialism
        ) || null,
    },
    {
      name: 'Année',
      value: initialData.Year?.toString() || '',
    },
  ], [initialData]);

  function validate(values) {
    const errs = {};
    if (!values.Diplôme?.id) errs.Diplôme = 'Veuillez sélectionner un diplôme.';
    if (!values.Niveau?.id) errs.Niveau = 'Veuillez sélectionner un niveau.';
    if (!values.Année) errs.Année = "L'année est obligatoire.";
    else if (!/^\d{4}$/.test(values.Année))
      errs.Année = "L'année doit être un nombre à 4 chiffres.";
    return errs;
  }

  const handleSubmit = async (values) => {
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const year = parseInt(values.Année, 10);
    let payload;

    if (initialData.Id) {
      payload = {};
      if (values.Diplôme.id !== initialData.Diploma.Initialism) {
        payload.Diploma = { Initialism: values.Diplôme.id };
      }
      if (values.Niveau.id !== initialData.PromotionLevel.Initialism) {
        payload.PromotionLevel = { Initialism: values.Niveau.id };
      }
      if (year !== initialData.Year) {
        payload.Year = year;
      }
      if (Object.keys(payload).length === 0) {
        onClose();
        return;
      }
    } else {
      payload = {
        Diploma: { Initialism: values.Diplôme.id },
        PromotionLevel: { Initialism: values.Niveau.id },
        Year: year,
      };
    }

    try {
      await savePromotions(initialData.Id || null, payload, token);
      notify(
        initialData.Id
          ? 'Promotion mise à jour avec succès'
          : 'Nouvelle promotion créée avec succès',
        'success'
      );
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      notify(err.message || 'Échec de l’enregistrement', 'error');
    }
  };

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={
        initialData.Id
          ? 'Modifier la promotion'
          : 'Nouvelle promotion'
      }
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
