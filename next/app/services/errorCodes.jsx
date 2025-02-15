// /app/services/errorCodes.jsx
export const API_ERRORS = {
  INTERNAL_SERVER_ERROR: (msg) => {
    return `(500) : ${msg || "Erreur interne du serveur."}`;
  },
  BAD_REQUEST: (msg) => {
    return `(400) : ${msg || "Requête incorrecte."}`;
  },
  UNAUTHORIZED: {
    INVALID_TOKEN: "(401) : Token invalide.",
    INVALID_OAUTH_APP_CODE: "(401) : Code OAuth invalide.",
    INVALID_TEMPORARY_CODE: "(401) : Code temporaire invalide.",
    INVALID_PASSWORD: "(401) : Mot de passe invalide.",
  },
  FORBIDDEN: {
    INSUFFICIENT_PERMISSIONS: "(403) : Permissions insuffisantes.",
  },
  NOT_FOUND: {
    UNKNOWN_USER_ID: "(404) : Utilisateur inconnu.",
    USER_ID_MISMATCH: "(404) : L’identifiant utilisateur ne correspond pas.",
    UNKNOWN_ROLE_KEYWORD: "(404) : Rôle inconnu.",
    UNKNOWN_EMAIL_ADDRESS: "(404) : Adresse e-mail inconnue.",
  },
  CONFLICT: {
    SAME_EMAIL_ADDRESS: "(409) : Adresse e-mail déjà utilisée.",
    DUPLICATE_EMAIL_ADDRESS: "(409) : Adresse e-mail en double.",
    SAME_FULL_NAME: "(409) : Nom complet déjà utilisé.",
    SAME_ROLE_KEYWORD: "(409) : Rôle déjà attribué.",
    OWN_ROLE: "(409) : Vous ne pouvez pas vous attribuer ce rôle.",
    STUDENT_ROLE: "(409) : Le rôle étudiant n’est pas autorisé.",
    GITHUB_ID_ALREADY_DEFINED: "(409) : GitHub ID déjà défini.",
  },
  TOO_MANY_REQUESTS: {
    RATE_LIMIT_EXCEEDED: "(429) : Trop de requêtes. Veuillez réessayer plus tard.",
  },
};
