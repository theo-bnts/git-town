// app/components/layout/ManageAuthForm.jsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import postTemporaryCode from '@/app/services/api/users/id/temporaryCode/postTemporaryCode';

import CheckEmailForm from '@/app/components/layout/forms/auth/CheckEmailForm';
import DefinePasswordForm from '@/app/components/layout/forms/auth/DefinePasswordForm';
import LoginForm from '@/app/components/layout/forms/auth/LoginForm';

export default function ManageAuthForm() {
  const [step, setStep] = useState('email');
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmailSuccess = (userId, passwordDefined, email) => {
    setUserId(userId);
    setEmail(email);
    setStep(passwordDefined ? 'login' : 'definePassword');
  };

  const handleLoginSuccess = () => router.push('/');

  const handleDefinePasswordSuccess = () => router.push('/');

  const handleBackToEmail = () => setStep('email');

  const handleGoToDefinePassword = async () => {
    if (userId) {
      await postTemporaryCode(userId);
      setStep('definePassword');
    }
  };

  return (
    <>
      {step === 'email' && (
        <CheckEmailForm onSuccess={handleEmailSuccess} />
      )}
      {step === 'login' && (
        <LoginForm
          userId={userId}
          email={email}
          onSuccess={handleLoginSuccess}
          onBack={handleBackToEmail}
          onGoToDefinePassword={handleGoToDefinePassword}
        />
      )}
      {step === 'definePassword' && (
        <DefinePasswordForm
          userId={userId}
          email={email}
          onSuccess={handleDefinePasswordSuccess}
          onBack={handleBackToEmail}
        />
      )}
    </>
  );
};
