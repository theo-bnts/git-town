// app/components/layout/LinkGitForm.jsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';

export default function LinkGitForm() {
  const router = useRouter();

  const handleGithubLink = () => {
    router.push(process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL);
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <p className={textStyles.bold}>Dernière étape ! (enfin presque...)</p>
        <p className={textStyles.default}>
          Cliquez sur le bouton ci-dessous pour lier votre compte GitHub.
        </p>
        <div className="flex justify-center">
          <Button variant="default" onClick={handleGithubLink} type="button">
            <p className={textStyles.boldWhite}>Lier mon compte GitHub</p>
          </Button>
        </div>
      </div>
    </Card>
  );
};
