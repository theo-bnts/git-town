/* eslint-disable import/no-unresolved */
import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';
import { Octokit } from 'octokit';
/* eslint-enable */

import ProxyAgent from './ProxyAgent.js';

export default class GitHubUser {
  Octokit;

  constructor(octokit) {
    this.Octokit = octokit;
  }

  static async fromOAuthCode(oAuthCode) {
    const oAuthAppAuth = createOAuthAppAuth({
      clientId: process.env.GITHUB_OAUTH_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_APP_CLIENT_SECRET,
    });

    const oAuthUserAuth = await oAuthAppAuth({
      code: oAuthCode,
    });

    return new this(
      new Octokit({
        authStrategy: createOAuthUserAuth,
        auth: oAuthUserAuth,
        request: {
          agent: ProxyAgent.https(),
        },
      }),
    );
  }

  async getUserId() {
    const { data: { id } } = await this.Octokit.rest.users.getAuthenticated();

    return BigInt(id);
  }
}
