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

export default function TemplateModal({ isOpen, initialData = {}, duplicatedFromId = null, onClose, onSave }) {
  const token = useAuthToken();
  const notify = useNotification();

  const [unitOpts, setUnitOpts] = useState([]);
  const [origMilestones, setOrig] = useState([]);
  const [currMilestones, setCurr] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const calls = [getEnseignementUnits(token)];
        const baseId = initialData.Id ?? duplicatedFromId;
        if (baseId) calls.push(getTemplateMilestones(baseId, token));
        const [units, miles = []] = await Promise.all(calls);

        setUnitOpts(units.map(u => ({ id: u.Id, value: u.Initialism, full: u })));

        const norm = miles.map(m => ({
          id: initialData.Id ? m.Id : `local-${m.Id}`,
          Title: m.Title,
          Date: m.Date,
          value: `${m.Title} – ${m.Date}`,
        }));

        setOrig(initialData.Id ? norm : []);
        setCurr(norm);
      } catch {
        notify('Erreur de chargement', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, token, initialData.Id, duplicatedFromId, notify]);

  const fields = useMemo(() => [
    {
      name: 'UE',
      options: unitOpts,
      value: unitOpts.find(o => o.id === initialData.EnseignementUnit?.Id) || null,
    },
    { name: 'Année', value: initialData.Year?.toString() || '' },
    {
      name: 'Milestones',
      value: currMilestones,
      render: (v, setV) => <MilestoneListBox items={v} onChange={setV} />,
    },
  ], [unitOpts, initialData.EnseignementUnit, initialData.Year, currMilestones]);

  const validate = v => {
    const e = {};
    if (!v.UE?.id) e.UE = 'Sélectionnez une UE';
    if (!v.Année) e.Année = 'Année requise';
    else if (!/^\d{4}$/.test(v.Année)) e.Année = 'Format AAAA';
    return e;
  };

  const handleSubmit = async v => {
    const errs = validate(v);
    if (Object.keys(errs).length) return setFieldErrors(errs);
    setFieldErrors({});

    try {
      let tplId = initialData.Id;
      if (!tplId) {
        tplId = (await saveTemplate(null, {
          EnseignementUnit: { Id: v.UE.id },
          Year: +v.Année,
        }, token)).Id;

        await Promise.all(
          (v.Milestones ?? []).map(m => {
            let Title = m.Title, Date = m.Date;
            if ((!Title || !Date) && typeof m.value === 'string') {
              [Title = '', Date = ''] = m.value.split(' – ');
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
        if (v.UE.id !== initialData.EnseignementUnit?.Id) patch.EnseignementUnit = { Id: v.UE.id };
        if (+v.Année !== initialData.Year) patch.Year = +v.Année;
        if (Object.keys(patch).length) await saveTemplate(tplId, patch, token);

        const all = v.Milestones ?? [];
        const kept = all.filter(m => origMilestones.some(o => o.id === m.id));
        const added = all.filter(m => !origMilestones.some(o => o.id === m.id));
        const removed = origMilestones.filter(o => !all.some(m => m.id === o.id));

        await Promise.all([
          ...removed.map(m => deleteTemplateMilestone(tplId, m.id, token)),
          ...added.map(m => {
            let Title = m.Title, Date = m.Date;
            if ((!Title || !Date) && typeof m.value === 'string') {
              [Title = '', Date = ''] = m.value.split(' – ');
            }
            return saveTemplateMilestone(
              tplId,
              null,
              { Title: Title.trim(), Date: Date.trim() },
              token
            );
          }),
          ...kept.map(m => {
            const o = origMilestones.find(x => x.id === m.id);
            const diff = {};
            if (o.Title !== m.Title) diff.Title = m.Title;
            if (o.Date !== m.Date) diff.Date = m.Date;
            return Object.keys(diff).length
              ? saveTemplateMilestone(tplId, m.id, diff, token)
              : Promise.resolve();
          }),
        ]);
      }

      notify(initialData.Id ? 'Modèle mis à jour' : 'Modèle créé', 'success');
      onSave();
      onClose();
    } catch (e) {
      notify(e.message || 'Erreur enregistrement', 'error');
    }
  };

  if (!isOpen) return null;
  if (loading || !token) {
    return (
      <ModalBase isOpen title="Chargement…" onClose={onClose}>
        <div className="flex justify-center py-8"><LoadingSpinner size={40} /></div>
      </ModalBase>
    );
  }

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen
      title={initialData.Id ? 'Modifier le modèle' : 'Nouveau modèle'}
      metadata={{ createdAt: initialData.CreatedAt, updatedAt: initialData.UpdatedAt }}
      fields={fields}
      errors={fieldErrors}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
