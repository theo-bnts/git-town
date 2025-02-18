export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const publicUserRoute = (email) =>
  `${API_BASE_URL}/users/${encodeURIComponent(email)}/public`;

export const tokenRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/token`;

export const temporaryCodeRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/temporary-code`;

export const passwordRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/password`;

export const githubRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/github`;
