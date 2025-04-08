export default class GitHubEducationalTeam {
  App;

  constructor(app) {
    this.App = app;
  }

  async get() {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: teams } = await this.App.Octokit.rest.teams.list({
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

  async addMember(userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    const { Slug: teamSlug } = await this.get();

    await this.App.Octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
      org: organizationName,
      team_slug: teamSlug,
      username,
    });
  }

  async addRepository(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Slug: teamSlug } = await this.App.Teams.getEducationalTeam();

    await this.App.Octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
      org: organizationName,
      team_slug: teamSlug,
      owner: organizationName,
      repo: repositoryName,
    });
  }
}
