import OctokitFactory from '../../../entities/tools/OctokitFactory.js';
import Request from '../../../entities/tools/Request.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/user/github',
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
          OAuthCode: {
            type: 'string',
            pattern: process.env.GITHUB_OAUTH_APP_CODE_PATTERN,
          },
        },
        required: ['OAuthCode'],
      },
    },
    preHandler: async (request) => {
      await Request.handleAuthenticationWithRole(request, 'student');
    },
    handler: async function handler(request) {
      const { OAuthCode: oAuthCode } = request.body;

      let userOctokit;
      try {
        userOctokit = await OctokitFactory.user(oAuthCode);
      } catch (error) {
        throw { statusCode: 401, code: 'INVALID_OAUTH_APP_CODE' };
      }

      const { data: { id: githubId } } = await userOctokit.rest.users.getAuthenticated();

      const user = await Request.getAuthenticatedUser(request);

      user.GitHubId = githubId;
      await user.update();

      return user;
    },
  });
}
