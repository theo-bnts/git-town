// app/components/layout/LinkOrgForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import postInvite from '@/app/services/api/users/id/github/postInvite';
import getUser from '@/app/services/api/users/id/getUser';
import { getCookie } from '@/app/services/cookies';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import { useNotification } from '@/app/context/NotificationContext';

export default function LinkOrgForm() {
  const router = useRouter();
  const notify = useNotification();

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    async function fetchCookies() {
      const userId = await getCookie('userId');
      const token = await getCookie('token');
      setUserId(userId);
      setToken(token);
    }
    fetchCookies();
  }, []);

  const handleJoinOrg = async () => {
    if (!userId || !token) {
      notify('Informations manquantes. Veuillez vous reconnecter.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await postInvite(userId, token);
      window.open(
        process.env.NEXT_PUBLIC_GITHUB_JOIN_ORGANIZATION_URL,
        '_blank',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      );
      setInviteSent(true);
      notify("J'ai ouvert GitHub pour que vous rejoigniez l’organisation.", 'success');
    } catch (err) {
      if (err.message.includes('409')) {
        notify('Vous êtes déjà membre de l’organisation. Bienvenue dans GitTown ! Voici votre panel', 'success');
        router.replace('/');
      } else {
        notify(err.message || "Erreur lors de l’invitation.", 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrgJoined = async () => {
    if (!userId || !token) {
      notify('Informations manquantes. Veuillez vous reconnecter.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const user = await getUser(userId, token);
      if (user.GitHubOrganizationMember) {
        notify('Bienvenue dans GitTown ! Voici votre panel', 'success');
        router.replace('/');
      } else {
        notify("Vous n'êtes pas encore membre de l’organisation. Cliquez à nouveau sur Rejoindre l’organisation.", 'error');
      }
    } catch (err) {
      console.error(err);
      notify(err.message || "Impossible de vérifier l'adhésion. Veuillez réessayer.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <p className={textStyles.bold}>Dernière étape ! (promis)</p>
        <p className={textStyles.default}>
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </p>

        <div className={inviteSent ? 'flex justify-between gap-2' : 'flex justify-center'}>
          <Button
            variant="default"
            onClick={handleJoinOrg}
            type="button"
            loading={isLoading}
          >
            <p className={textStyles.boldWhite}>Rejoindre l’organisation</p>
          </Button>

          {inviteSent && (
            <Button
              variant="default"
              onClick={handleOrgJoined}
              type="button"
              loading={isLoading}
            >
              <p className={textStyles.boldWhite}>C'est fait ?</p>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
