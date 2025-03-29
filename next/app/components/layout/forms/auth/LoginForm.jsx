// app/components/layout/LoginForm.jsx
'use client';

import React, { useState } from 'react';
import { InfoIcon, MailIcon } from '@primer/octicons-react';

import postToken from '@/app/services/api/users/id/token/postToken';

import { isPasswordValid } from '@/app/services/validators';
import { setCookie } from '@/app/services/cookies';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';

export default function LoginForm({ userId, email, onSuccess, onBack, onGoToDefinePassword }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  const validatePassword = (password) => isPasswordValid(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Identifiant utilisateur manquant, veuillez réessayer.');
    } else if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
    } else {
      setIsLoading(true);
      try {
        const data = await postToken(userId, password);
        await setCookie('token', data.Value);
        await setCookie('tokenId', data.Id);
        onSuccess(data.Value);
      } catch (err) {
        setError(err.message);
        console.error(err);
      }
      setIsLoading(false);
    }
  };

  const handleMailIconClick = async () => {
    if (!userId) {
      setError('Identifiant utilisateur manquant.');
    } else {
      try {
        await onGoToDefinePassword();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className={textStyles.bold}>Adresse e-mail universitaire</p>
            <Input variant="disabled" value={email} disabled />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <p className={textStyles.bold}>Mot de passe</p>
              <div
                className="relative inline-block"
                onMouseLeave={() => setTooltip(false)}
              >
                <InfoIcon
                  size={16}
                  className="cursor-pointer"
                  onClick={() => setTooltip(!tooltip)}
                  onMouseEnter={() => setTooltip(true)}
                />
                {tooltip && (
                  <div className="absolute w-40 lg:w-80 p-1 z-50">
                    <Card variant="success">
                      <p className={textStyles.defaultWhite}>
                        Vous pouvez changer votre mot de passe en cliquant sur l'enveloppe.
                      </p>
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
          {error && <p className={textStyles.warn}>{error}</p>}
          <div className="flex justify-between gap-2">
            <Button variant="outline" type="button" onClick={onBack}>
              <p className={textStyles.bold}>Précédent</p>
            </Button>
            <Button variant="default" type="submit" loading={isLoading}>
              <p className={textStyles.boldWhite}>Connexion</p>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
