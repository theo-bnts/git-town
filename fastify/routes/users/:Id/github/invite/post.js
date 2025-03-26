import AuthorizationMiddleware from '../../../../../entities/tools/AuthorizationMiddleware.js';
import GitHubApp from '../../../../../entities/tools/GitHubApp.js';
import User from '../../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:UserId/github/invite',
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
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_AUTHENTICATED_STUDENT_GITHUB_PRIVILEGED_MAX),
        allowList: false,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertUserIdMatch(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      if (user.GitHubId === null) {
        throw { statusCode: 409, error: 'GITHUB_ID_NOT_DEFINED' };
      }

      if (user.GitHubOrganizationMember) {
        throw { statusCode: 409, error: 'ALREADY_MEMBER' };
      }

      await GitHubApp.Instance.createInvitation(user.GitHubId);
    },
  });
}
