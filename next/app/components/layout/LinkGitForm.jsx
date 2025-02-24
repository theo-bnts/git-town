// app/components/layout/LinkGitForm.jsx
'use client';

import React from 'react';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Text from '@/app/components/ui/Text';

const LinkGitForm = () => {
  const handleGithubLink = () => {
    window.location.href = process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL;
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <Text variant="bold">
          Dernière étape ! (enfin presque...)
        </Text>
        <Text variant="default">
          Cliquez sur le bouton ci-dessous pour lier votre compte GitHub.
        </Text>
        <div className="flex justify-center">
          <Button variant="default" onClick={handleGithubLink} type="button">
            <Text variant="boldWhite">
              Lier mon compte GitHub
            </Text>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default LinkGitForm;
