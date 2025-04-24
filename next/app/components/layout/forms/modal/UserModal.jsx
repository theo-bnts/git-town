'use client';

import React, { useState, useEffect } from 'react';
import { isEmailValid } from '@/app/services/validators';
import { getCookie } from '@/app/services/cookies';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import saveUser from '@/app/services/api/users/saveUser';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';
import ComboBox from '@/app/components/ui/combobox/ComboBox';
import ListBox from '@/app/components/ui/listbox/ListBox';

const roleOptions = [
  { id: 'administrator', name: 'Administrateur' },
  { id: 'teacher', name: 'Enseignant' },
  { id: 'student', name: 'Étudiant' }
];
const transformedRoleOptions = roleOptions.map(r => ({ id: r.id, value: r.name }));
const mapRoleNameToId = { administrateur: 'administrator', enseignant: 'teacher', étudiant: 'student' };

const getInitialRole = d => {
  if (!d.role) return null;
  if (typeof d.role === 'string') return d.role;
  if (d.role.Keyword || d.role.id) return d.role.Keyword || d.role.id;
  if (d.role.Name) return mapRoleNameToId[d.role.Name.toLowerCase()] || null;
  return null;
};

const mapPromotionOption = p => ({
  id: p.Id,
  value: `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`,
  full: { Diploma: { Initialism: p.Diploma.Initialism }, PromotionLevel: { Initialism: p.PromotionLevel.Initialism }, Year: p.Year }
});
const transformInitialPromotions = ps => ps.map(p => ({ id: p.id, value: p.value, full: p.full }));

export default function UserModal({ isOpen, initialData = {}, onClose, onSave }) {
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [promotionsOptions, setPromotionsOptions] = useState([]);
  const [authToken, setAuthToken] = useState('');
  const initialRoleId = getInitialRole(initialData);
  const initialRole = initialRoleId ? transformedRoleOptions.find(r => r.id === initialRoleId) : null;
  const [promotions, setPromotions] = useState(transformInitialPromotions(initialData.promotions || []));

  useEffect(() => { (async () => setAuthToken(await getCookie('token')))(); }, []);
  useEffect(() => { if (isOpen && authToken) getPromotions(authToken).then(setPromotionsOptions); }, [isOpen, authToken]);

  const fields = [
    { label: 'Nom', value: initialData.nom || '' },
    { label: 'Email', value: initialData.email || '' },
    { label: 'Rôle', value: initialRole, options: transformedRoleOptions },
    {
      label: 'Promotions',
      value: promotions,
      render: (_, onChange) => (
        <ListBox
          items={promotions}
          onChange={v => { setPromotions(v); onChange(v); }}
          renderAdd={({ addItem }) => (
            <ComboBox
              placeholder="Ajouter promotion"
              options={promotionsOptions.map(mapPromotionOption)}
              onSelect={addItem}
              maxVisible={4}
            />
          )}
        />
      )
    }
  ];

  const validate = v => {
    const e = {};
    if (!v.Nom?.trim()) e.Nom = 'Le nom est obligatoire.';
    if (!v.Email?.trim()) e.Email = "L'email est obligatoire.";
    else if (!isEmailValid(v.Email)) e.Email = "L'email n'est pas valide.";
    if (!v.Rôle?.id) e.Rôle = 'Veuillez sélectionner un rôle.';
    return e;
  };

  const diffUser = (o, m) => {
    const d = {};
    if ((o.FullName || o.nom || '').trim() !== m.FullName.trim()) d.FullName = m.FullName.trim();
    if ((o.EmailAddress || o.email || '').trim() !== m.EmailAddress.trim()) d.EmailAddress = m.EmailAddress.trim();
    if ((o.role?.Keyword || '') !== (m.Role?.Keyword || '')) d.Role = { Keyword: m.Role.Keyword };
    if (JSON.stringify(o.promotions || []) !== JSON.stringify(m.Promotions || [])) d.Promotions = m.Promotions;
    return d;
  };

  const handleSubmit = async v => {
    const e = validate(v);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setApiError('');
    const roleKw = v.Rôle.id || v.Rôle;
    const mod = { EmailAddress: v.Email.trim(), FullName: v.Nom.trim(), Role: { Keyword: roleKw }, Promotions: promotions.map(p => p.id) };
    const diff = diffUser(initialData, { ...mod, Promotions: mod.Promotions });
    if (!Object.keys(diff).length) { onClose(); return; }
    try { await saveUser(initialData.Id, diff, authToken); onSave(); onClose(); } catch (err) { setApiError(err.message); }
  };

  return (
    <DynamicModal
      metadata={{ createdAt: initialData.createdAt, updatedAt: initialData.updatedAt }}
      errors={errors}
      apiError={apiError}
      clearApiError={() => setApiError('')}
      fields={fields}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      onClearError={l => setErrors(p => ({ ...p, [l]: '' }))}
    />
  );
}
