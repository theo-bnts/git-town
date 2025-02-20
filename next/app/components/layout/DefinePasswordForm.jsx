// app/components/layout/DefinePasswordForm.jsx
'use client';

import React, { useState } from 'react';
import { InfoIcon } from '@primer/octicons-react';

import { postPassword } from '@/app/services/users/id/password/postPassword';

import { isPasswordValid } from '@/app/services/validators';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import Text from '@/app/components/ui/Text';

const DefinePasswordForm = ({ userId, email, onBack }) => {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tooltips, setTooltips] = useState({ code: false, password: false });

  const validatePassword = (password) => isPasswordValid(password);

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
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTooltipToggle = (key, state) => {
    setTooltips((prev) => ({
      ...prev,
      [key]: state,
    }));
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Text variant="bold">Adresse e-mail universitaire</Text>
            <Input variant="disabled" value={email} disabled />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Text variant="bold">Code reçu par e-mail</Text>
              <div
                className="relative inline-block"
                onMouseLeave={() => handleTooltipToggle('code', false)}
              >
                <InfoIcon
                  size={16}
                  className="cursor-pointer"
                  onClick={() => handleTooltipToggle('code', !tooltips.code)}
                  onMouseEnter={() => handleTooltipToggle('code', true)}
                />
                {tooltips.code && (
                  <div className="absolute w-40 lg:w-80 p-1 z-50">
                    <Card variant="info">
                      <Text variant="defaultWhite">
                        Nous venons de vous envoyer le code par email, il est valide 5 minutes !
                      </Text>
                    </Card>
                  </div>
                )}
              </div>
            </div>
            <Input
              variant="default"
              placeholder="Saisir le code reçu par e-mail"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Text variant="bold">
                Nouveau mot de passe
              </Text>
              <div
                className="relative inline-block"
                onMouseLeave={() => handleTooltipToggle('password', false)}
              >
                <InfoIcon
                  size={16}
                  className="cursor-pointer"
                  onClick={() => handleTooltipToggle('password', !tooltips.password)}
                  onMouseEnter={() => handleTooltipToggle('password', true)}
                />
                {tooltips.password && (
                  <div className="absolute w-40 lg:w-80 p-1 z-50">
                    <Card variant="info">
                      <Text variant="defaultWhite">
                        Votre mot de passe doit contenir au moins 8 caractères.
                      </Text>
                    </Card>
                  </div>
                )}
              </div>
            </div>
            <Input
              variant="default"
              placeholder="Saisir votre nouveau mot de passe"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text variant="bold">
              Confirmation mot de passe
            </Text>
            <Input
              variant="default"
              placeholder="Saisir à nouveau votre nouveau mot de passe"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <Text variant="warn">{error}</Text>}
          <div className="flex justify-between">
            <Button variant="outline" type="button" onClick={onBack}>
              <Text variant="bold">
                Précédent
              </Text>
            </Button>
            <Button variant="default" type="submit" loading={isLoading}>
              <Text variant="boldWhite">
                Définir le mot de passe
              </Text>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default DefinePasswordForm;
