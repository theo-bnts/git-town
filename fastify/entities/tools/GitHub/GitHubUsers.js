export default class GitHubUsers {
  App;

  constructor(app) {
    this.App = app;
  }

  async getAuthenticated() {
    const { data: user } = await this.App.Octokit.rest.users.getAuthenticated();

    return {
      Id: user.id,
      Username: user.login,
    };
  }

  async get(userId) {
    const { data: user } = await this.App.Octokit.rest.users.getById({
      account_id: Number(userId),
    });

    return {
      Id: user.id,
      Username: user.login,
    };
  }
}
