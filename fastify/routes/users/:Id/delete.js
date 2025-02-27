import GitHubApp from '../../../entities/tools/GitHubApp.js';
import Middleware from '../../../entities/tools/Middleware.js';
import User from '../../../entities/User.js';
import Request from '../../../entities/tools/Request.js';
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
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
      await Middleware.assertUserIdExists(request);
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
        const gitHubApp = GitHubApp.fromEnvironment();

        const gitHubUser = await gitHubApp.getUser(requestedUser);
        const gitHubUsername = gitHubUser.Username;

        if (await requestedUser.GitHubOrganizationMember) {
          await gitHubApp.removeFromOrganization(gitHubUsername);
        } else {
          const organizationInvitations = await gitHubApp.getOrganizationInvitations();

          const userOrganizationInvitations = organizationInvitations.filter(
            (invitation) => invitation.User.Username === gitHubUsername,
          );

          await Promise.all(
            userOrganizationInvitations.map(
              (invitation) => gitHubApp.cancelOrganizationInvitation(invitation.Id),
            ),
          );
        }
      }

      await requestedUser.delete();
    },
  });
}
