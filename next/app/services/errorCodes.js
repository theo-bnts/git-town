// /app/services/errorCodes.jsx
export const API_ERRORS = {
  400: {
    FST_ERR_CTP_EMPTY_JSON_BODY: "(400) : Corps de la requête vide.",
    default: "(400) : Requête incorrecte.",
  },
  401: {
    INVALID_TOKEN: "(401) : Token invalide.",
    INVALID_OAUTH_CODE: "(401) : Code OAuth invalide.",
    INVALID_TEMPORARY_CODE: "(401) : Code temporaire invalide.",
    INVALID_PASSWORD: "(401) : Mot de passe invalide.",
    default: "(401) : Non autorisé.",
  },
  403: {
    INSUFFICIENT_PERMISSIONS: "(403) : Permissions insuffisantes.",
    USER_ID_MISMATCH: "(403) : L’identifiant utilisateur ne correspond pas.",
    default: "(403) : Accès refusé.",
  },
  404: {
    UNKNOWN_USER_ID: "(404) : Utilisateur inconnu.",
    UNKNOWN_ROLE_KEYWORD: "(404) : Rôle inconnu.",
    UNKNOWN_EMAIL_ADDRESS: "(404) : Adresse e-mail inconnue.",
    default: "(404) : Ressource non trouvée.",
  },
  409: {
    SAME_EMAIL_ADDRESS: "(409) : Adresse e-mail déjà utilisée.",
    DUPLICATE_EMAIL_ADDRESS: "(409) : Adresse e-mail en double.",
    SAME_FULL_NAME: "(409) : Nom complet déjà utilisé.",
    SAME_ROLE_KEYWORD: "(409) : Rôle déjà attribué.",
    OWN_ROLE: "(409) : Vous ne pouvez pas vous attribuer ce rôle.",
    STUDENT_ROLE: "(409) : Le rôle étudiant n’est pas autorisé.",
    GITHUB_ID_ALREADY_DEFINED: "(409) : GitHub ID déjà défini.",
    USER_ALREADY_ORGANIZATION_MEMBER: "(409) : Membre de l’organisation GitHub.",
    DUPLICATE_GITHUB_ID: "(409) : GitHub ID déjà utilisé.",
    default: "(409) : Conflit de requête.",
  },
  429: {
    RATE_LIMIT_EXCEEDED: "(429) : Trop de requêtes. Veuillez réessayer plus tard.",
    default: "(429) : Trop de requêtes.",
  },
  500: {
    default: "(500) : Erreur interne du serveur.",
  },
};
