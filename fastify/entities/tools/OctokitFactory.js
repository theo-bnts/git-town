import { Octokit } from 'octokit';
import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app';
import { createAppAuth } from '@octokit/auth-app';

class OctokitAuth {
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

  static async app() {
    const appAuth = createAppAuth({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      clientId: process.env.GITHUB_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    });

    return new Octokit({
      authStrategy: createAppAuth,
      auth: appAuth,
    });
  }
}

export default OctokitAuth;
