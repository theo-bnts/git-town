export default class GitHubRepositories {
  App;

  constructor(app) {
    this.App = app;
  }

  async get(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: repository } = await this.App.Octokit.rest.repos.get({
      owner: organizationName,
      repo: repositoryName,
    });

    return {
      DefaultBranchName: repository.default_branch,
    };
  }

  async add(name) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.repos.createInOrg({
      org: organizationName,
      name,
      homepage:
        `${process.env.FRONTEND_BASE_URL}${process.env.FRONTEND_REPOSITORIES_ENDPOINT}/${name}`,
      private: true,
    });
  }

  async update(repositoryName, defaultBranchName) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.repos.update({
      owner: organizationName,
      repo: repositoryName,
      default_branch: defaultBranchName,
    });
  }

  async addMember(repositoryName, userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.repos.addCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  async removeMember(repositoryName, userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.repos.removeCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  async getWeeklyCommitCount(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: commits } = await this.App.Octokit.rest.repos.getParticipationStats({
      owner: organizationName,
      repo: repositoryName,
    });

    return commits;
  }
}
