// app/components/layout/DefinePasswordForm.jsx
'use client';

import React, { useState } from 'react';

import { postPassword } from '@/app/services/users/id/password/postPassword';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Text from '../ui/Text';

const DefinePasswordForm = ({ userId, onSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pwd) =>
    pwd.length >= process.env.NEXT_PUBLIC_USER_PASSWORD_MIN_LENGTH;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validatePassword(newPassword.trim())) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!userId) {
      setError("Identifiant utilisateur manquant, veuillez réessayer.");
      return;
    }
    setIsLoading(true);
    try {
      await postPassword(userId, code, newPassword);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Text variant="bold">Code reçu par e-mail</Text>
            <Input
              placeholder="Saisir le code reçu par e-mail"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="bold">Nouveau mot de passe</Text>
            <Input
              variant="default"
              placeholder="Saisir votre nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="bold">Confirmation mot de passe</Text>
            <Input
              variant="default"
              placeholder="Saisir à nouveau votre nouveau mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <Text variant="warn" className="text-sm">{error}</Text>}
          <div className="flex justify-between">
            <Button variant="outline" type="button" onClick={onBack}>
              <Text variant="bold">Précédent</Text>
            </Button>
            <Button variant="default" type="submit" loading={isLoading}>
              <Text variant="boldWhite">Définir le mot de passe</Text>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default DefinePasswordForm;
