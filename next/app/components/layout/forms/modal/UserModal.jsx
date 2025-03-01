'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import Card from '@/app/components/ui/Card';
import ComboBox from '@/app/components/ui/ComboBox';

import { XIcon } from '@primer/octicons-react';
import { textStyles } from '@/app/styles/tailwindStyles';

export default function UserModal({ isOpen, onClose, onCreate }) {
  const initialFormState = { name: '', email: '', role: '' };
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    { id: 1, value: "Administrateur" },
    { id: 2, value: "Enseignant" },
    { id: 3, value: "Étudiant" }
  ]

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis.";
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = "Une adresse e-mail valide est requise.";
    }
    if (!formData.role) {
      newErrors.role = "Le rôle est requis.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onCreate(formData);
      onClose();
    } catch (error) {
      setErrors({ form: "Erreur lors de la création de l'utilisateur." });
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[var(--popup-color)] flex items-center justify-center z-50">
      <Card variant="default" className="relative w-[400px] p-6">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Edition</h2>
          <Button variant="action_sq" onClick={onClose}>
            <XIcon size={24}/>
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              variant="default"
              name="name"
              placeholder="Nom"
              value={formData.name}
              onChange={handleInputChange}
            />
            {errors.name && <p className={textStyles.warn}>{errors.name}</p>}
          </div>
          <div>
            <Input
              variant="default"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            {errors.email && <p className={textStyles.warn}>{errors.email}</p>}
          </div>
          <div>
            <ComboBox options={options} onSelect={handleRoleChange} value={formData.role} />
            {errors.role && <p className={textStyles.warn}>{errors.role}</p>}
          </div>
          {errors.form && <p className={textStyles.warn}>{errors.form}</p>}

          <div className="flex justify-center pt-2">
            <Button variant="default" type="submit" loading={isLoading}>
              <p className={textStyles.defaultWhite}>Enregistrer</p>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
