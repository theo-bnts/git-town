// app/components/layout/LinkForm.jsx
import React, { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Text from '../ui/Text';

const LinkForm = () => {
  const [githubLinked, setGithubLinked] = useState(false);
  const [orgJoined, setOrgJoined] = useState(false);

  const handleGithubLink = () => {
    window.location.href = process.env.NEXT_PUBLIC_GITHUB_OAUTH_URL;
};

  const handleJoinOrg = async () => {

};

  return (
    <Card variant="default">
      <div className="space-y-6">
        <Text variant="bold">Dernière étape ! (enfin presque...)</Text>
        <Text variant="default">
          Nous voudrions accéder à votre compte GitHub pour collecter votre identifiant
        </Text>
        <Button variant="default" onClick={handleGithubLink} type="buton" disabled={githubLinked}>
          <Text variant="defaultBold">
            {githubLinked ? 'Compte GitHub lié' : 'Lier son compte GitHub'}
          </Text>
        </Button>
      </div>
        {githubLinked && (
          <div>
            <Text variant="bold">Dernière étape ! (promis)</Text>
            <Text variant="default">
              Il ne vous reste plus qu’à rejoindre l’organisation. N’oubliez pas de revenir ici ensuite !
            </Text>
            <Button variant="default" onClick={handleJoinOrg} disabled={orgJoined}>
              <Text variant="defaultBold">
                {orgJoined ? 'Organisation rejointe' : 'Rejoindre l’organisation'}
              </Text>
            </Button>
          </div>
        )}
    </Card>
  );
};

export default LinkForm;
