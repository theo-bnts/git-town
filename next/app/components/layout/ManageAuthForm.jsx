// app/components/layout/ManageAuthForm.jsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import CheckEmailForm from './CheckEmailForm';
import DefinePasswordForm from './DefinePasswordForm';
import LoginForm from './LoginForm';

const ManageAuthForm = () => {
  const [step, setStep] = useState('email');
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  const handleEmailSuccess = (userId, passwordDefined) => {
    setUserId(userId);
    if (passwordDefined) {
      setStep('login');
    } else {
      setStep('definePassword');
    }
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

  return (
    <>
      {step === 'email' && <CheckEmailForm onSuccess={handleEmailSuccess} />}
      {step === 'login' && (
        <LoginForm
          userId={userId}
          onSuccess={handleLoginSuccess}
          onBack={handleBackToEmail}
        />
      )}
      {step === 'definePassword' && (
        <DefinePasswordForm
          userId={userId}
          onSuccess={handleDefinePasswordSuccess}
          onBack={handleBackToEmail}
        />
      )}
    </>
  );
};

export default ManageAuthForm;
