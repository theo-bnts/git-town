'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import ListBox from '@/app/components/ui/listbox/ListBox';
import MilestoneAdder from '@/app/components/ui/listbox/MilestoneAdder';
import MilestoneChip from '@/app/components/ui/listbox/MilestoneChip';
import saveTemplate from '@/app/services/api/templates/saveTemplate';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import saveTemplateMilestone from '@/app/services/api/templates/id/milestone/saveTemplateMilestone';
import deleteTemplateMilestone from '@/app/services/api/templates/id/milestone/id/deleteTemplateMilestone';

export default function TemplateModal({ isOpen, initialData = {}, onClose, onSave }) {
  const [authToken, setAuthToken] = useState('');
  const [ueOpts, setUeOpts] = useState([]);
  const [ueSel, setUeSel] = useState(null);
  const [year, setYear] = useState(initialData.Year || '');
  const [initialMs, setInitialMs] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [editingMs, setEditingMs] = useState(null);

  useEffect(() => {
    (async () => setAuthToken(await getCookie('token')))();
  }, []);

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

  useEffect(() => {
    if (!isOpen || !authToken || !initialData.Id) {
      setInitialMs([]);
      setMilestones([]);
      return;
    }
    getTemplateMilestones(initialData.Id, authToken)
      .then((list) => {
        setInitialMs(list);
        setMilestones(
          list.map((m) => ({
            ...m,
            id: m.Id,
            value: `${m.Title} – ${m.Date}`,
          }))
        );
      })
      .catch(() => {
        setInitialMs([]);
        setMilestones([]);
      });
  }, [isOpen, authToken, initialData.Id]);

  const fields = [
    { label: 'UE', value: ueSel, options: ueOpts },
    { label: 'Année', value: year },
    {
      label: 'Milestones',
      value: milestones,
      render: () => (
        <ListBox
          items={milestones}
          onChange={setMilestones}
          renderAdd={({ addItem, updateItem }) => (
            <MilestoneAdder
              onAdd={addItem}
              onUpdate={(id, up) => {
                updateItem(id, up);
                setEditingMs(null);
              }}
              editingItem={editingMs}
            />
          )}
          renderChip={(props) => <MilestoneChip {...props} />}
          onEdit={(m) => setEditingMs(m)}
        />
      ),
    },
  ];

  const validate = (f) => {
    const e = {};
    if (!f.UE?.id) e.UE = 'Sélection obligatoire.';
    const y = parseInt(f['Année'], 10);
    if (!f['Année']) e.year = 'Champ requis.';
    else if (isNaN(y) || y < 2000 || y > 2099) e.year = 'Année 2000-2099.';
    return e;
  };

  const handleSubmit = async (v) => {
    const e = validate(v);
    if (Object.keys(e).length) return alert(Object.values(e).join('\n'));

    const payload = {
      EnseignementUnit: { Id: v.UE.id },
      Year: parseInt(v['Année'], 10),
    };

    const isEdit = !!initialData.Id;
    if (isEdit) {
      if (initialData.EnseignementUnit?.Id === payload.EnseignementUnit.Id)
        delete payload.EnseignementUnit;
      if (initialData.Year === payload.Year) delete payload.Year;
    }

    let tplId = initialData.Id;
    if (!isEdit) {
      tplId = (await saveTemplate(null, payload, authToken)).Id;
    } else if (Object.keys(payload).length) {
      await saveTemplate(tplId, payload, authToken);
    }

    const keepIds = new Set(
      milestones
        .filter((m) => !String(m.id).startsWith('n-'))
        .map((m) => m.id)
    );
    const toDel = initialMs.filter((m) => !keepIds.has(m.Id));
    const toAdd = milestones.filter((m) => String(m.id).startsWith('n-'));
    const toPatch = milestones.filter(
      (m) =>
        !String(m.id).startsWith('n-') &&
        initialMs.some(
          (im) => im.Id === m.id && (im.Title !== m.Title || im.Date !== m.Date)
        )
    );

    await Promise.all([
      ...toDel.map((m) => deleteTemplateMilestone(tplId, m.Id, authToken)),
      ...toAdd.map((m) =>
        saveTemplateMilestone(
          tplId,
          null,
          { Title: m.Title, Date: m.Date },
          authToken
        )
      ),
      ...toPatch.map((m) =>
        saveTemplateMilestone(
          tplId,
          m.id,
          { Title: m.Title, Date: m.Date },
          authToken
        )
      ),
    ]);

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DynamicModal
      key={`tpl-${ueSel?.id || 'none'}-${isOpen}`}
      title="Édition"
      fields={fields}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      metadata={{
        createdAt: initialData.CreatedAt,
        updatedAt: initialData.UpdatedAt,
      }}
    />
  );
}
