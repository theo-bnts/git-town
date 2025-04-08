export default class GitHubOrganization {
  App;

  constructor(app) {
    this.App = app;
  }

  async get() {
    const { data: organization } = await this.App.Octokit.rest.orgs.get({
      org: process.env.GITHUB_ORGANIZATION_ID,
    });

    return {
      Id: organization.id,
      Name: organization.login,
    };
  }

  async getInvitations(userId) {
    const { Name: organizationName } = await this.get();

    const invitations = await this.App.Octokit.paginate(
      this.App.Octokit.rest.orgs.listPendingInvitations,
      { org: organizationName },
    );

    const { Username: username } = await this.App.Users.get(userId);

    return invitations
      .filter((invitation) => invitation.login === username)
      .map((invitation) => ({
        Id: invitation.id,
        User: {
          Username: invitation.login,
        },
      }));
  }

  async addInvitation(userId) {
    const { Name: organizationName } = await this.get();

    await this.App.Octokit.rest.orgs.createInvitation({
      org: organizationName,
      invitee_id: Number(userId),
    });
  }

  async removeInvitation(invitationId) {
    const { Name: organizationName } = await this.get();

    await this.App.Octokit.rest.orgs.cancelInvitation({
      org: organizationName,
      invitation_id: invitationId,
    });
  }

  async removeMember(userId) {
    const { Name: organizationName } = await this.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.orgs.removeMembershipForUser({
      org: organizationName,
      username,
    });
  }
}
