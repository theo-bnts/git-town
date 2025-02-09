import { Octokit } from 'octokit';
import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';

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

      //TODO: Utiliser la décomposition à 2 niveaux dans les autres routes

      const oAuthAppAuth = createOAuthAppAuth({
        clientId: process.env.GITHUB_OAUTH_CLIENT_ID,
        clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      });

      let oAuthUserAuth;
      try {
        oAuthUserAuth = await oAuthAppAuth({
          code: oAuthCode,
        });
      } catch (error) {
        throw {
          statusCode: 401,
          code: 'INVALID_OAUTH_CODE',
        };
      }

      const octokit = new Octokit({
        authStrategy: createOAuthUserAuth,
        auth: oAuthUserAuth,
      });

      const { data: { id: githubId } } = await octokit.rest.users.getAuthenticated();

      const user = await Request.getAuthenticatedUser(request);

      user.GitHubId = githubId;
      await user.update();

      return user;
    },
  });
}
