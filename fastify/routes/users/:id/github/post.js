import Middleware from '../../../../entities/tools/Middleware.js';
import OctokitFactory from '../../../../entities/tools/OctokitFactory.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:Id/github',
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
      body: {
        type: 'object',
        properties: {
          OAuthCode: {
            type: 'string',
            pattern: process.env.GITHUB_OAUTH_APP_CODE_PATTERN,
          },
        },
        additionalProperties: false,
        required: ['OAuthCode'],
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertUserIdMatch(request);
    },
    handler: async (request) => {
      const { Id: id } = request.params;
      const { OAuthCode: oAuthCode } = request.body;

      const user = await User.fromId(id);

      if (user.GitHubId !== null) {
        throw { statusCode: 409, error: 'GITHUB_ID_ALREADY_DEFINED' };
      }

      let userOctokit;
      try {
        userOctokit = await OctokitFactory.user(oAuthCode);
      } catch (error) {
        throw { statusCode: 401, error: 'INVALID_OAUTH_APP_CODE' };
      }

      const { data: { Id: gitHubId } } = await userOctokit.rest.users.getAuthenticated();

      user.GitHubId = BigInt(gitHubId);
      await user.update();

      return user;
    },
  });
}
