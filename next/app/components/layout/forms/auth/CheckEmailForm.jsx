// app/components/layout/CheckEmailForm.jsx
'use client';

import React, { useState } from 'react';

import getEmailAddress from '@/app/services/api/users/emailAddress/getEmailAddress';
import postTemporaryCode from '@/app/services/api/users/id/temporaryCode/postTemporaryCode';

import { isEmailValid } from '@/app/services/validators';
import { setCookie }  from '@/app/services/cookies';

import { textStyles } from '@/app/styles/tailwindStyles';

import Button from '@/app/components/ui/Button';
import Card from '@/app/components/ui/Card';
import Input from '@/app/components/ui/Input';

export default function CheckEmailForm ({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => isEmailValid(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    setError('');

    if (!trimmedEmail) {
      setError('Veuillez saisir votre adresse e-mail universitaire.');
    } else if (!validateEmail(trimmedEmail)) {
      setError('L’adresse e-mail doit se terminer par etud.u-picardie.fr ou u-picardie.fr.');
    } else {
      setIsLoading(true);
      try {
        const data = await getEmailAddress(trimmedEmail);
        await setCookie('userId', data.Id);
  
        if (!data.PasswordDefined) {
          await postTemporaryCode(data.Id);
        }
        onSuccess(data.Id, data.PasswordDefined, trimmedEmail);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <p className={textStyles.bold}>Adresse e-mail universitaire</p>
          <Input
            variant="default"
            placeholder="Saisir votre adresse e-mail universitaire"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className={textStyles.warn}>{error}</p>}
          <div className="flex justify-center">
            <Button variant="default" type="submit" loading={isLoading}>
              <p className={textStyles.boldWhite}>Suivant</p>
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
