/* eslint-disable import/no-unresolved */
import { createAppAuth } from '@octokit/auth-app';
import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';
import { Octokit } from 'octokit';
/* eslint-enable */

export default class OctokitAuth {
  static async user(oAuthCode) {
    const oAuthAppAuth = createOAuthAppAuth({
      clientId: process.env.GITHUB_OAUTH_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_APP_CLIENT_SECRET,
    });

    const oAuthUserAuth = await oAuthAppAuth({
      code: oAuthCode,
    });

    return new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: oAuthUserAuth,
    });
  }

  static app() {
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
      },
    });
  }
}
