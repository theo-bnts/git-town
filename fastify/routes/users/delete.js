import GitHubApp from '../../entities/tools/GitHubApp.js';
import Middleware from '../../entities/tools/Middleware.js';
import User from '../../entities/User.js';
import Request from '../../entities/tools/Request.js';
import UserRepository from '../../entities/UserRepository.js';
import UserPromotion from '../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users',
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
      body: {
        type: 'object',
        properties: {
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        required: ['Id'],
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const { Id: id } = request.body;

      if (!await User.isIdInserted(id)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
      }

      const requestedUser = await User.fromId(id);

      const token = await Request.getUsedToken(request);
      const authenticatedUser = token.User;

      if (requestedUser.Id === authenticatedUser.Id) {
        throw { statusCode: 403, error: 'SELF' };
      }

      // TODO: Test
      if (await UserRepository.isCollaboratorOfAnyRepository(requestedUser)) {
        throw { statusCode: 409, error: 'HAS_REPOSITORIES' };
      }

      // TODO: Test
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
