import Request from '../Request.js';
import Role from '../../Role.js';
import Security from '../Security.js';
import UserRepository from '../../UserRepository.js';

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

  static async isSufficientUserRole(request, requiredRoleKeyword) {
    const token = await Request.getUsedToken(request);

    const requiredRole = await Role.fromKeyword(requiredRoleKeyword);

    return token.User.Role.HierarchyLevel >= requiredRole.HierarchyLevel;
  }

  static async assertSufficientUserRole(request, requiredRoleKeyword) {
    if (!await this.isSufficientUserRole(request, requiredRoleKeyword)) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS' };
    }
  }

  static async assertSufficientUserRoleOrUserIdMatch(request, requiredRoleKeyword) {
    const { UserId: requestedUserId } = request.params;

    const token = await Request.getUsedToken(request);

    if (
      !(await this.isSufficientUserRole(request, requiredRoleKeyword))
      && requestedUserId !== token.User.Id
    ) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS_OR_USER_ID_MISMATCH' };
    }
  }

  static async assertSufficientUserRoleOrUserInRepository(request, requiredRoleKeyword) {
    const { RepositoryId: requestedRepositoryId } = request.params;

    const token = await Request.getUsedToken(request);

    const userRepositories = await UserRepository.fromUser(token.User);

    if (
      !(await this.isSufficientUserRole(request, requiredRoleKeyword))
      && !userRepositories.some(
        (userRepository) => userRepository.Repository.Id === requestedRepositoryId,
      )
    ) {
      throw { statusCode: 403, error: 'INSUFFICIENT_PERMISSIONS_OR_USER_NOT_IN_REPOSITORY' };
    }
  }
}
