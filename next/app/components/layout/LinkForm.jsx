import React, { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

const LinkForm = () => {
  const [mode, setMode] = useState(null);

const handleSubmit = (e) => {
};

const handleNext = () => {
};

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === github && (
        <div>
          <Text variant="bold">Dernière étape ! (enfin preque...)</Text>
          <Text variant="default">Nous voudrions accéder à votre compte GitHub pour collecter votre identifiant</Text>
          <Button variant="default" onClick={handleNext}>
            <Text variant="defaultBold">Lier son compte GitHub</Text>
          </Button>
        </div>
        )}
      </form>
    </Card>
  )
}

export default LinkForm;