// app/components/layout/LoginForm.jsx
'use client';

import React, { useState } from 'react';
import { InfoIcon, MailIcon } from '@primer/octicons-react';
import { postToken } from '@/app/services/users/id/token/postToken';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Text from '../ui/Text';

const LoginForm = ({ userId, email, onSuccess, onBack, onGoToDefinePassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnvelopeTooltipOpen, setIsEnvelopeTooltipOpen] = useState(false);

  const validatePassword = (password) =>
    password.length >= process.env.NEXT_PUBLIC_USER_PASSWORD_MIN_LENGTH;

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
      document.cookie = `token=${data.Value}; max-age=${60 * 60 * 24 * 7}; path=/; SameSite=Strict;`;
      onSuccess(data.Value);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMailIconClick = async () => {
    try {
      if (!userId) {
        setError("Identifiant utilisateur manquant.");
        return;
      }
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
            <Text variant="bold">Adresse e-mail universitaire</Text>
            <Input variant="disabled" value={email} disabled />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Text variant="bold">Mot de passe</Text>
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
                        Vous pouvez changer votre mot de passe en cliquant sur l'enveloppe
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
          {error && <Text variant="warn" className="text-sm">{error}</Text>}
          <div className="flex justify-between">
            <Button variant="outline" type="button" onClick={onBack}>
              <Text variant="bold">Précédent</Text>
            </Button>
            <Button variant="default" type="submit" loading={isLoading}>
              <Text variant="boldWhite">Connexion</Text>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default LoginForm;
