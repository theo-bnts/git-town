// eslint-disable-next-line import/no-unresolved
import { cache } from '@security-alliance/octokit-plugin-cache';
import { createAppAuth } from '@octokit/auth-app';
// eslint-disable-next-line import/no-unresolved
import { Octokit } from 'octokit';

export default class GitHubApp {
  Octokit;

  static Instance;

  constructor() {
    this.Octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
        installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
      },
    });

    cache(this.Octokit, {
      cache: {
        enabled: true,
      },
    });
  }

  async getOrganization() {
    const { data: organization } = await this.Octokit.rest.orgs.get({
      org: process.env.GITHUB_ORGANIZATION_ID,
    });

    return {
      Id: organization.id,
      Name: organization.login,
    };
  }

  async getUser(userId) {
    const { data: user } = await this.Octokit.rest.users.getById({
      account_id: Number(userId),
    });

    return {
      Id: user.id,
      Username: user.login,
    };
  }

  async getUserInvitations(userId) {
    const invitations = await this.Octokit.paginate(this.Octokit.rest.orgs.listPendingInvitations, {
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
    });

    const { Username: username } = await this.getUser(userId);

    return invitations
      .filter((invitation) => invitation.login === username)
      .map((invitation) => ({
        Id: invitation.id,
        User: {
          Username: invitation.login,
        },
      }));
  }

  async createInvitation(userId) {
    await this.Octokit.rest.orgs.createInvitation({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      invitee_id: Number(userId),
    });
  }

  async cancelInvitation(invitationId) {
    await this.Octokit.rest.orgs.cancelInvitation({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      invitation_id: invitationId,
    });
  }

  async removeMember(userId) {
    const { Username: username } = await this.getUser(userId);

    await this.Octokit.rest.orgs.removeMembershipForUser({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      username,
    });
  }

  async createRepository(name) {
    await this.Octokit.rest.repos.createInOrg({
      org: Number(process.env.GITHUB_ORGANIZATION_ID),
      name,
      homepage:
        `${process.env.FRONTEND_BASE_URL}${process.env.FRONTEND_REPOSITORIES_ENDPOINT}/${name}`,
      private: true,
    });
  }

  async createMilestone(repositoryName, title, date) {
    const { Name: organizationName } = await this.getOrganization();

    await this.Octokit.rest.issues.createMilestone({
      owner: organizationName,
      repo: repositoryName,
      title,
      due_on: date,
    });
  }

  async addCollaborator(repositoryName, userId) {
    const { Name: organizationName } = await this.getOrganization();
    const { Username: username } = await this.getUser(userId);

    await this.Octokit.rest.repos.addCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  async removeCollaborator(repositoryName, userId) {
    const { Name: organizationName } = await this.getOrganization();
    const { Username: username } = await this.getUser(userId);

    await this.Octokit.rest.repos.removeCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  // WARNING: For development purposes only
  async getInstallationToken() {
    const { token } = await this.Octokit.auth({
      type: 'installation',
    });

    return token;
  }

  // WARNING: For development purposes only
  async getRateLimit() {
    const { data } = await this.Octokit.rest.rateLimit.get();

    return data;
  }
}
