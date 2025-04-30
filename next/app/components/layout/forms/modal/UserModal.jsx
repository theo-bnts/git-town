'use client';
import { useMemo, useState, useEffect } from 'react';
import useAuthToken from '@/app/hooks/useAuthToken';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import saveUser from '@/app/services/api/users/saveUser';
import { isEmailValid } from '@/app/services/validators';
import { PromotionListBox } from '@/app/components/ui/listbox';
import FormModal from '@/app/components/ui/modal/FormModal';

const roleOptions = [
  { id: 'administrator', value: 'Administrateur' },
  { id: 'teacher', value: 'Enseignant' },
  { id: 'student', value: 'Étudiant' },
];

const formatLabel = p =>
  `${p.Diploma.Initialism} ${p.PromotionLevel.Initialism} - ${p.Year}`;

export default function UserModal({ isOpen, initialData = {}, onClose, onSave }) {
  const token = useAuthToken();
  const [promoOpts, setPromoOpts] = useState([]);
  const [selectedPromos, setSelectedPromos] = useState([]);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen && token) {
      getPromotions(token).then(arr => {
        const opts = arr.map(p => ({
          id: p.Id,
          value: formatLabel(p).replace('–', '-'),
          full: p,
        }));
        setPromoOpts(opts);
      });
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (isOpen && promoOpts.length) {
      const initialLabels = Array.isArray(initialData.promotions)
        ? initialData.promotions.map(str => str.replace('–', '-'))
        : [];
      const matched = promoOpts.filter(opt => initialLabels.includes(opt.value));
      setSelectedPromos(matched);
    }
  }, [isOpen, promoOpts, initialData.promotions]);

  const initialRole = useMemo(
    () => roleOptions.find(r => r.value === initialData.Role?.Name) || null,
    [initialData.Role]
  );

  const fields = useMemo(() => [
    { name: 'Nom', value: initialData.FullName || '' },
    { name: 'Email', value: initialData.EmailAddress || '' },
    { name: 'Rôle', options: roleOptions, value: initialRole },
    {
      name: 'Promotions', 
      value: selectedPromos,
      render: (value, onChange) => (
        <PromotionListBox
          items={value}
          promotionOptions={promoOpts}
          onChange={onChange}
        />
      ),
    },
  ], [initialData, initialRole, promoOpts, selectedPromos]);

  const validate = v => {
    const e = {};
    if (!v.Nom?.trim()) e.Nom   = 'Le nom est obligatoire.';
    if (!v.Email?.trim()) e.Email = "L'email est obligatoire.";
    else if (!isEmailValid(v.Email)) e.Email = "Format d'email invalide.";
    if (!v.Rôle?.id) e.Rôle  = 'Veuillez sélectionner un rôle.';
    return e;
  };

  const handleSubmit = async v => {
    const e = validate(v);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});

    const origIds = (Array.isArray(initialData.promotions) ? initialData.promotions : [])
      .map(str => str.replace('–', '-'))
      .map(label => promoOpts.find(opt => opt.value === label)?.id)
      .filter(Boolean)
      .sort();
    const newIds = (Array.isArray(v.Promotions) ? v.Promotions : selectedPromos)
      .map(p => p.id)
      .sort();

    // Build payload only with changed fields
    const payload = {};
    if (v.Nom.trim() !== initialData.FullName) payload.FullName = v.Nom.trim();
    if (v.Email.trim() !== initialData.EmailAddress) payload.EmailAddress = v.Email.trim();
    if (v.Rôle.id !== initialData.Role?.Keyword) payload.Role = { Keyword: v.Rôle.id };
    if (JSON.stringify(origIds) !== JSON.stringify(newIds)) payload.Promotions = newIds;

    // If editing and no changes, just close
    if (initialData.Id && Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    // Submit
    try {
      await saveUser(initialData.Id || null, payload, token);
      onSave();
      onClose();
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <FormModal
      formKey={`${initialData.Id || 'new'}-${isOpen}`}
      isOpen={isOpen}
      title={initialData.Id ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
      metadata={{ createdAt: initialData.CreatedAt, updatedAt: initialData.UpdatedAt }}
      fields={fields}
      errors={errors}
      apiError={apiError}
      onClearApiError={() => setApiError('')}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
