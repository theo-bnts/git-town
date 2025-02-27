import Promotion from '../Promotion.js';
import Request from './Request.js';
import Role from '../Role.js';
import User from '../User.js';
import Security from './Security.js';

export default class Middleware {
  static async assertAuthentication(request) {
    if (!await Request.isAuthenticated(request)) {
      throw { statusCode: 401, error: 'INVALID_TOKEN' };
    }
  }

  static async assertGitHubWebhookAuthentication(request) {
    const { 'x-hub-signature-256': signature } = request.headers;
    const { rawBody } = request;

    if (signature === undefined || signature === null || signature !== `sha256=${Security.hashGitHubWebhookSecret(rawBody)}`) {
      throw { statusCode: 401, error: 'INVALID_SIGNATURE' };
    }
  }

  static async assertSufficientUserRole(request, requiredRoleKeyword) {
    const token = await Request.getUsedToken(request);
    const { Role: authenticatedUserRole } = token.User;

    const requiredRole = await Role.fromKeyword(requiredRoleKeyword);

    if (authenticatedUserRole.HierarchyLevel < requiredRole.HierarchyLevel) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS' };
    }
  }

  static async assertUserIdExists(request) {
    const { UserId: userId } = request.params;

    if (!(await User.isIdInserted(userId))) {
      throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
    }
  }

  static async assertPromotionIdExists(request) {
    const { PromotionId: promotionId } = request.params;

    if (!(await Promotion.isIdInserted(promotionId))) {
      throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
    }
  }

  static async assertUserIdMatch(request) {
    const { UserId: requestedUserId } = request.params;

    const token = await Request.getUsedToken(request);
    const { Id: authenticatedUserId } = token.User;

    if (requestedUserId !== authenticatedUserId) {
      throw { statusCode: 403, error: 'USER_ID_MISMATCH' };
    }
  }
}
