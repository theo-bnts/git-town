'use client';

import { useMemo, useState } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import savePromotions from '@/app/services/api/promotions/savePromotions';
import FormModal from '@/app/components/ui/modal/FormModal';

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
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');

  const fields = useMemo(() => [
    {
      name: 'Diplôme',
      options: diplomaOptions,
      value: diplomaOptions.find(o => o.id === initialData.Diploma?.Initialism) || null,
    },
    {
      name: 'Niveau',
      options: levelOptions,
      value: levelOptions.find(o => o.id === initialData.PromotionLevel?.Initialism) || null,
    },
    {
      name: 'Année',
      value: initialData.Year?.toString() || '',
    },
  ], [initialData]);

  const validate = v => {
    const e = {};
    if (!v.Diplôme?.id) e.Diplôme = 'Veuillez sélectionner un diplôme.';
    if (!v.Niveau?.id) e.Niveau = 'Veuillez sélectionner un niveau.';
    if (!v.Année) e.Année = "L'année est obligatoire.";
    else if (!/^\d{4}$/.test(v.Année)) e.Année = "L'année doit être un nombre à 4 chiffres.";
    return e;
  };

  const handleSubmit = async v => {
    const e = validate(v);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const year = parseInt(v.Année, 10);
    let payload;

    if (initialData.Id) {
      payload = {};
      if (v.Diplôme.id !== initialData.Diploma.Initialism) {
        payload.Diploma = { Initialism: v.Diplôme.id };
      }
      if (v.Niveau.id !== initialData.PromotionLevel.Initialism) {
        payload.PromotionLevel = { Initialism: v.Niveau.id };
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
        Diploma: { Initialism: v.Diplôme.id },
        PromotionLevel: { Initialism: v.Niveau.id },
        Year: year,
      };
    }

    try {
      await savePromotions(initialData.Id || null, payload, token);
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
      title={initialData.Id ? 'Modifier la promotion' : 'Nouvelle promotion'}
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
