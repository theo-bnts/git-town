/**
 * Récupère la définition de l’email.
 * GET /users/{{EMAIL_ADDRESS}}/public
 */
export async function fetchEmailDefinition(emailAddress) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${encodeURIComponent(emailAddress)}/public`
  );
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) {
    if (data.code === 'FST_ERR_VALIDATION') {
      throw new Error(
        'Adresse e-mail non conforme. Veuillez saisir une adresse "u-picardie.fr" ou "etud.u-picardie.fr".'
      );
    }
    throw new Error(`Erreur 400 : ${data.message || 'Bad Request'}`);
  }
  if (res.status === 404) throw new Error("Adresse e-mail inconnue. Merci de vérifier ou de vous inscrire.");
  if (res.status === 429) throw new Error("Trop de requêtes. Veuillez réessayer plus tard.");

  throw new Error("Erreur lors de la vérification de votre adresse e-mail.");
}

/**
 * Demande la génération d'un code temporaire pour l’inscription.
 * POST /users/{{USER_ID}}/temporary-code
 */
export async function fetchTemporaryCode(userId) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/temporary-code`, {
    method: 'POST'
  });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) throw new Error(`Erreur 400 : ${data.message || 'Bad Request'}`);
  if (res.status === 404) throw new Error("Utilisateur inconnu.");

  throw new Error("Erreur lors de la récupération du code temporaire");
}

/**
 * Connexion de l'utilisateur pour récupérer un token.
 * POST /users/{{USER_ID}}/token
 */
export async function login(userId, password) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Password: password.trim() }),
  });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) throw new Error("Mot de passe invalide.");
  if (res.status === 400) throw new Error("Erreur de validation (400).");

  throw new Error("Une erreur est survenue lors de la connexion.");
}

/**
 * Inscription (définition d’un mot de passe via code temporaire).
 * POST /users/{{USER_ID}}/password
 */
export async function signup(userId, temporaryCode, newPassword) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      TemporaryCode: temporaryCode.trim(),
      Password: newPassword.trim(),
    }),
  });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) throw new Error("Code temporaire invalide.");
  if (res.status === 404) throw new Error("Utilisateur inconnu.");
  if (res.status === 400) throw new Error(data.message || "Erreur de validation.");

  throw new Error("Une erreur est survenue lors de l'inscription.");
}

/**
 * Association d'un compte utilisateur avec un compte GitHub.
 * POST /users/{{USER_ID}}/github
 */
export async function linkGithubAccount(userId, code) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/github`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ Code: code.trim() }),
  });
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) throw new Error("Token invalide");
  if (res.status === 403) throw new Error("User ID invalide");
  if (res.status === 404) throw new Error("Utilisateur inconnu.");
  if (res.status === 400) throw new Error(data.message || "Erreur de validation.");

  throw new Error("Une erreur est survenue lors de la liaison du compte GitHub.");
}
