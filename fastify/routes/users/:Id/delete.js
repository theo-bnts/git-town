import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import GitHubApp from '../../../entities/tools/GitHubApp.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';
import Request from '../../../entities/tools/Request.js';
import User from '../../../entities/User.js';
import UserRepository from '../../../entities/UserRepository.js';
import UserPromotion from '../../../entities/UserPromotion.js';

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
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdExists(request);
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

      if (await UserPromotion.isUserInserted(requestedUser)) {
        throw { statusCode: 409, error: 'HAS_PROMOTIONS' };
      }

      if (await requestedUser.GitHubId !== null) {
        const gitHubUser = await GitHubApp.Instance.getUser(requestedUser);
        const gitHubUsername = gitHubUser.Username;

        if (await requestedUser.GitHubOrganizationMember) {
          await GitHubApp.Instance.removeOrganizationMember(gitHubUsername);
        } else {
          const organizationInvitations = await GitHubApp.Instance.getOrganizationInvitations();

          const userOrganizationInvitations = organizationInvitations.filter(
            (invitation) => invitation.User.Username === gitHubUsername,
          );

          await Promise.all(
            userOrganizationInvitations.map(
              (invitation) => GitHubApp.Instance.cancelOrganizationInvitation(invitation.Id),
            ),
          );
        }
      }

      await requestedUser.delete();
    },
  });
}
