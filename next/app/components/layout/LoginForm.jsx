// app/components/layout/LoginForm.jsx

import React, { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const LoginForm = () => {
  // Modes possibles : null, 'login', 'signup'
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Réinitialise l'état du formulaire (sauf l'email)
   */
  const resetFormState = () => {
    setMode(null);
    setPassword('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  /**
   * Vérifie l'adresse e-mail auprès du backend et gère les erreurs via un switch-case
   * @param {string} emailAddress
   * @returns {Promise<Object>}
   */
  const fetchEmailDefinition = async (emailAddress) => {
    const response = await fetch(
      `${BACKEND_URL}/user/password?EmailAddress=${encodeURIComponent(emailAddress)}`
    );

    if (response.ok) {
      return response.json();
    }

    const data = await response.json();

    switch (response.status) {
      case 400:
        if (data.code === 'FST_ERR_VALIDATION') {
          throw new Error(
            'Adresse e-mail non conforme. Veuillez saisir une adresse "u-picardie.fr" ou "etud.u-picardie.fr".'
          );
        }
        throw new Error(`Erreur 400 : ${data.message || 'Bad Request'}`);
      case 429:
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('Vous avez atteint la limite de tentatives, veuillez réessayer plus tard.');
        }
        break;
      default:
        throw new Error("Erreur lors de la vérification de votre adresse e-mail.");
    }
  };

  /**
   * Demande la génération d'un code temporaire pour l'inscription
   * @param {string} emailAddress
   */
  const fetchTemporaryCode = async (emailAddress) => {
    const response = await fetch(`${BACKEND_URL}/user/temporary-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmailAddress: emailAddress }),
    });
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du code temporaire');
    }
    return response.json();
  };

  /**
   * Gère l'étape "Suivant" après saisie de l'e-mail
   */
  const handleNext = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      alert("Veuillez saisir votre adresse e-mail universitaire");
      return;
    }

    try {
      const emailData = await fetchEmailDefinition(trimmedEmail);

      if (emailData.Defined === false) {
        // L'utilisateur n'existe pas, on demande un code temporaire pour l'inscription
        await fetchTemporaryCode(trimmedEmail);
        setMode('signup');
      } else if (emailData.Defined === true) {
        // L'utilisateur existe, on passe en mode connexion
        setMode('login');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Une erreur s'est produite lors de la vérification de votre adresse e-mail.");
    }
  };

  /**
   * Gère la soumission du formulaire en mode connexion avec gestion des codes HTTP par switch-case
   */
  const handleLoginSubmit = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/user/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EmailAddress: email.trim(),
          Password: password.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Stockage du token dans un cookie pour 7 jours
        document.cookie = `token=${data.Value}; max-age=${60 * 60 * 24 * 7}; path=/;`;

        // Redirection en fonction de l'état de l'utilisateur
        if (data.User && data.User.GitHubId) {
          window.location.href = '/home';
        } else {
          window.location.href = '/home';
        }
      } else {
        switch (response.status) {
          case 401:
            alert("Mot de passe invalide, vérifiez vos informations.");
            break;
          case 404:
            alert("Adresse e-mail inconnue. Merci de vérifier ou de vous inscrire.");
            break;
          default:
            alert("Une erreur est survenue. Veuillez réessayer plus tard.");
        }
      }
    } catch (error) {
      console.error(error);
      alert('Une erreur est survenue lors de la tentative de connexion.');
    }
  };

  /**
   * Gère la soumission du formulaire en mode inscription
   */
  const handleSignupSubmit = async () => {
    console.log('Soumission du formulaire d’inscription :', {
      email,
      code,
      newPassword,
      confirmPassword,
    });
    // Vous pouvez adapter la logique d'inscription ici en utilisant le même principe.
  };

  /**
   * Gestion de la soumission du formulaire (connexion ou inscription)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    switch (mode) {
      case 'login':
        await handleLoginSubmit();
        break;
      case 'signup':
        await handleSignupSubmit();
        break;
      default:
        break;
    }
  };

  /**
   * Rendu conditionnel des champs en fonction du mode via switch-case
   */
  const renderFormFields = () => {
    switch (mode) {
      case null:
        return (
          <div className="flex justify-center">
            <Button variant="default" onClick={handleNext}>
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFormState}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit">
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
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Nouveau mot de passe</Text>
              <Input
                variant={newPassword ? 'selected' : 'default'}
                placeholder="Saisir votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Confirmation mot de passe</Text>
              <Input
                variant={confirmPassword ? 'selected' : 'default'}
                placeholder="Saisir votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFormState}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit">
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
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!mode}
          />
        </div>
        {renderFormFields()}
      </form>
    </Card>
  );
};

export default LoginForm;
