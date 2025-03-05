// app/services/routes.js

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const publicRoute = (email) =>
  `${API_BASE_URL}/users/${encodeURIComponent(email)}/public`;

export const userRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}`;

export const usersRoute = () =>
  `${API_BASE_URL}/users`;

export const tokenRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/token`;

export const temporaryCodeRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/temporary-code`;

export const passwordRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/password`;

export const githubOAuthRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/github/oauth-code`;

export const githubInviteRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/github/invite`;

export const delTokenRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/token`;
