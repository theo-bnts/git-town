import GitHubApp from '../../../entities/tools/GitHubApp.js';
import Middleware from '../../../entities/tools/Middleware.js';
import User from '../../../entities/User.js';
import Request from '../../../entities/tools/Request.js';
import UserRepository from '../../../entities/UserRepository.js';
import UserPromotion from '../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:Id',
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
          Id: {
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
    },
    handler: async (request) => {
      const { Id: id } = request.params;

      const token = await Request.getUsedToken(request);
      const authenticatedUser = token.User;

      const requestedUser = await User.fromId(id);

      // TODO: Remove test
      const githubApp = GitHubApp.fromEnvironment();
      // eslint-disable-next-line no-console
      console.log(await githubApp.getOrganizationInvitations());
      // eslint-disable-next-line no-console
      console.log(await githubApp.getOrganizationInvitations());
      // eslint-disable-next-line no-console
      console.log((await githubApp.getRateLimit()).rate);
      return;

      // eslint-disable-next-line no-unreachable
      if (requestedUser.Id === authenticatedUser.Id) {
        throw { statusCode: 403, error: 'SELF' };
      }

      // TODO: Test
      if (await UserRepository.isCollaboratorOfAnyRepository(requestedUser)) {
        throw { statusCode: 409, error: 'HAS_REPOSITORIES' };
      }

      // TODO: Test
      if (await UserPromotion.isMemberOfAnyPromotion(requestedUser)) {
        throw { statusCode: 409, error: 'HAS_PROMOTIONS' };
      }

      if (await requestedUser.GitHubId !== null) {
        const gitHubApp = GitHubApp.fromEnvironment();

        const gitHubUser = await gitHubApp.getUser(requestedUser);
        const gitHubUsername = gitHubUser.Username;

        if (await requestedUser.GitHubOrganizationMember()) {
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
