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
    const { body } = request;

    if (signature === undefined || signature === null || signature !== `sha256=${Security.hashGitHubWebhookSecret(body)}`) {
      throw { statusCode: 401, error: 'INVALID_SIGNATURE' };
    }
  }

  static async assertSufficientUserRole(request, requiredRoleKeyword) {
    const token = await Request.getUsedToken(request);
    const { Role: userRole } = token.User;

    const requiredRole = await Role.fromKeyword(requiredRoleKeyword);

    if (userRole.HierarchyLevel < requiredRole.HierarchyLevel) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS' };
    }
  }

  static async assertUserIdExists(request) {
    const { Id: requestedUserId } = request.params;

    if (!(await User.isIdInserted(requestedUserId))) {
      throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
    }
  }

  static async assertUserIdMatch(request) {
    const { Id: requestedUserId } = request.params;

    const token = await Request.getUsedToken(request);
    const { Id: userId } = token.User;

    if (requestedUserId !== userId) {
      throw { statusCode: 403, error: 'USER_ID_MISMATCH' };
    }
  }
}
