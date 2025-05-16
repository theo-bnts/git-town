// app/services/routes.js

export const publicRoute = (email) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${encodeURIComponent(email)}/public`;

export const userRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`;

export const usersRoute = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/users`;

export const tokenRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/tokens`;

export const temporaryCodeRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/temporary-codes`;

export const passwordRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/password`;

export const githubOAuthRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/github/oauth-code`;

export const githubInviteRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/github/invite`;

export const userPromotionsRoute = (userId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/promotions`;

export const promotionsRoute = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/promotions`;

export const promotionRoute = (promotionId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/promotions/${promotionId}`;

export const editPromotionRoute = (promotionId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/promotions/${promotionId}`;

export const delTokenRoute = (userId, tokenId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/tokens/${tokenId}`;

export const deleteUserPromotionRoute = (userId, userPromotionId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/promotions/${userPromotionId}`;

export const enseignementUnitsRoute = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/enseignement-units`;

export const enseignementUnitRoute = (unitId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/enseignement-units/${unitId}`;

export const templatesRoute = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/templates`;

export const templateRoute = (templateId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/templates/${templateId}`;

export const templateMilestonesRoute = (tplId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/templates/${tplId}/milestones`;

export const templateMilestoneRoute  = (tplId, msId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/templates/${tplId}/milestones/${msId}`;

export const repositoriesRoute = () =>
  `${process.env.NEXT_PUBLIC_API_URL}/repositories`;

export const repositoryRoute = (repoId) =>
  `${process.env.NEXT_PUBLIC_API_URL}/repositories/${repoId}`;

