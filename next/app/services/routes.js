// app/services/routes.js

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const publicRoute = (email) =>
  `${API_BASE_URL}/users/${encodeURIComponent(email)}/public`;

export const userRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}`;

export const usersRoute = () =>
  `${API_BASE_URL}/users`;

export const tokenRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/tokens`;

export const temporaryCodeRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/temporary-codes`;

export const passwordRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/password`;

export const githubOAuthRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/github/oauth-code`;

export const githubInviteRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/github/invite`;

export const userPromotionsRoute = (userId) =>
  `${API_BASE_URL}/users/${userId}/promotions`;

export const promotionsRoute = () =>
  `${API_BASE_URL}/promotions`;

export const editPromotionRoute = (promotionId) =>
  `${API_BASE_URL}/promotions/${promotionId}`;

export const delTokenRoute = (userId, tokenId) =>
  `${API_BASE_URL}/users/${userId}/tokens/${tokenId}`;

export const deleteUserPromotionRoute = (userId, userPromotionId) =>
  `${API_BASE_URL}/users/${userId}/promotions/${userPromotionId}`;
