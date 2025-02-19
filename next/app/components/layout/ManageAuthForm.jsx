// app/components/layout/ManageAuthForm.jsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postTemporaryCode } from '@/app/services/users/id/temporaryCode/postTemporaryCode';

import CheckEmailForm from './CheckEmailForm';
import DefinePasswordForm from './DefinePasswordForm';
import LoginForm from './LoginForm';

const ManageAuthForm = () => {
  const [step, setStep] = useState('email');
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmailSuccess = (userId, passwordDefined, email) => {
    setUserId(userId);
    setEmail(email);
    setStep(passwordDefined ? 'login' : 'definePassword');
  };

  const handleLoginSuccess = () => {
    router.push('/home');
  };

  const handleDefinePasswordSuccess = () => {
    router.push('/login/link');
  };

  const handleBackToEmail = () => {
    setStep('email');
  };

  const handleGoToDefinePassword = async () => {
    if (!userId) return;
    await postTemporaryCode(userId);
    setStep('definePassword');
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

export default ManageAuthForm;
