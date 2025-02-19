// app/components/layout/CheckEmailForm.jsx
'use client';

import React, { useState } from 'react';

import { getEmailAddress } from '@/app/services/users/emailAddress/getEmailAddress';
import { postTemporaryCode } from '@/app/services/users/id/temporaryCode/postTemporaryCode';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

const CheckEmailForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    return new RegExp(process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN, 'u').test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    setError('');

    if (!trimmedEmail) {
      setError("Veuillez saisir votre adresse e-mail universitaire.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("L’adresse e-mail doit se terminer par etud.u-picardie.fr ou u-picardie.fr.");
      return;
    }

    setIsLoading(true);
    try {
      const emailData = await getEmailAddress(trimmedEmail);
      document.cookie = `userId=${emailData.Id}; path=/;`;

      if (!emailData.PasswordDefined) {
        await postTemporaryCode(emailData.Id);
      }
      onSuccess(emailData.Id, emailData.PasswordDefined, trimmedEmail);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Text variant="bold">Adresse e-mail universitaire</Text>
          <Input
            variant="default"
            placeholder="Saisir votre adresse e-mail universitaire"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <Text variant="warn">{error}</Text>}
          <div className="flex justify-center">
            <Button variant="default" type="submit" loading={isLoading}>
              <Text variant="boldWhite">Suivant</Text>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default CheckEmailForm;
