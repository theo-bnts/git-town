/* eslint-disable import/no-unresolved */
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from 'octokit';
/* eslint-enable */

import ProxyAgent from './ProxyAgent.js';

export default class GitHubOrganization {
  Octokit;

  constructor(octokit) {
    this.Octokit = octokit;
  }

  static fromEnvironment() {
    return new this(
      new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: Number(process.env.GITHUB_APP_ID),
          privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
          clientId: process.env.GITHUB_APP_CLIENT_ID,
          clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
          installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
        },
        request: {
          agent: ProxyAgent.https(),
        },
      }),
    );
  }

  async invite(user) {
    await this.Octokit.rest.orgs.createInvitation({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      invitee_id: Number(user.GitHubId),
    });
  }

  // WARNING: For development purposes only
  async getRateLimit() {
    const { data } = await this.Octokit.rest.rateLimit.get();

    return data;
  }
}
