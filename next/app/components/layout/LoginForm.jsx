// app/components/layout/LoginForm.jsx
import React, { useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Text from '../ui/Text';

const LoginForm = () => {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = async () => {
    if (!email.trim()) {
      alert("Veuillez saisir votre adresse e-mail universitaire");
      return;
    }

    // --- NOUVELLE LOGIQUE INVERSEE ---
    // Si c’est l’email de Dorian => on appelle l’API et on passe en mode "signup"
    if (email.trim() === "dorian.descamps@etud.u-picardie.fr") {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/temporary-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ EmailAddress: email.trim() }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du code temporaire');
        }

        // Si tout va bien, on passe en mode "signup"
        setMode("signup");
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite en récupérant le code temporaire.");
      }
    } else {
      // Sinon, on passe en mode "login"
      setMode("login");
    }
  };

  const handlePrev = () => {
    setMode(null);
    setPassword('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'login') {
      // Logique de connexion
      console.log('Soumission du formulaire de connexion :', { email, password });
      // Ex : POST /user/login ...
    } else if (mode === 'signup') {
      // Logique de "nouveau mot de passe"
      console.log('Soumission du formulaire d’inscription :', {
        email,
        code,
        newPassword,
        confirmPassword
      });
      // Ex : POST /user/signup ...
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape commune : affichage de l’adresse e-mail */}
        <div>
          <Text variant="bold">Adresse e-mail universitaire</Text>
          <Input
            variant={mode ? "disabled" : email ? "selected" : "default"}
            placeholder="Saisir votre adresse e-mail universitaire"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!mode}
          />
        </div>

        {/* Étape initiale */}
        {mode === null && (
          <div className="flex justify-center">
            <Button variant="default" onClick={handleNext}>
              <Text variant="defaultBold">Suivant</Text>
            </Button>
          </div>
        )}

        {/* Cas "login" */}
        {mode === "login" && (
          <>
            <div>
              <Text variant="bold">Mot de passe</Text>
              <Input
                variant={password ? "selected" : "default"}
                placeholder="Saisir le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit">
                <Text variant="boldWhite">Connexion</Text>
              </Button>
            </div>
          </>
        )}

        {/* Cas "signup" */}
        {mode === "signup" && (
          <>
            <div>
              <Text variant="bold">Code reçu par e-mail</Text>
              <Input
                variant={code ? "selected" : "default"}
                placeholder="Saisir le code reçu par e-mail"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Nouveau mot de passe</Text>
              <Input
                variant={newPassword ? "selected" : "default"}
                placeholder="Saisir votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Confirmation mot de passe</Text>
              <Input
                variant={confirmPassword ? "selected" : "default"}
                placeholder="Saisir votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                <Text variant="bold">Précédent</Text>
              </Button>
              <Button variant="default" type="submit">
                <Text variant="boldWhite">Inscription</Text>
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
};

export default LoginForm;
