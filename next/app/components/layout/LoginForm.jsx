// /app/components/layout/LoginForm.jsx
import React, { useState } from 'react';

import {
  fetchEmailDefinition,
  fetchTemporaryCode,
  login,
  signup,
} from '@/app/services/routes';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

const ErrorMsg = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mt-1">
      <Text variant="warn" className="text-sm">{message}</Text>
    </div>
  );
};

/**
 * Validations basiques front.
 */
const validateEmail = (email) => {
  return new RegExp(process.env.NEXT_PUBLIC_USER_EMAIL_ADDRESS_PATTERN, 'u').test(email);
};

const validatePassword = (password) => {
  return password.length >= process.env.NEXT_PUBLIC_USER_PASSWORD_MIN_LENGTH;
};

const LoginForm = () => {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const getCookie = (name) => {
    const cookieValue = `; ${document.cookie}`;
    const parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  };

  const resetForm = () => {
    setMode(null);
    setEmail('');
    setPassword('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setEmailError('');
    setPasswordError('');
    setCodeError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  };

  const handleNext = async () => {
    const trimmedEmail = email.trim();
    setEmailError('');

    if (!trimmedEmail) {
      setEmailError("Veuillez saisir votre adresse e-mail universitaire.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setEmailError("L’adresse e-mail doit se terminer par etud.u-picardie.fr ou u-picardie.fr.");
      return;
    }

    setIsLoading(true);
    try {
      const emailData = await fetchEmailDefinition(trimmedEmail);
      document.cookie = `userId=${emailData.Id}; path=/;`;

      if (!emailData.PasswordDefined) {
        await fetchTemporaryCode(emailData.Id);
        setMode('signup');
      } else {
        setMode('login');
      }
    } catch (error) {
      setEmailError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async () => {
    setPasswordError('');
    const userId = getCookie('userId');

    if (!userId) {
      setPasswordError("Identifiant utilisateur manquant, veuillez réessayer.");
      resetForm();
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await login(userId, password);
      document.cookie = `token=${data.Value}; max-age=${60 * 60 * 24 * 7}; path=/; SameSite=Strict;`;
      window.location.href = '/home';
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async () => {
    setCodeError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!validatePassword(newPassword.trim())) {
      setNewPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    const userId = getCookie('userId');
    if (!userId) {
      setCodeError("Identifiant utilisateur manquant, veuillez réessayer.");
      resetForm();
      return;
    }

    setIsLoading(true);
    try {
      await signup(userId, code, newPassword);
      window.location.href = '/login/link';
    } catch (error) {
      setCodeError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      handleLoginSubmit();
    } else if (mode === 'signup') {
      handleSignupSubmit();
    }
  };

  const renderFormFields = () => {
    switch (mode) {
      case null:
        return (
          <div className="space-y-4">
            <Text variant="bold">Adresse e-mail universitaire</Text>
            <Input
              variant={mode ? 'disabled' : email ? 'selected' : 'default'}
              placeholder="Saisir votre adresse e-mail universitaire"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              disabled={!!mode}
            />
            <ErrorMsg message={emailError} />
            <div className="flex justify-center">
              <Button variant="default" onClick={handleNext} loading={isLoading}>
                <Text variant="defaultBold">Suivant</Text>
              </Button>
            </div>
          </div>
        );

      case 'login':
        return (
          <>
            <div className="space-y-4">
              <Text variant="bold">Mot de passe</Text>
              <Input
                variant={password ? 'selected' : 'default'}
                placeholder="Saisir le mot de passe"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
              />
              <ErrorMsg message={passwordError} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={resetForm}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit" loading={isLoading}>
                <Text variant="boldWhite">Connexion</Text>
              </Button>
            </div>
          </>
        );

      case 'signup':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Text variant="bold">Code reçu par e-mail</Text>
              <Input
                variant={code ? 'selected' : 'default'}
                placeholder="Saisir le code reçu par e-mail"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (codeError) setCodeError('');
                }}
              />
              <ErrorMsg message={codeError} />
            </div>
            <div className="space-y-2">
              <Text variant="bold">Nouveau mot de passe</Text>
              <Input
                variant={newPassword ? 'selected' : 'default'}
                placeholder="Saisir votre nouveau mot de passe"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError('');
                }}
              />
              <ErrorMsg message={newPasswordError} />
            </div>
            <div className="space-y-2">
              <Text variant="bold">Confirmation mot de passe</Text>
              <Input
                variant={confirmPassword ? 'selected' : 'default'}
                placeholder="Saisir à nouveau votre nouveau mot de passe"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
              />
              <ErrorMsg message={confirmPasswordError} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" type="button" onClick={resetForm}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit" loading={isLoading}>
                <Text variant="boldWhite">Inscription</Text>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit}>
        {renderFormFields()}
      </form>
    </Card>
  );
};

export default LoginForm;
