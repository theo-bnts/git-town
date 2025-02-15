// app/components/layout/LinkGitForm.jsx
'use client';

import React from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Text from '../ui/Text';

const LinkGitForm = () => {
  const handleGithubLink = () => {
    window.location.href = process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL;
  };

  return (
    <Card variant="default">
      <div className="space-y-6">
        <Text variant="bold">Lier votre compte GitHub</Text>
        <Text variant="default">
          Cliquez sur le bouton ci-dessous pour lier votre compte GitHub.
        </Text>
        <Button variant="default" onClick={handleGithubLink} type="button">
          <Text variant="defaultBold">Lier mon compte GitHub</Text>
        </Button>
      </div>
    </Card>
  );
};

export default LinkGitForm;
