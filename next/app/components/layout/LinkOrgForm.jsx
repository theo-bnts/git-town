// app/components/layout/LinkOrgForm.jsx
'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Text from '../ui/Text';

const LinkOrgForm = () => {
  const [orgJoined, setOrgJoined] = useState(false);

  const handleJoinOrg = async () => {
    // Ici, ajoutez la logique pour rejoindre l’organisation (appel API, etc.)
    setOrgJoined(true);
  };

  return (
    <Card variant="default">
      <div className="space-y-6">
        <Text variant="bold">Rejoindre l’organisation</Text>
        <Text variant="default">
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </Text>
        <Button
          variant="default"
          onClick={handleJoinOrg}
          disabled={orgJoined}
          type="button"
        >
          <Text variant="defaultBold">
            {orgJoined ? 'Organisation rejointe' : 'Rejoindre l’organisation'}
          </Text>
        </Button>
      </div>
    </Card>
  );
};

export default LinkOrgForm;
