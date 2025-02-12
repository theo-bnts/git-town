// app/components/layout/LoginForm.jsx

import React, { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

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
   * Récupère la valeur d'un cookie par son nom
   * @param {string} name
   * @returns {string|null}
   */
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  /**
   * Supprime un cookie en lui assignant une date d'expiration passée
   * @param {string} name
   */
  const removeCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  /**
   * Vérifie l'adresse e-mail auprès du backend
   * Nouvelle route : GET ${process.env.NEXT_PUBLIC_BACKEND_URL}/users/{{EMAIL_ADDRESS}}/public
   * 
   * Réponses attendues :
   * - 200 : { "Id": "...", "PasswordDefined": false|true }
   * - 404 : { "statusCode": 404, "error": "UNKNOWN_EMAIL_ADDRESS" }
   * - 400 : { "statusCode": 400, "code": "FST_ERR_VALIDATION", … }
   * 
   * @param {string} emailAddress
   * @returns {Promise<Object>}
   */
  const fetchEmailDefinition = async (emailAddress) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${encodeURIComponent(emailAddress)}/public`
    );

    console.log(response);
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
      case 404:
        throw new Error("Adresse e-mail inconnue. Merci de vérifier ou de vous inscrire.");
      default:
        throw new Error("Erreur lors de la vérification de votre adresse e-mail.");
    }
  };

  /**
   * Demande la génération d'un code temporaire pour l'inscription
   * Nouvelle route : POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/users/{{USER_ID}}/temporary-code
   * 
   * Réponses attendues :
   * - 200 : le JSON avec le code temporaire et l'objet utilisateur
   * - 400 ou 404 : message d'erreur (on supprimera le cookie et redirige vers /login)
   * 
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  const fetchTemporaryCode = async (userId) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/temporary-code`, {
      method: 'POST'
    });
    if (response.ok) {
      return response.json();
    }
    const data = await response.json();
    switch (response.status) {
      case 400:
        throw new Error(`Erreur 400 : ${data.message || 'Bad Request'}`);
      case 404:
        throw new Error("Utilisateur inconnu.");
      default:
        throw new Error("Erreur lors de la récupération du code temporaire");
    }
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

      document.cookie = `userId=${emailData.Id}; path=/;`;

      if (emailData.PasswordDefined === false) {
        try {
          await fetchTemporaryCode(emailData.Id);
          setMode('signup');
        } catch (error) {
          console.error(error);
          removeCookie('userId');
          window.location.href = '/login';
        }
      } else if (emailData.PasswordDefined === true) {
        setMode('login');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Une erreur s'est produite lors de la vérification de votre adresse e-mail.");
    }
  };

  /**
   * Gère la soumission du formulaire en mode connexion
   * Nouvelle route : POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/users/{{USER_ID}}/token
   * 
   * Le body attendu est :
   * {
   *    "Password": "{{PASSWORD}}"
   * }
   * 
   * En cas de succès (200), on stocke le token dans un cookie avec SameSite=Strict pour 7 jours et on redirige vers /home.
   * En cas d'erreur 401, on affiche une alerte "Mot de passe invalide".
   * En cas d'erreur 400, on supprime le cookie userId et on réinitialise le formulaire.
   */
  const handleLoginSubmit = async () => {
    const userId = getCookie('userId');
    if (!userId) {
      alert("Identifiant utilisateur manquant, veuillez réessayer.");
      resetFormState();
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Password: password.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Stocker le token dans un cookie avec SameSite=Strict pour 7 jours
        document.cookie = `token=${data.Value}; max-age=${60 * 60 * 24 * 7}; path=/; SameSite=Strict;`;

        // Redirection vers /home
        window.location.href = '/home';
      } else {
        if (response.status === 401) {
          alert("Mot de passe invalide, vérifiez vos informations.");
        } else if (response.status === 400) {
          alert("Erreur de validation. Veuillez réessayer.");
          removeCookie('userId');
          resetFormState();
        } else {
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
   * (La logique d'inscription est à implémenter selon vos besoins)
   */
  const handleSignupSubmit = async () => {
    console.log('Soumission du formulaire d’inscription :', {
      email,
      code,
      newPassword,
      confirmPassword,
    });
    // À compléter : logique d'inscription (par exemple, validation du code, enregistrement du nouveau mot de passe, etc.)
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
