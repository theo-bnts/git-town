'use client';

import React, { useState, useEffect } from 'react';
import { getCookie } from '@/app/services/cookies';

import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';

import saveTemplate from '@/app/services/api/templates/saveTemplate';
import getEnseignementUnits from '@/app/services/api/enseignementUnit/getEnseignementUnits';

export default function TemplateModal({
  isOpen,
  initialData = {},
  onClose,
  onSave,
}) {
  const [authToken, setAuthToken] = useState('');
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState('');

  const [unitsOptions, setUnitsOptions] = useState([]);

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  useEffect(() => {
    if (isOpen && authToken) {
      getEnseignementUnits(authToken).then((data) => {
        setUnitsOptions(data.map((u) => ({
          id: u.Id,
          value: `${u.Initialism}`,
          full: { Name: u.Name, Initialism: u.Initialism },
        })));
      });
    }
  }, [isOpen, authToken]);

  const initialUnitOption = initialData?.EnseignementUnit?.Id
    ? unitsOptions.find((o) => o.id === initialData.EnseignementUnit.Id)
    : null;

  const fields = [
    {
      label: 'UE',
      value: initialUnitOption,
      options: unitsOptions,
    },
    { label: 'Année', value: initialData.Year || '' },
  ];

  const validate = (vals) => {
    const e = {};
    if (!vals['UE'] || !vals['UE'].id) e['UE'] = 'Sélection obligatoire.';
    if (!vals['Année']) e['Année'] = 'L’année est obligatoire.';
    else {
      const y = parseInt(vals['Année'], 10);
      if (isNaN(y) || y < 2000 || y > 2099) e['Année'] = 'Année 2000‑2099.';
    }
    return e;
  };

  const diffTpl = (orig, mod) => {
    const d = {};
    if (orig.EnseignementUnit?.Id !== mod.EnseignementUnit.Id) {
      d.EnseignementUnit = { Id: mod.EnseignementUnit.Id };
    }
    if (orig.Year !== mod.Year) d.Year = mod.Year;
    return d;
  };

  const handleSubmit = async (vals) => {
    const v = validate(vals);
    if (Object.keys(v).length) { setErrors(v); return; }
    setErrors({}); setApiError('');

    const payloadFull = {
      EnseignementUnit: { Id: vals['UE'].id },
      Year: parseInt(vals['Année'], 10),
    };

    const isEdit = !!initialData.Id;
    const payload = isEdit ? diffTpl(initialData, payloadFull) : payloadFull;

    if (isEdit && Object.keys(payload).length === 0) { onClose(); return; }

    try {
      await saveTemplate(isEdit ? initialData.Id : null, payload, authToken);
      onSave();
      onClose();
    } catch (err) { setApiError(err.message); }
  };

  const clearError = (label) => {
    setErrors((prev) => ({ ...prev, [label]: '' }));
    if (apiError) setApiError('');
  };
  const clearApiError = () => setApiError('');
  const handleClose   = () => { setErrors({}); setApiError(''); onClose(); };

  return (
    <DynamicModal
      metadata={{ createdAt: initialData.CreatedAt, updatedAt: initialData.UpdatedAt }}
      errors={errors}
      apiError={apiError}
      clearApiError={clearApiError}
      fields={fields}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onClearError={clearError}
    />
  );
}
