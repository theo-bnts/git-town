import { Octokit } from 'octokit';

import GitHubOAuth from '../../../entities/tools/GitHubOAuth.js';
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
            pattern: process.env.GITHUB_OAUTH_CODE_PATTERN,
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

      const user = await Request.getAuthenticatedUser(request);

      let accessToken;
      try {
        accessToken = await GitHubOAuth.getAccessToken(oAuthCode);
      } catch (error) {
        throw {
          statusCode: 401,
          code: 'INVALID_OAUTH_CODE',
        };
      }

      const octokit = new Octokit({
        auth: accessToken,
      });

      console.log('oAuthCode', oAuthCode);
      console.log('accessToken', accessToken);
      
      //TODO: Utiliser la décomposition à 2 niveaux dans les autres routes
      const { data: { login: githubId } } = await octokit.users.getAuthenticated();

      user.GithubId = githubId;
    },
  });
}
