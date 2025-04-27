'use client';

import React, { useEffect, useState } from 'react';
import { getCookie } from '@/app/services/cookies';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import MilestoneListBox from '@/app/components/ui/listbox/MilestoneListBox';
import saveTemplate from '@/app/services/api/templates/saveTemplate';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';
import getTemplateMilestones from '@/app/services/api/templates/id/milestone/getTemplateMilestones';
import saveTemplateMilestone from '@/app/services/api/templates/id/milestone/saveTemplateMilestone';
import deleteTemplateMilestone from '@/app/services/api/templates/id/milestone/id/deleteTemplateMilestone';

export default function TemplateModal({ isOpen, initialData = {}, onClose, onSave }) {
  const [authToken, setAuthToken] = useState('');
  const [unitOptions, setUnitOptions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [originalMilestones, setOriginalMilestones] = useState([]);
  const [currentMilestones, setCurrentMilestones] = useState([]);

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  useEffect(() => {
    if (!isOpen || !authToken) return;
    getEnseignementUnits(authToken).then(units => {
      const options = units.map(unit => ({ id: unit.Id, value: unit.Initialism, full: unit }));
      setUnitOptions(options);
      if (initialData.EnseignementUnit?.Id) {
        setSelectedUnit(
          options.find(option => option.id === initialData.EnseignementUnit.Id) || null
        );
      }
    });
  }, [isOpen, authToken, initialData]);

  useEffect(() => {
    if (!isOpen || !authToken || !initialData.Id) {
      setOriginalMilestones([]);
      setCurrentMilestones([]);
      return;
    }
    getTemplateMilestones(initialData.Id, authToken)
      .then(list => {
        setOriginalMilestones(list);
        setCurrentMilestones(
          list.map(item => ({
            ...item,
            id: item.Id,
            Title: item.Title,
            Date: item.Date,
            value: `${item.Title} – ${item.Date}`,
          }))
        );
      })
      .catch(() => {
        setOriginalMilestones([]);
        setCurrentMilestones([]);
      });
  }, [isOpen, authToken, initialData.Id]);

  const fields = [
    { label: 'UE', 
      value: selectedUnit,
      options: unitOptions 
    },
    { label: 'Année',  
      value: initialData.Year?.toString() || '' },
    {
      label: 'Milestones',
      value: currentMilestones,
      render: () => (
        <MilestoneListBox
          initial={currentMilestones}
          onChange={setCurrentMilestones}
        />
      )
    }
  ];

  const validate = values => {
    const errors = {};
    if (!values.UE?.id) errors.UE = 'Sélection de l’unité obligatoire.';
    const yearNum = parseInt(values['Année'], 10);
    if (!values['Année']) {
      errors['Année'] = 'Champ requis.';
    } else if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2099) {
      errors['Année'] = 'Année doit être entre 2000 et 2099.';
    }
    return errors;
  };

  const handleSubmit = async values => {
    const errors = validate(values);
    if (Object.keys(errors).length) {
      alert(Object.values(errors).join('\n'));
      return;
    }

    const templateData = {
      EnseignementUnit: { Id: values.UE.id },
      Year: parseInt(values['Année'], 10),
    };

    const isUpdating = Boolean(initialData.Id);
    if (isUpdating) {
      if (initialData.EnseignementUnit?.Id === templateData.EnseignementUnit.Id) {
        delete templateData.EnseignementUnit;
      }
      if (initialData.Year === templateData.Year) {
        delete templateData.Year;
      }
    }

    let templateId = initialData.Id;
    if (!isUpdating) {
      const created = await saveTemplate(null, templateData, authToken);
      templateId = created.Id;
    } else if (Object.keys(templateData).length) {
      await saveTemplate(templateId, templateData, authToken);
    }

    const keptIds = new Set(
      currentMilestones
        .filter(milestone => milestone.Id != null)
        .map(milestone => milestone.Id)
    );

    const milestonesToDelete = originalMilestones.filter(originalMilestone => !keptIds.has(originalMilestone.Id));
    const milestonesToAdd    = currentMilestones.filter(milestone => milestone.Id == null);
    const milestonesToPatch  = currentMilestones.filter(milestone => {
      if (milestone.Id == null) return false;
      const originalMilestone = originalMilestones.find(o => o.Id === milestone.Id);
      return originalMilestone && (originalMilestone.Title !== milestone.Title || originalMilestone.Date !== milestone.Date);
    });

    await Promise.all([
      ...milestonesToDelete.map(originalMilestone =>
        deleteTemplateMilestone(templateId, originalMilestone.Id, authToken)
      ),
      ...milestonesToAdd.map(newItem =>
        saveTemplateMilestone(templateId, null, { Title: newItem.Title, Date: newItem.Date }, authToken)
      ),
      ...milestonesToPatch.map(updated =>
        saveTemplateMilestone(
          templateId,
          updated.Id,
          {
            ...(originalMilestones.find(o => o.Id === updated.Id).Title !== updated.Title && { Title: updated.Title }),
            ...(originalMilestones.find(o => o.Id === updated.Id).Date  !== updated.Date  && { Date:  updated.Date })
          },
          authToken
        )
      )
    ]);

    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DynamicModal
      key={`template-${selectedUnit?.id || 'none'}-${isOpen}`}
      title="Édition"
      fields={fields}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      metadata={{
        createdAt: initialData.CreatedAt,
        updatedAt: initialData.UpdatedAt
      }}
    />
  );
}
