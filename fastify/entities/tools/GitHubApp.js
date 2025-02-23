import { createAppAuth } from '@octokit/auth-app';
// eslint-disable-next-line import/no-unresolved
import { Octokit } from 'octokit';

import Proxy from './Proxy.js';

export default class GitHubApp {
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
          fetch: Proxy.fetch,
        },
      }),
    );
  }

  // WARNING: For development purposes only
  async getInstallationToken() {
    const { token } = await this.Octokit.auth({
      type: 'installation',
    });

    return token;
  }

  async getUser(applicationUser) {
    const { data: user } = await this.Octokit.rest.users.getById({
      account_id: Number(applicationUser.GitHubId),
    });

    return {
      Id: user.id,
      Username: user.login,
    };
  }

  async getOrganizationInvitations() {
    const invitations = await this.Octokit.paginate(this.Octokit.rest.orgs.listPendingInvitations, {
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
    });

    return invitations.map((invitation) => ({
      Id: invitation.id,
      User: {
        Username: invitation.login,
      },
    }));
  }

  async cancelOrganizationInvitation(invitationId) {
    await this.Octokit.rest.orgs.cancelInvitationForUser({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      invitation_id: invitationId,
    });
  }

  async inviteToOrganization(applicationUser) {
    await this.Octokit.rest.orgs.createInvitation({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      invitee_id: Number(applicationUser.GitHubId),
    });
  }

  async removeFromOrganization(username) {
    await this.Octokit.rest.orgs.removeMembershipForUser({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      username,
    });
  }

  // WARNING: For development purposes only
  async getRateLimit() {
    const { data } = await this.Octokit.rest.rateLimit.get();

    return data;
  }
}
