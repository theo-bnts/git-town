'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from '@/app/services/cookies';

import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import MilestoneListBox from '@/app/components/ui/listbox/MilestoneListBox';

import saveTemplate            from '@/app/services/api/templates/saveTemplate';
import getEnseignementUnits    from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import getTemplateMilestones   from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import saveTemplateMilestone   from '@/app/services/api/templates/id/milestone/saveTemplateMilestone';
import deleteTemplateMilestone from '@/app/services/api/templates/id/milestone/id/deleteTemplateMilestone';

export default function TemplateModal({ isOpen, initialData = {}, onClose, onSave }) {
  const [authToken, setAuthToken]     = useState('');

  /* ---------------- données principales ---------------- */
  const [ueOpts, setUeOpts] = useState([]);
  const [ueSel , setUeSel ] = useState(null);
  const [year  , setYear  ] = useState(initialData.Year || '');

  /* ---------------- jalons (état local) ---------------- */
  const [initialMs , setInitialMs ] = useState([]);
  const [milestones, setMilestones] = useState([]);

  /* token ------------------------------------------------ */
  useEffect(() => { (async () => setAuthToken(await getCookie('token')))(); }, []);

  /* liste UE + sélection par défaut --------------------- */
  useEffect(() => {
    if (!isOpen || !authToken) return;
    getEnseignementUnits(authToken).then((arr) => {
      const opts = arr.map((u) => ({ id: u.Id, value: u.Initialism, full: u }));
      setUeOpts(opts);

      if (initialData.EnseignementUnit?.Id) {
        setUeSel(opts.find((o) => o.id === initialData.EnseignementUnit.Id) || null);
      }
    });
  }, [isOpen, authToken, initialData]);

  /* jalons initiaux ------------------------------------- */
  useEffect(() => {
    if (!isOpen || !authToken || !initialData.Id) { setInitialMs([]); setMilestones([]); return; }
    getTemplateMilestones(initialData.Id, authToken)
      .then((list) => { setInitialMs(list); setMilestones(list); })
      .catch(()      => { setInitialMs([]);   setMilestones([]);   });
  }, [isOpen, authToken, initialData.Id]);

  /* champs DynamicModal --------------------------------- */
  const fields = [
    { label: 'UE',    value: ueSel, options: ueOpts },
    { label: 'Année', value: year },
  ];

  /* validation + submit ---------------------------------- */
  const validate = (f) => {
    const e = {};
    if (!f['UE']?.id) e.UE = 'Sélection obligatoire.';
    const y = parseInt(f['Année'], 10);
    if (!f['Année']) e.year = 'Champ requis.';
    else if (isNaN(y) || y < 2000 || y > 2099) e.year = 'Année 2000-2099.';
    return e;
  };

  const handleSubmit = async (vals) => {
    const err = validate(vals);
    if (Object.keys(err).length) return alert(Object.values(err).join('\n'));

    /* ---------- template -------------------------------- */
    const payload = {
      EnseignementUnit: { Id: vals['UE'].id },
      Year            : parseInt(vals['Année'], 10),
    };
    const isEdit = !!initialData.Id;
    if (isEdit) {
      if (initialData.EnseignementUnit?.Id === payload.EnseignementUnit.Id) delete payload.EnseignementUnit;
      if (initialData.Year === payload.Year) delete payload.Year;
    }

    let tplId = initialData.Id;
    if (!isEdit) {
      const res = await saveTemplate(null, payload, authToken);
      tplId = res.Id;
    } else if (Object.keys(payload).length) {
      await saveTemplate(tplId, payload, authToken);
    }

    /* ---------- jalons ---------------------------------- */
    /** liste actuelle depuis le composant MilestoneListBox */
    const curList = milestones;

    const curKeepIds = new Set(
      curList.filter((m) => !String(m.id).startsWith('n-')).map((m) => m.id)
    );
    const toDelete   = initialMs.filter((m) => !curKeepIds.has(m.Id));
    const toAdd      = curList.filter((m) => String(m.id).startsWith('n-'));

    await Promise.all([
      ...toDelete.map((m) => deleteTemplateMilestone(tplId, m.Id, authToken)),
      ...toAdd.map((m) => saveTemplateMilestone(
        tplId,
        null,
        { Title: m.Title, Date: m.Date },
        authToken
      )),
    ]);

    onSave();
    onClose();
  };

  /* clé pour forcer DynamicModal à se ré-initialiser quand UE chargée */
  const modalKey = `tpl-${ueSel?.id || 'none'}-${isOpen}`;

  if (!isOpen) return null;

  return (
    <DynamicModal
      key={modalKey}
      title="Édition"
      fields={fields}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      metadata={{ createdAt: initialData.CreatedAt, updatedAt: initialData.UpdatedAt }}
    >
      <p className="mt-6 mb-1">Milestones</p>
      <MilestoneListBox initial={milestones} onChange={setMilestones} />
    </DynamicModal>
  );
}
