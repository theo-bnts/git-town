// app/components/layout/LoginForm.jsx
'use client';

import React, { useState } from 'react';

import { InfoIcon, MailIcon } from '@primer/octicons-react';
import postToken from '@/app/services/users/id/token/postToken';

import { isPasswordValid } from '@/app/services/validators';
import { setCookie } from '@/app/services/cookies';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import Text from '@/app/components/ui/Text';

const LoginForm = ({ userId, email, onSuccess, onBack, onGoToDefinePassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnvelopeTooltipOpen, setIsEnvelopeTooltipOpen] = useState(false);

  const validatePassword = (password) => isPasswordValid(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError("Identifiant utilisateur manquant, veuillez réessayer.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setIsLoading(true);
    try {
      const data = await postToken(userId, password);
      setCookie('token', data.Value);
      onSuccess(data.Value);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMailIconClick = async () => {
    if (!userId) {
      setError("Identifiant utilisateur manquant.");
      return;
    }
    try {
      await onGoToDefinePassword();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Text variant="bold">
              Adresse e-mail universitaire
            </Text>
            <Input variant="disabled" value={email} disabled />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Text variant="bold">
                Mot de passe
              </Text>
              <div
                className="relative inline-block"
                onMouseLeave={() => setIsEnvelopeTooltipOpen(false)}
              >
                <InfoIcon
                  size={16}
                  className="cursor-pointer"
                  onClick={() => setIsEnvelopeTooltipOpen(!isEnvelopeTooltipOpen)}
                  onMouseEnter={() => setIsEnvelopeTooltipOpen(true)}
                />
                {isEnvelopeTooltipOpen && (
                  <div className="absolute w-40 lg:w-80 p-1 z-50">
                    <Card variant="info">
                      <Text variant="defaultWhite">
                        Vous pouvez changer votre mot de passe en cliquant sur l'enveloppe.
                      </Text>
                    </Card>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <Input
                variant="default"
                placeholder="Saisir le mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <MailIcon
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={handleMailIconClick}
              />
            </div>
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
                Connexion
              </Text>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;
