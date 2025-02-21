// /app/components/layout/LinkOrgForm.jsx
'use client';

import React, { useEffect, useState } from 'react';
import postInvite from '@/app/services/users/id/github/postInvite';
import getUser from '@/app/services/users/id/getUser';
import { getCookie } from '@/app/services/cookies';
import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Text from '@/app/components/ui/Text';

const LinkOrgForm = ({ router }) => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const userId = getCookie('userId');
  const token = getCookie('token');

  const handleJoinOrg = async () => {
    if (!userId || !token) {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const user = await getUser(userId, token);
        if (user?.GitHubOrganizationMember) {
          clearInterval(interval);
          router.push('/home');
        }
      } catch (e) {
        console.error(e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [userId, token, router]);

  return (
    <Card variant="default">
      <div className="space-y-4">
        <Text variant="bold">
          Dernière étape ! (promis)
        </Text>
        <Text variant="default">
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </Text>
        {error && <Text variant="warn">{error}</Text>}
        <div className="flex justify-center">
          <Button variant="default" onClick={handleJoinOrg} type="button" loading={isLoading}>
            <Text variant="boldWhite">
              Rejoindre l’organisation
            </Text>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LinkOrgForm;
