/* eslint-disable import/no-unresolved */
import { cache } from '@security-alliance/octokit-plugin-cache';
import { createAppAuth } from '@octokit/auth-app';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { createOAuthUserAuth } from '@octokit/auth-oauth-user';
import { Octokit } from 'octokit';
/* eslint-enable import/no-unresolved */

import GitHubEducationalTeam from './GitHubEducationalTeam.js';
import GitHubMilestones from './GitHubMilestones.js';
import GitHubOrganization from './GitHubOrganization.js';
import GitHubRepositories from './GitHubRepositories.js';
import GitHubUsers from './GitHubUsers.js';

export default class GitHubApp {
  Octokit;

  Users;

  Organization;

  EducationalTeam;

  Repositories;

  Milestones;

  static EnvironmentInstance = null;

  constructor(octokit) {
    this.Octokit = octokit;
    this.EducationalTeam = new GitHubEducationalTeam(this);
    this.Milestones = new GitHubMilestones(this);
    this.Organization = new GitHubOrganization(this);
    this.Repositories = new GitHubRepositories(this);
    this.Users = new GitHubUsers(this);
  }

  async getInstallationAccessToken() {
    const { token } = await this.Octokit.auth({
      type: 'installation',
      installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
    });

    return token;
  }

  static fromEnvironment() {
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
        installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
      },
    });

    cache(octokit, {
      cache: {
        enabled: true,
      },
    });

    return new this(octokit);
  }

  static async fromOAuthCode(oAuthCode) {
    const oAuthAppAuth = createOAuthAppAuth({
      clientId: process.env.GITHUB_OAUTH_APP_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_APP_CLIENT_SECRET,
    });

    const oAuthUserAuth = await oAuthAppAuth({
      code: oAuthCode,
    });

    const octokit = new Octokit({
      authStrategy: createOAuthUserAuth,
      auth: oAuthUserAuth,
    });

    return new this(octokit);
  }
}
