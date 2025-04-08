import Request from '../Request.js';
import Role from '../../Role.js';
import Security from '../Security.js';

export default class AuthorizationMiddleware {
  static async assertAuthentication(request) {
    if (!await Request.isAuthenticated(request)) {
      throw { statusCode: 401, error: 'INVALID_TOKEN' };
    }
  }

  static async assertGitHubWebhookAuthentication(request) {
    const { 'x-hub-signature-256': signature } = request.headers;
    const { rawBody } = request;

    if (signature !== `sha256=${Security.hashGitHubWebhookSecret(rawBody)}`) {
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

  static async assertSufficientUserRoleOrUserIdMatch(request, requiredRoleKeyword) {
    const { UserId: requestedUserId } = request.params;

    const token = await Request.getUsedToken(request);
    const { Id: authenticatedUserId, Role: authenticatedUserRole } = token.User;

    const requiredRole = await Role.fromKeyword(requiredRoleKeyword);

    if (
      authenticatedUserRole.HierarchyLevel < requiredRole.HierarchyLevel
      && requestedUserId !== authenticatedUserId
    ) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS_OR_USER_ID_MISMATCH' };
    }
  }
}
