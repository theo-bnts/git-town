'use client';

import React, { useState, useEffect } from 'react';
import postInvite from '@/app/services/api/users/id/github/postInvite';
import { getCookie } from '@/app/services/cookies';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';

import { useNotification } from '@/app/context/NotificationContext';

export default function LinkOrgForm({ router }) {
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const notify = useNotification();

  useEffect(() => {
    (async () => {
      const userId = await getCookie('userId');
      const token = await getCookie('token');
      setUserId(userId);
      setToken(token);
    })();
  }, []);

  const handleJoinOrg = async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    try {
      await postInvite(userId, token);
      setInviteSent(true);

      notify('Une nouvelle fenêtre a été ouverte pour rejoindre l’organisation GitHub.', 'success');

      window.open(
        process.env.NEXT_PUBLIC_GITHUB_JOIN_ORGANIZATION_URL,
        '_blank',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );
    } catch (err) {
      if (err.message === '(409) : Membre de l’organisation GitHub.') {
        notify('Vous êtes déjà membre de l’organisation.', 'success');
        router.replace('/');
      } else {
        notify(err.message || 'Erreur lors de l’invitation.', 'error');
        setError(err.message);
      }
    }
    setIsLoading(false);
  };

  const handleOrgJoined = () => {
    notify("Bienvenue dans l’organisation GitHub !", 'success');
    router.replace('/');
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <p className={textStyles.bold}>Dernière étape ! (promis)</p>
        <p className={textStyles.default}>
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </p>
        {error && <p className={textStyles.warn}>{error}</p>}
        <div className={inviteSent ? 'flex justify-between gap-2' : 'flex justify-center'}>
          <Button variant="default" onClick={handleJoinOrg} type="button" loading={isLoading}>
            <p className={textStyles.boldWhite}>Rejoindre l’organisation</p>
          </Button>
          {inviteSent && (
            <Button variant="default" onClick={handleOrgJoined} type="button">
              <p className={textStyles.boldWhite}>C'est fait ?</p>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
