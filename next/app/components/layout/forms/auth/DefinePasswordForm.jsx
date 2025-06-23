'use client';

import React, { useState } from 'react';
import { InfoIcon } from '@primer/octicons-react';
import postPassword from '@/app/services/api/users/id/password/postPassword';
import { isPasswordValid, isTokenValid } from '@/app/services/validators';
import { textStyles } from '@/app/styles/tailwindStyles';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';
import { useNotification } from '@/app/context/NotificationContext';

export default function DefinePasswordForm({
  userId,
  email,
  onSuccess,
  onBack,
}) {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tooltips, setTooltips] = useState({ code: false, password: false });
  const notify = useNotification();

  const handleTooltipToggle = (key, open) => {
    setTooltips(prev => ({ ...prev, [key]: open }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(newPassword.trim())) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!isTokenValid(code)) {
      setError('Le code temporaire doit contenir 6 caractères.');
      return;
    }
    if (!userId) {
      setError('Identifiant utilisateur manquant, veuillez réessayer.');
      return;
    }

    setIsLoading(true);
    try {
      await postPassword(userId, code, newPassword);
      notify('Mot de passe défini avec succès.', 'success');
      onSuccess();
    } catch (err) {
      console.error(err);
      notify(err.message || 'Erreur lors de la définition du mot de passe.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <p className={textStyles.bold}>Adresse e-mail universitaire</p>
          <Input variant="disabled" value={email} disabled />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <p className={textStyles.bold}>Code reçu par e-mail</p>
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
                  <Card variant="success">
                    <p className={textStyles.defaultWhite}>
                      Nous venons de vous envoyer le code par e-mail, il est valide 5 minutes.
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
          <Input
            variant="default"
            placeholder="Saisir le code reçu par e-mail"
            value={code}
            onChange={e => setCode(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <p className={textStyles.bold}>Nouveau mot de passe</p>
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
                  <Card variant="success">
                    <p className={textStyles.defaultWhite}>
                      Votre mot de passe doit contenir au moins 8 caractères.
                    </p>
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
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className={textStyles.bold}>Confirmation mot de passe</p>
          <Input
            variant="default"
            placeholder="Saisir à nouveau votre nouveau mot de passe"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className={textStyles.warn}>{error}</p>}

        <div className="flex justify-between gap-2">
          <Button variant="outline" type="button" onClick={onBack}>
            <p className={textStyles.bold}>Précédent</p>
          </Button>
          <Button variant="default" type="submit" loading={isLoading}>
            <p className={textStyles.boldWhite}>Définir le mot de passe</p>
          </Button>
        </div>
      </form>
    </Card>
  );
}
