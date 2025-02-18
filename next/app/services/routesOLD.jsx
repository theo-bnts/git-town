// /app/services/routes.jsx
import { API_ERRORS } from "./errorCodes";

/**
 * Récupère la définition de l’adresse e-mail (GET /users/:email/public).
 * @param {string} emailAddress - L’adresse e-mail à vérifier.
 * @returns {Promise<Object>} - Les données publiques de l’utilisateur.
 * @throws {Error} - Erreur
 */
export async function fetchEmailDefinition(emailAddress) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${encodeURIComponent(emailAddress)}/public`
  );
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_EMAIL_ADDRESS);
  }
  if (res.status === 429) {
    throw new Error(API_ERRORS.TOO_MANY_REQUESTS.RATE_LIMIT_EXCEEDED);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la récupération de l'adresse e-mail.");
}

/**
 * Demande la génération d'un code temporaire pour l’inscription (POST /users/:userId/temporary-code).
 * @param {string} userId - Identifiant de l’utilisateur.
 * @returns {Promise<Object>} - Réponse du serveur (par ex. message de succès).
 * @throws {Error} - Erreur
 */
export async function fetchTemporaryCode(userId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/temporary-code`,
    { method: 'POST' }
  );
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la génération du code temporaire.");
}

/**
 * Connexion de l’utilisateur pour récupérer un token (POST /users/:userId/token).
 * @param {string} userId - Identifiant de l’utilisateur.
 * @param {string} password - Mot de passe de l’utilisateur.
 * @returns {Promise<Object>} - Objet contenant le token.
 * @throws {Error} - Erreur
 */
export async function login(userId, password) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Password: password.trim() }),
    }
  );
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_PASSWORD);
  }
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la connexion.");
}

/**
 * Inscription (définition d’un mot de passe via code temporaire) (POST /users/:userId/password).
 * @param {string} userId - Identifiant de l’utilisateur.
 * @param {string} temporaryCode - Code temporaire envoyé par e-mail.
 * @param {string} newPassword - Nouveau mot de passe à définir.
 * @returns {Promise<Object>} - Réponse du serveur (par ex. confirmation d’inscription).
 * @throws {Error} - Erreur
 */
export async function signup(userId, temporaryCode, newPassword) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TemporaryCode: temporaryCode.trim(),
        Password: newPassword.trim(),
      }),
    }
  );
  const data = await res.json();

  if (res.ok) return data;

  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_TEMPORARY_CODE);
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de l'inscription.");
}

/**
 * Association d'un compte utilisateur avec un compte GitHub (POST /users/:userId/github).
 * @param {string} userId - Identifiant de l’utilisateur.
 * @param {string} code - Code d’autorisation GitHub.
 * @param {string} token - Token d’authentification (Bearer).
 * @returns {Promise<Object>} - Réponse du serveur (par ex. confirmation de liaison).
 * @throws {Error} - Erreur
 */
export async function linkGithubAccount(userId, code, token) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userId}/github`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ OAuthCode: code.trim() }),
    }
  );
  const data = await res.json();

  if (res.ok) return data;
  
  if (res.status === 400) {
    throw new Error(API_ERRORS.BAD_REQUEST(data.message));
  }
  if (res.status === 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_TOKEN);
  }
  if (res.status == 401) {
    throw new Error(API_ERRORS.UNAUTHORIZED.INVALID_OAUTH_APP_CODE);
  }
  if (res.status === 403) {
    throw new Error(API_ERRORS.FORBIDDEN.INSUFNOT_FOUND.USER_ID_MISMATCH);
  }
  if (res.status === 404) {
    throw new Error(API_ERRORS.NOT_FOUND.UNKNOWN_USER_ID);
  }
  if (res.status === 409) {
    throw new Error(API_ERRORS.CONFLICT.GITHUB_ID_ALREADY_DEFINED);
  }
  if (res.status === 500) {
    throw new Error(API_ERRORS.INTERNAL_SERVER_ERROR(data.message));
  }
  throw new Error("Oups, une erreur s'est produite lors de la liaison GitHub.");
}
