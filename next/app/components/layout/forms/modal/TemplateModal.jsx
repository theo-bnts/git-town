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
import ModalBase from '@/app/components/ui/modal/ModalBase';
import LoadingSpinner from '@/app/components/ui/LoadingSpinner';
import { useNotification } from '@/app/context/NotificationContext';

import { isYearValid } from '@/app/services/validators';

export default function TemplateModal({
  isOpen,
  initialData = {},
  duplicatedFromId = null,
  onClose,
  onSave
}) {
  const token = useAuthToken();
  const notify = useNotification();

  const [unitOpts, setUnitOpts] = useState([]);
  const [origMilestones, setOrig] = useState([]);
  const [currMilestones, setCurr] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !token) return;

    (async () => {
      setLoading(true);
      try {
        const calls = [getEnseignementUnits(token)];
        const baseId = initialData.Id ?? duplicatedFromId;
        if (baseId) calls.push(getTemplateMilestones(baseId, token));
        const [units, miles = []] = await Promise.all(calls);

        setUnitOpts(
          units.map(u => ({
            id: u.Id,
            value: u.Initialism,
            full: u
          }))
        );

        const norm = miles.map(m => ({
          id: initialData.Id ? m.Id : `local-${m.Id}`,
          Title: m.Title,
          Date: m.Date,
          value: `${m.Date} - ${m.Title}`
        }));

        setOrig(initialData.Id ? norm : []);
        setCurr(norm);
      } catch {
        notify('Erreur de chargement', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, token, initialData.Id, duplicatedFromId, notify]);

  const fields = useMemo(
    () => [
      {
        name: 'UE',
        options: unitOpts,
        value:
          unitOpts.find(o => o.id === initialData.EnseignementUnit?.Id) ||
          null
      },
      { name: 'Année', value: initialData.Year?.toString() || '' },
      {
        name: 'Milestones',
        value: currMilestones,
        render: (values, setV) => (
          <MilestoneListBox items={values} onChange={setV} />
        )
      }
    ],
    [unitOpts, initialData.EnseignementUnit, initialData.Year, currMilestones]
  );

  const validate = values => {
    const errs = {};
    if (!values.UE?.id) errs.UE = 'Sélectionnez une UE';
    if (!values.Année) errs.Année = 'Année requise';
    else if (!isYearValid(values.Année))
      errs.Année =
        "Format d'année invalide (4 chiffres, entre 2000 et 2099).";
    return errs;
  };

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
        tplId = (
          await saveTemplate(
            null,
            {
              EnseignementUnit: { Id: values.UE.id },
              Year: +values.Année
            },
            token
          )
        ).Id;

        await Promise.all(
          (values.Milestones ?? []).map(m => {
            let { Title, Date } = m;
            if ((!Title || !Date) && typeof m.value === 'string') {
              [Title = '', Date = ''] = m.value.split(' - ');
            }
            return saveTemplateMilestone(
              tplId,
              null,
              { Title: Title.trim(), Date: Date.trim() },
              token
            );
          })
        );
      } else {
        const patch = {};
        if (values.UE.id !== initialData.EnseignementUnit?.Id)
          patch.EnseignementUnit = { Id: values.UE.id };
        if (+values.Année !== initialData.Year)
          patch.Year = +values.Année;
        if (Object.keys(patch).length)
          await saveTemplate(tplId, patch, token);

        const all = values.Milestones ?? [];
        const kept = all.filter(m =>
          origMilestones.some(o => o.id === m.id)
        );
        const added = all.filter(
          m => !origMilestones.some(o => o.id === m.id)
        );
        const removed = origMilestones.filter(
          o => !all.some(m => m.id === o.id)
        );

        await Promise.all([
          ...removed.map(m =>
            deleteTemplateMilestone(tplId, m.id, token)
          ),
          ...added.map(m => {
            let { Title, Date } = m;
            if ((!Title || !Date) && typeof m.value === 'string') {
              [Title = '', Date = ''] = m.value.split(' - ');
            }
            return saveTemplateMilestone(
              tplId,
              null,
              { Title: Title.trim(), Date: Date.trim() },
              token
            );
          }),
          ...kept.map(m => {
            const orig = origMilestones.find(o => o.id === m.id);
            const diff = {};
            if (orig.Title !== m.Title) diff.Title = m.Title;
            if (orig.Date !== m.Date) diff.Date = m.Date;
            return Object.keys(diff).length
              ? saveTemplateMilestone(tplId, m.id, diff, token)
              : Promise.resolve();
          })
        ]);
      }

      notify(
        initialData.Id
          ? 'Modèle mis à jour'
          : 'Modèle créé',
        'success'
      );
      onSave();
      onClose();
    } catch (errs) {
      notify(errs.message || 'Erreur enregistrement', 'error');
    }
  };

  if (!isOpen) return null;
  if (loading || !token) {
    return (
      <ModalBase isOpen title="Chargement…" onClose={onClose}>
        <div className="flex justify-center py-8">
          <LoadingSpinner size={40} />
        </div>
      </ModalBase>
    );
  }

  const modalTitle = initialData.Id
    ? 'Modifier le modèle'
    : duplicatedFromId
    ? 'Duplication modèle'
    : 'Nouveau modèle';

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={modalTitle}
      metadata={{
        createdAt: initialData.CreatedAt,
        updatedAt: initialData.UpdatedAt
      }}
      fields={fields}
      errors={fieldErrors}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
