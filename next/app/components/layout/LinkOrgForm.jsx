// app/components/layout/LinkOrgForm.jsx

import React from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Text from '../ui/Text';

const LinkOrgForm = () => {
  const handleJoinOrg = async () => {
    window.location.href = process.env.NEXT_PUBLIC_GITHUB_JOIN_ORGANIZATION_URL;
  };

  return (
    <Card variant="default">
      <div className="space-y-4">
        <Text variant="bold">
          Cliquez sur le bouton ci-dessous pour rejoindre l’organisation.
        </Text>
        <Button
          variant="default"
          onClick={handleJoinOrg}
          type="button"
        >
          <Text variant="defaultBold">Rejoindre l’organisation</Text>
        </Button>
      </div>
    </Card>
  );
};

export default LinkOrgForm;
