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

  async getUser(userId) {
    const { data: user } = await this.Octokit.rest.users.getById({
      account_id: Number(userId),
    });

    return {
      Id: user.id,
      Username: user.login,
    };
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

  async getOrganizationEducationalTeam() {
    const { Name: organizationName } = await this.getOrganization();

    const { data: teams } = await this.Octokit.rest.teams.list({
      org: organizationName,
    });

    const educationalTeam = teams.find(
      (team) => team.id === Number(process.env.GITHUB_EDUCATIONAL_TEAM_ID),
    );

    return {
      Id: educationalTeam.id,
      Slug: educationalTeam.slug,
      Name: educationalTeam.name,
    };
  }

  async getOrganizationInvitations(userId) {
    const { Name: organizationName } = await this.getOrganization();

    const invitations = await this.Octokit.paginate(this.Octokit.rest.orgs.listPendingInvitations, {
      org: organizationName,
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

  async addOrganizationInvitation(userId) {
    const { Name: organizationName } = await this.getOrganization();

    await this.Octokit.rest.orgs.createInvitation({
      org: organizationName,
      invitee_id: Number(userId),
    });
  }

  async deleteOrganizationInvitation(invitationId) {
    const { Name: organizationName } = await this.getOrganization();

    await this.Octokit.rest.orgs.cancelInvitation({
      org: organizationName,
      invitation_id: invitationId,
    });
  }

  async deleteOrganizationMember(userId) {
    const { Name: organizationName } = await this.getOrganization();
    const { Username: username } = await this.getUser(userId);

    await this.Octokit.rest.orgs.removeMembershipForUser({
      org: organizationName,
      username,
    });
  }

  async addOrganizationEducationalTeamMember(userId) {
    const { Name: organizationName } = await this.getOrganization();
    const { Username: username } = await this.getUser(userId);
    const { Slug: teamSlug } = await this.getOrganizationEducationalTeam();

    await this.Octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
      org: organizationName,
      team_slug: teamSlug,
      username,
    });
  }

  async addOrganizationRepository(name) {
    const { Name: organizationName } = await this.getOrganization();

    await this.Octokit.rest.repos.createInOrg({
      org: organizationName,
      name,
      homepage:
        `${process.env.FRONTEND_BASE_URL}${process.env.FRONTEND_REPOSITORIES_ENDPOINT}/${name}`,
      private: true,
    });
  }

  async addOrganizationRepositoryMilestone(repositoryName, title, date) {
    const { Name: organizationName } = await this.getOrganization();

    await this.Octokit.rest.issues.createMilestone({
      owner: organizationName,
      repo: repositoryName,
      title,
      due_on: date,
    });
  }

  async addOrganizationEducationalTeamToAnOrganizationRepository(repositoryName) {
    const { Name: organizationName } = await this.getOrganization();
    const { Slug: teamSlug } = await this.getOrganizationEducationalTeam();

    await this.Octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
      org: organizationName,
      team_slug: teamSlug,
      owner: organizationName,
      repo: repositoryName,
    });
  }

  async addOrganizationMemberToAnOrganizationRepository(repositoryName, userId) {
    const { Name: organizationName } = await this.getOrganization();
    const { Username: username } = await this.getUser(userId);

    await this.Octokit.rest.repos.addCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  async removeOrganizationMemberFromAnOrganizationRepository(repositoryName, userId) {
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
