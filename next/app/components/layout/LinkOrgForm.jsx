// /app/components/layout/LinkOrgForm.jsx
'use client';

import React, { useState } from 'react';

import postInvite from '@/app/services/users/id/github/postInvite';

import { getCookie } from '@/app/services/cookies';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Text from '@/app/components/ui/Text';

const LinkOrgForm = () => {
  const [error, setError] = useState('');
  const userId = getCookie('userId');
  const token = getCookie('token');

  const handleJoinOrg = async () => {
    if (!userId || !token) {
      return;
    }
    try {
      await postInvite(userId, token);
      window.location.href = process.env.NEXT_PUBLIC_GITHUB_JOIN_ORGANIZATION_URL;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <Text variant="bold">Dernière étape ! (promis)</Text>
        <Text variant="default">
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </Text>
        {error && <Text variant="warn">{error}</Text>}
        <div className="flex justify-center">
          <Button variant="default" onClick={handleJoinOrg} type="button">
            <Text variant="boldWhite">Rejoindre l’organisation</Text>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LinkOrgForm;
