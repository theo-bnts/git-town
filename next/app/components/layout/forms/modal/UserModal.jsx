'use client';

import React, { useState, useEffect } from 'react';
import { isEmailValid } from '@/app/services/validators';
import { getCookie } from '@/app/services/cookies';
import getPromotions from '@/app/services/api/promotions/getPromotions';
import saveUser from '@/app/services/api/users/saveUser';
import DynamicModal from '@/app/components/layout/forms/modal/DynamicModal';

const roleOptions = [
  { id: "administrator", name: "Administrateur" },
  { id: "teacher", name: "Enseignant" },
  { id: "student", name: "Étudiant" }
];

const transformedRoleOptions = roleOptions.map(r => ({
  id: r.id,
  value: r.name
}));

const mapRoleNameToId = {
  administrateur: "administrator",
  enseignant: "teacher",
  étudiant: "student"
};

const getInitialRole = (initialData) => {
  if (!initialData.role) return null;
  if (typeof initialData.role === "string") return initialData.role;
  if (initialData.role.Keyword || initialData.role.id) {
    return initialData.role.Keyword || initialData.role.id;
  }
  if (initialData.role.Name) {
    return mapRoleNameToId[initialData.role.Name.toLowerCase()] || null;
  }
  return null;
};

const mapPromotionOption = (promo) => ({
  id: promo.Id,
  value: `${promo.Diploma.Initialism} ${promo.PromotionLevel.Initialism} - ${promo.Year}`,
  full: {
    Diploma: { Initialism: promo.Diploma.Initialism },
    PromotionLevel: { Initialism: promo.PromotionLevel.Initialism },
    Year: promo.Year
  }
});

const transformInitialPromotions = (promotions = []) =>
  promotions.map(promo => ({
    id: promo.id,
    value: promo.value,
    full: promo.full,
  }));

export default function UserModal({ 
  isOpen, 
  initialData = {}, 
  onClose, 
  onSave, 
}) {
  const [initialUser, setInitialUser] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [promotionsOptions, setPromotionsOptions] = useState([]);
  const [authToken, setAuthToken] = useState('');

  const initialRoleId = getInitialRole(initialData);
  const initialRole = initialRoleId
    ? transformedRoleOptions.find(r => r.id === initialRoleId)
    : null;
  const initialPromotions = transformInitialPromotions(initialData.promotions);

  const fields = [
    { label: "Nom", value: initialData.nom || "" },
    { label: "Email", value: initialData.email || "" },
    { label: "Rôle", value: initialRole, options: transformedRoleOptions },
    { 
      label: "Promotions", 
      value: initialPromotions,
      options: promotionsOptions.map(mapPromotionOption)
    }
  ];

  useEffect(() => {
    (async () => {
      const token = await getCookie('token');
      setAuthToken(token);
    })();
  }, []);

  useEffect(() => {
    if (isOpen && authToken) {
      getPromotions(authToken).then(data => setPromotionsOptions(data));
    }
  }, [isOpen, authToken]);

  const validateFields = (fieldsValues) => {
    let newErrors = {};
    if (!fieldsValues["Nom"] || fieldsValues["Nom"].trim() === "") {
      newErrors["Nom"] = "Le nom est obligatoire.";
    }
    if (!fieldsValues["Email"] || fieldsValues["Email"].trim() === "") {
      newErrors["Email"] = "L'email est obligatoire.";
    } else if (!isEmailValid(fieldsValues["Email"])) {
      newErrors["Email"] = "L'email n'est pas valide.";
    }
    if (!fieldsValues["Rôle"] || !fieldsValues["Rôle"].id) {
      newErrors["Rôle"] = "Veuillez sélectionner un rôle.";
    }
    return newErrors;
  };

  const diffUser = (original, modified) => {
    const diff = {};
    const initialFullName = original.FullName || original.nom || "";
    if (initialFullName.trim() !== modified.FullName.trim()) {
      diff.FullName = modified.FullName.trim();
    }
    const initialEmail = original.EmailAddress || original.email || "";
    if (initialEmail.trim() !== modified.EmailAddress.trim()) {
      diff.EmailAddress = modified.EmailAddress.trim();
    }
    if (
      (original.role?.Keyword || "") !== 
      (modified.Role?.Keyword || "")
    ) {
      diff.Role = { Keyword: modified.Role.Keyword };
    }
    if (
      JSON.stringify(original.promotions || []) !== 
      JSON.stringify(modified.Promotions || [])
    ) {
      diff.Promotions = modified.Promotions;
    }
    return diff;
  };

  const handleSubmit = async (fieldsValues) => {
    const newErrors = validateFields(fieldsValues);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setApiError('');
    const roleValue = fieldsValues["Rôle"];
    const roleKeyword = typeof roleValue === 'object' && roleValue.id
      ? roleValue.id.toString().trim()
      : roleValue.toString().trim();

    const modifiedUser = {
      EmailAddress: fieldsValues["Email"].trim(),
      FullName: fieldsValues["Nom"].trim(),
      Role: { Keyword: roleKeyword },
      Promotions: (fieldsValues["Promotions"] || []).map(p => p.id)
    };

    const differences = diffUser(initialUser, {
      EmailAddress: modifiedUser.EmailAddress,
      FullName: modifiedUser.FullName,
      Role: modifiedUser.Role,
      Promotions: modifiedUser.Promotions
    });

    if (Object.keys(differences).length === 0) {
      onClose();
      return;
    }

    try {
      await saveUser(initialUser.Id, differences, authToken);
      onSave();
      onClose();
    } catch (error) {
      setApiError(error.message);
    }
  };

  const handleClose = () => {
    setErrors({});
    setApiError('');
    onClose();
  };

  const clearApiError = () => {
    setApiError('');
  };

  const clearError = (label) => {
    setErrors(prev => ({ ...prev, [label]: "" }));
    if (apiError) setApiError('');
  };

  return (
    <DynamicModal 
      metadata={{ 
        createdAt: initialData.createdAt, 
        updatedAt: initialData.updatedAt 
      }}
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
