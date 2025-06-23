'use client';

import { useState, useEffect, useMemo } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import saveTemplate from '@/app/services/api/templates/saveTemplate';
import saveTemplateMilestone from '@/app/services/api/templates/id/milestone/saveTemplateMilestone';
import deleteTemplateMilestone from '@/app/services/api/templates/id/milestone/id/deleteTemplateMilestone';
import { MilestoneListBox } from '@/app/components/ui/listbox';
import FormModal from '@/app/components/ui/modal/FormModal';
import { useNotification } from '@/app/context/NotificationContext';

export default function TemplateModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [unitOptions, setUnitOptions] = useState([]);
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const [currentMilestones, setCurrentMilestones] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen || !token) return;
    (async () => {
      try {
        const units = await getEnseignementUnits(token);
        setUnitOptions(
          units.map(u => ({
            id: u.Id,
            value: u.Initialism,
            full: u,
          }))
        );
      } catch (err) {
        notify('Erreur lors du chargement des UE', 'error');
      }
    })();
  }, [isOpen, token, notify]);

  useEffect(() => {
    if (!isOpen || !token) {
      setOriginalMilestones([]);
      setCurrentMilestones([]);
      return;
    }
    if (!initialData.Id) return;

    (async () => {
      try {
        const list = await getTemplateMilestones(initialData.Id, token);
        const norm = list.map(m => ({
          id: m.Id,
          Title: m.Title,
          Date: m.Date,
          value: `${m.Title} – ${m.Date}`,
        }));
        setOriginalMilestones(norm);
        setCurrentMilestones(norm);
      } catch (err) {
        notify('Erreur lors du chargement des milestones', 'error');
      }
    })();
  }, [isOpen, token, initialData.Id, notify]);

  const fields = useMemo(() => [
    {
      name: 'UE',
      options: unitOptions,
      value:
        unitOptions.find(o => o.id === initialData.EnseignementUnit?.Id) ||
        null,
    },
    {
      name: 'Année',
      value: initialData.Year?.toString() || '',
    },
    {
      name: 'Milestones',
      value: currentMilestones,
      render: (value, onChange) => (
        <MilestoneListBox items={value} onChange={onChange} />
      ),
    },
  ], [initialData, unitOptions, currentMilestones]);

  function validate(values) {
    const errs = {};
    if (!values.UE?.id) errs.UE = 'Sélectionnez une UE.';
    if (!values.Année) errs.Année = 'L’année est requise.';
    else if (!/^\d{4}$/.test(values.Année)) errs.Année = 'Année invalide.';
    return errs;
  }

  const handleSubmit = async values => {
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    try {
      let tplId = initialData.Id;
      if (!tplId) {
        const created = await saveTemplate(
          null,
          {
            EnseignementUnit: { Id: values.UE.id },
            Year: +values.Année,
          },
          token
        );
        tplId = created.Id;
      } else {
        const patch = {};
        if (values.UE.id !== initialData.EnseignementUnit?.Id) {
          patch.EnseignementUnit = { Id: values.UE.id };
        }
        if (+values.Année !== initialData.Year) {
          patch.Year = +values.Année;
        }
        if (Object.keys(patch).length) {
          await saveTemplate(tplId, patch, token);
        }
      }

      const all = Array.isArray(values.Milestones) ? values.Milestones : [];
      const kept = all.filter(m =>
        originalMilestones.some(o => o.id === m.id)
      );
      const added = all.filter(
        m => !originalMilestones.some(o => o.id === m.id)
      );
      const removed = originalMilestones.filter(
        o => !all.some(m => m.id === o.id)
      );

      await Promise.all([
        ...removed.map(m =>
          deleteTemplateMilestone(tplId, m.id, token)
        ),
        ...added.map(m => {
          const [Title = '', Date = ''] = typeof m.value === 'string'
            ? m.value.split(' – ')
            : [m.Title, m.Date];
          return saveTemplateMilestone(
            tplId,
            null,
            { Title: Title.trim(), Date: Date.trim() },
            token
          );
        }),
        ...kept.map(m => {
          const orig = originalMilestones.find(o => o.id === m.id);
          const diff = {};
          if (orig.Title !== m.Title) diff.Title = m.Title;
          if (orig.Date !== m.Date) diff.Date = m.Date;
          return Object.keys(diff).length
            ? saveTemplateMilestone(tplId, m.id, diff, token)
            : Promise.resolve();
        }),
      ]);

      notify(
        initialData.Id
          ? 'Modèle mis à jour avec succès'
          : 'Modèle créé avec succès',
        'success'
      );
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      notify(err.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={initialData.Id ? 'Modifier le Modèle' : 'Nouveau modèle'}
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
