// app/components/layout/LoginForm.jsx

import React, { useState } from 'react';

// Import des fonctions d'appel à l'API
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

// Composant pour afficher le message d'erreur avec un espace réservé
const ErrorMsg = ({ message }) => (
  <div className="min-h-0">
    {message ? <Text variant="warn" className="text-sm">{message}</Text> : <span>&nbsp;</span>}
  </div>
);

const LoginForm = () => {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // États pour les messages d'erreur
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const removeCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  const resetForm = () => {
    setMode(null);
    setEmail('');
    setPassword('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    // Réinitialiser aussi les erreurs
    setEmailError('');
    setPasswordError('');
    setCodeError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  };

  /**
   * Gère l'étape "Suivant" après saisie de l'e-mail
   */
  const handleNext = async () => {
    const trimmedEmail = email.trim();
    setEmailError('');
    if (!trimmedEmail) {
      setEmailError("Veuillez saisir votre adresse e-mail universitaire");
      return;
    }
    setIsLoading(true);
    try {
      // Simulation d'un appel API avec 2 secondes de délai
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const emailData = await fetchEmailDefinition(trimmedEmail);
      document.cookie = `userId=${emailData.Id}; path=/;`;

      if (emailData.PasswordDefined === false) {
        await fetchTemporaryCode(emailData.Id);
        setMode('signup');
      } else {
        setMode('login');
      }
    } catch (error) {
      console.error(error);
      setEmailError(
        error.message ||
          "Une erreur s'est produite lors de la vérification de votre adresse e-mail."
      );
    }
    setIsLoading(false);
  };

  /**
   * Gère la soumission en mode connexion
   */
  const handleLoginSubmit = async () => {
    setPasswordError('');
    const userId = getCookie('userId');
    if (!userId) {
      setPasswordError("Identifiant utilisateur manquant, veuillez réessayer.");
      resetForm();
      return;
    }
    setIsLoading(true);
    try {
      const data = await login(userId, password);
      document.cookie = `token=${data.Value}; max-age=${
        60 * 60 * 24 * 7
      }; path=/; SameSite=Strict;`;
      window.location.href = '/home';
      return;
    } catch (error) {
      console.error(error);
      if (error.message.includes('invalide')) {
        setPasswordError("Mot de passe invalide, vérifiez vos informations.");
      } else if (error.message.includes('400')) {
        setPasswordError("Erreur de validation. Veuillez réessayer.");
        removeCookie('userId');
        resetForm();
      } else {
        setPasswordError(
          error.message || "Une erreur est survenue. Veuillez réessayer plus tard."
        );
      }
    }
    setIsLoading(false);
  };

  /**
   * Gère la soumission en mode inscription
   */
  const handleSignupSubmit = async () => {
    // Réinitialiser les erreurs associées
    setCodeError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
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
      console.error(error);
      if (error.message.includes('temporaire invalide')) {
        setCodeError("Code temporaire invalide.");
      } else if (error.message.includes('inconnu')) {
        setCodeError("Utilisateur inconnu.");
        removeCookie('userId');
        resetForm();
      } else if (error.message.includes('validation')) {
        setCodeError(error.message);
        if (error.message.includes('params/Id')) {
          removeCookie('userId');
          resetForm();
        }
      } else {
        setCodeError(error.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    }

    setIsLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    switch (mode) {
      case 'login':
        handleLoginSubmit();
        break;
      case 'signup':
        handleSignupSubmit();
        break;
      default:
        break;
    }
  };

  const renderFormFields = () => {
    switch (mode) {
      case null:
        return (
          <div className="flex justify-center">
            <Button variant="default" onClick={handleNext} loading={isLoading}>
              <Text variant="defaultBold">Suivant</Text>
            </Button>
          </div>
        );

      case 'login':
        return (
          <>
            <div>
              <Text variant="bold">Mot de passe</Text>
              <Input
                variant={password ? 'selected' : 'default'}
                placeholder="Saisir le mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
              />
              <ErrorMsg message={passwordError} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>
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
          <>
            <div>
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
            <div>
              <Text variant="bold">Nouveau mot de passe</Text>
              <Input
                variant={newPassword ? 'selected' : 'default'}
                placeholder="Saisir votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError('');
                }}
              />
              <ErrorMsg message={newPasswordError} />
            </div>
            <div>
              <Text variant="bold">Confirmation mot de passe</Text>
              <Input
                variant={confirmPassword ? 'selected' : 'default'}
                placeholder="Saisir à nouveau votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
              />
              <ErrorMsg message={confirmPasswordError} />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit" loading={isLoading}>
                <Text variant="boldWhite">Inscription</Text>
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
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
        </div>
        {renderFormFields()}
      </form>
    </Card>
  );
};

export default LoginForm;
