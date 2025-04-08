import AuthorizationMiddleware from '../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../entities/tools/GitHub/GitHubApp.js';
import ParametersMiddleware from '../../../entities/tools/Middleware/ParametersMiddleware.js';
import Request from '../../../entities/tools/Request.js';
import User from '../../../entities/User.js';
import UserRepository from '../../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:UserId',
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            pattern: process.env.TOKEN_PATTERN,
          },
        },
        required: ['authorization'],
      },
      params: {
        type: 'object',
        properties: {
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const requestedUser = await User.fromId(userId);

      const token = await Request.getUsedToken(request);
      const authenticatedUser = token.User;

      if (requestedUser.Id === authenticatedUser.Id) {
        throw { statusCode: 403, error: 'SELF' };
      }

      if (await UserRepository.isUserInserted(requestedUser)) {
        throw { statusCode: 409, error: 'HAS_REPOSITORIES' };
      }

      if (await requestedUser.GitHubId !== null) {
        if (await requestedUser.GitHubOrganizationMember) {
          await GitHubApp.EnvironmentInstance.Organization.removeMember(requestedUser.GitHubId);
        } else {
          const userInvitations = await GitHubApp.EnvironmentInstance.Organization.getInvitations(
            requestedUser.GitHubId,
          );

          await Promise.all(
            userInvitations.map(
              async (invitation) => (
                GitHubApp.EnvironmentInstance.Organization.removeInvitation(invitation.Id)
              ),
            ),
          );
        }
      }

      await requestedUser.delete();
    },
  });
}
