// app/login/page.jsx
"use client";

import { useState } from "react";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [exists, setExists] = useState(false); // Simule l'existence de l'email
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [error, setError] = useState("");

  // Simulation : si l'email est "existant@exemple.com", il est considéré comme existant.
  const checkEmail = () => {
    if (!email) {
      setError("Veuillez saisir un email.");
      return;
    }
    setError("");
    setExists(email === "existant@exemple.com");
    setStep(2);
  };

  // Gestion de la soumission (connexion ou inscription fictive)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    // Ici, on simule une connexion ou inscription puis redirige vers "/home"
    window.location.href = "/home";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-4">Connexion</h1>
        {error && <div className="mb-4 text-red-500">{error}</div>}

        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkEmail();
            }}
          >
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="border rounded w-full px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
            >
              Suivant
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {!exists && (
              <>
                <div className="mb-4">
                  <label htmlFor="firstname" className="block text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstname"
                    className="border rounded w-full px-3 py-2"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="lastname" className="block text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastname"
                    className="border rounded w-full px-3 py-2"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                className="border rounded w-full px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600"
            >
              {exists ? "Se connecter" : "S'inscrire"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
