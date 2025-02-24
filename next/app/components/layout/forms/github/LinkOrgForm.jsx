// /app/components/layout/LinkOrgForm.jsx
'use client';

import React, { useEffect, useState } from 'react';

import getUser from '@/app/services/api/users/id/getUser';
import postInvite from '@/app/services/api/users/id/github/postInvite';

import { getCookie } from '@/app/services/cookies';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';

export default function LinkOrgForm({ router }) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userId = getCookie('userId');
  const token = getCookie('token');

  const handleJoinOrg = async () => {
    if (userId && token) {
      setIsLoading(true);
      try {
        await postInvite(userId, token);
        window.open(
          process.env.NEXT_PUBLIC_GITHUB_JOIN_ORGANIZATION_URL,
          '_blank',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const user = await getUser(userId, token);
        if (user?.GitHubOrganizationMember) {
          clearInterval(interval);
          router.push('/');
        }
      } catch (e) {
        setError(e.message);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [userId, token, router]);

  return (
    <Card variant="default">
      <div className="space-y-4">
        <p className={textStyles.bold}>Dernière étape ! (promis)</p>
        <p className={textStyles.default}>
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </p>
        {error && <p className={textStyles.warn}>{error}</p>}
        <div className="flex justify-center">
          <Button variant="default" onClick={handleJoinOrg} type="button" loading={isLoading}>
            <p className={textStyles.boldWhite}>Rejoindre l’organisation</p>
          </Button>
        </div>
      </div>
    </Card>
  );
};
