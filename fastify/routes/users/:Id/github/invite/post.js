import GitHubApp from '../../../../../entities/tools/GitHubApp.js';
import Middleware from '../../../../../entities/tools/Middleware.js';
import User from '../../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:Id/github/invite',
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
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_GITHUB_ORGANIZATION_INVITATION_MAX),
        allowList: false,
        timeWindow: process.env.RATE_LIMIT_GITHUB_ORGANIZATION_INVITATION_TIME_WINDOW,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertUserIdMatch(request);
    },
    handler: async (request) => {
      const { Id: id } = request.params;

      const user = await User.fromId(id);

      if (user.GitHubId === null) {
        throw { statusCode: 409, error: 'GITHUB_ID_NOT_DEFINED' };
      }

      if (user.GitHubOrganizationMember) {
        throw { statusCode: 409, error: 'ALREADY_MEMBER' };
      }

      await GitHubApp.fromEnvironment().inviteToOrganization(user);
    },
  });
}
