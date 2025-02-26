import GitHubUser from '../../../../../entities/tools/GitHubUser.js';
import Middleware from '../../../../../entities/tools/Middleware.js';
import User from '../../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:UserId/github/oauth-code',
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
      const { UserId: userId } = request.params;
      const { OAuthCode: oAuthCode } = request.body;

      const user = await User.fromId(userId);

      if (user.GitHubId !== null) {
        throw { statusCode: 409, error: 'GITHUB_ID_ALREADY_DEFINED' };
      }

      let gitHubUser;
      try {
        gitHubUser = await GitHubUser.fromOAuthCode(oAuthCode);
      } catch (error) {
        throw { statusCode: 401, error: 'INVALID_OAUTH_CODE' };
      }

      user.GitHubId = await gitHubUser.getUserId();

      if (await User.isGitHubIdInserted(user.GitHubId)) {
        throw { statusCode: 409, error: 'DUPLICATE_GITHUB_ID' };
      }

      await user.update();
    },
  });
}
