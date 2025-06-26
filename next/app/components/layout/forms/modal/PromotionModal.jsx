'use client';

import { useMemo, useState, useEffect } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import savePromotions from '@/app/services/api/promotions/savePromotions';
import replicateUsersPromotion from '@/app/services/api/promotions/id/replicateUsersPromotion';
import getDiplomas from '@/app/services/api/diplomas/getDiplomas';
import getPromotionLevels from '@/app/services/api/promotion-levels/getPromotionLevels';
import FormModal from '@/app/components/ui/modal/FormModal';
import { useNotification } from '@/app/context/NotificationContext';
import { isYearValid } from '@/app/services/validators';

export default function PromotionModal({
  isOpen,
  initialData = {},
  duplicatedFromId = null,
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [diplomaOptions, setDiplomaOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    if (!isOpen || !token) {
      if (!isOpen) {
        setDiplomaOptions([]);
        setLevelOptions([]);
      }
      return;
    }
    setIsLoadingOptions(true);

    (async () => {
      try {
        const [diplomas, levels] = await Promise.all([
          getDiplomas(token),
          getPromotionLevels(token),
        ]);
        setDiplomaOptions(
          diplomas.map((d) => ({ id: d.Initialism, value: d.Initialism }))
        );
        setLevelOptions(
          levels.map((l) => ({ id: l.Initialism, value: l.Initialism }))
        );
      } catch (err) {
        console.error(err);
        notify(err.message || 'Erreur lors du chargement des options', 'error');
      } finally {
        setIsLoadingOptions(false);
      }
    })();
  }, [isOpen, token, notify]);

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
  ], [initialData, diplomaOptions, levelOptions]);

  function validate(values) {
    const errs = {};
    if (!values.Diplôme?.id) 
      errs.Diplôme = 'Veuillez sélectionner un diplôme.';
    if (!values.Niveau?.id) 
      errs.Niveau = 'Veuillez sélectionner un niveau.';
    if (!values.Année) 
      errs.Année = "L'année est obligatoire.";
    else if (!isYearValid(values.Année))
      errs.Année = "L'année doit être valide (4 chiffres, entre 2000 et 2099).";
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
      const created = await savePromotions(initialData.Id || null, payload, token);

      if (duplicatedFromId) {
        const targetId = created.Id || created.id;
        await replicateUsersPromotion(duplicatedFromId, targetId, token);
      }

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
      isLoading={isLoadingOptions}
    />
  );
}
