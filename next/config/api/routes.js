export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Récupération de l’ID utilisateur via l’email
export const publicUserRoute = (email) => `${API_BASE_URL}/users/${email}/public`;

// Récupération/Suppression du token
export const tokenRoute = (userId) => `${API_BASE_URL}/users/${userId}/token`;

// Liste de tous les utilisateurs
export const USERS_ROUTE = `${API_BASE_URL}/users`;