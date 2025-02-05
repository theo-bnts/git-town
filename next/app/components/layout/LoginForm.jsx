// app/components/layout/LoginForm.jsx
import React, { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Text from "../ui/Text";

const LoginForm = () => {
  // mode === null : étape initiale (saisie e-mail)
  // mode === "login" : e-mail existant => connexion
  // mode === "signup" : e-mail inexistant => inscription
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleNext = () => {
    if (!email.trim()) {
      alert("Veuillez saisir votre adresse e-mail universitaire");
      return;
    }
    // Simulation de vérification de l'existence de l'e-mail
    if (email.trim() === "test@test.fr") {
      setMode("login");
    } else {
      setMode("signup");
    }
  };

  const handlePrev = () => {
    // Retour à l'étape initiale
    setMode(null);
    setPassword("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "login") {
      // Ici la logique de connexion (backend)
      alert(`Connexion:\nEmail: ${email}\nMot de passe: ${password}`);
    } else if (mode === "signup") {
      if (newPassword !== confirmPassword) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }
      // Ici la logique d'inscription (backend)
      alert(
        `Inscription:\nEmail: ${email}\nCode: ${code}\nNouveau Mot de passe: ${newPassword}`
      );
    }
  };

  return (
    <Card variant="default">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Étape commune : affichage de l’adresse e-mail */}
        <div>
          <Text variant="bold">Adresse e-mail universitaire</Text>
          <Input
            variant={mode ? "disabled" : "default"}
            placeholder="Saisir votre adresse e-mail universitaire"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={mode ? true : false}
          />
        </div>

        {/* Étape initiale */}
        {mode === null && (
          <div className="flex justify-center">
            <Button variant="default" onClick={handleNext}>
              <Text variant="boldWhite">Suivant</Text>
            </Button>
          </div>
        )}

        {/* Cas connexion */}
        {mode === "login" && (
          <>
            <div>
              <Text variant="bold">Mot de passe</Text>
              <Input
                variant="default"
                placeholder="Saisir le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                <Text variant="boldWhite">Précédent</Text>
              </Button>
              <Button variant="default" type="submit">
                <Text variant="boldWhite">Connexion</Text>
              </Button>
            </div>
          </>
        )}

        {/* Cas inscription */}
        {mode === "signup" && (
          <>
            <div>
              <Text variant="bold">Code reçu par e-mail</Text>
              <Input
                variant="default"
                placeholder="Saisir le code reçu par e-mail"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Nouveau mot de passe</Text>
              <Input
                variant="default"
                placeholder="Saisir votre nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Text variant="bold">Confirmation mot de passe</Text>
              <Input
                variant="default"
                placeholder="Saisir votre nouveau mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrev}>
                <Text variant="boldWhite">Précédent</Text>
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
