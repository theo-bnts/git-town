'use client';

import { useMemo, useState, useEffect } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import saveTemplate from '@/app/services/api/templates/saveTemplate';
import saveTemplateMilestone from '@/app/services/api/templates/id/milestone/saveTemplateMilestone';
import deleteTemplateMilestone from '@/app/services/api/templates/id/milestone/id/deleteTemplateMilestone';
import { MilestoneListBox } from '@/app/components/ui/listbox';
import FormModal from '@/app/components/ui/modal/FormModal';

export default function TemplateModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const token = useAuthToken();

  const [unitOptions, setUnitOptions] = useState([]);
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const [currentMilestones, setCurrentMilestones] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      getEnseignementUnits(token).then(units =>
        setUnitOptions(
          units.map(u => ({ id: u.Id, value: u.Initialism, full: u }))
        )
      );
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen && token && initialData.Id) {
      getTemplateMilestones(initialData.Id, token).then(list => {
        const norm = list.map(m => ({
          id:  m.Id,
          Title: m.Title,
          Date: m.Date,
          value: `${m.Title} – ${m.Date}`,
        }));
        setOriginalMilestones(norm);
        setCurrentMilestones(norm);
      });
    } else if (isOpen) {
      setOriginalMilestones([]);
      setCurrentMilestones([]);
    }
  }, [isOpen, token, initialData.Id]);

  const fields = useMemo(() => [
    {
      name: 'UE',
      options: unitOptions,
      value: unitOptions.find(o => o.id === initialData.EnseignementUnit?.Id) || null,
    },
    {
      name: 'Année',
      value: initialData.Year?.toString() || '',
    },
    {
      name: 'Milestones',
      value: currentMilestones,
      render: (value, onChange) => (
        <MilestoneListBox
          items={value}
          onChange={newItems => onChange(newItems)}
        />
      ),
    },
  ], [initialData, unitOptions, currentMilestones]);

  const validate = v => {
    const e = {};
    if (!v.UE?.id) e.UE = 'Sélectionnez une UE.';
    if (!v.Année) e.Année = 'L’année est requise.';
    else if (!/^\d{4}$/.test(v.Année)) e.Année = 'Année invalide.';
    return e;
  };

  const handleSubmit = async v => {
    const validationErrors = validate(v);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    let tplId = initialData.Id;
    if (!tplId) {
      const tplData = {
        EnseignementUnit: { Id: v.UE.id },
        Year: parseInt(v.Année, 10),
      };
      const created = await saveTemplate(null, tplData, token);
      tplId = created.Id;
    } else {
      const patch = {};
      if (v.UE.id !== initialData.EnseignementUnit?.Id) {
        patch.EnseignementUnit = { Id: v.UE.id };
      }
      if (parseInt(v.Année, 10) !== initialData.Year) {
        patch.Year = parseInt(v.Année, 10);
      }
      if (Object.keys(patch).length) {
        await saveTemplate(tplId, patch, token);
      }
    }

    const allMs = Array.isArray(v.Milestones) ? v.Milestones : [];
    const kept = allMs.filter(m => originalMilestones.some(o => o.id === m.id));
    const added = allMs.filter(m => !originalMilestones.some(o => o.id === m.id));
    const removed = originalMilestones.filter(o =>
      !allMs.some(m => m.id === o.id)
    );

    await Promise.all(
      removed.map(m => deleteTemplateMilestone(tplId, m.id, token))
    );

    await Promise.all(
      added.map(m => {
        let title, date;
        if (m.Title && m.Date) {
          ({ Title: title, Date: date } = m);
        } else {
          [ title = '', date = '' ] = typeof m.value === 'string'
            ? m.value.split(' – ')
            : [];
        }
        return saveTemplateMilestone(
          tplId,
          null,
          { Title: title.trim(), Date: date.trim() },
          token
        );
      })
    );

    await Promise.all(
      kept.map(m => {
        const orig = originalMilestones.find(o => o.id === m.id);
        const diff = {};
        if (orig.Title !== m.Title) diff.Title = m.Title;
        if (orig.Date  !== m.Date)  diff.Date  = m.Date;
        return Object.keys(diff).length
          ? saveTemplateMilestone(tplId, m.id, diff, token)
          : Promise.resolve();
      })
    );

    onSave();
    onClose();
  };

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={initialData.Id ? 'Modifier le template' : 'Nouveau template'}
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
