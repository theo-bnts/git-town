import { DateTime, Duration } from 'luxon';

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

  async getWeeklyCommits(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: commits } = await this.App.Octokit.rest.repos.getCommitActivityStats({
      owner: organizationName,
      repo: repositoryName,
    });

    const firstWeekIndex = commits.findIndex((week) => week.total !== 0);
    const lastWeekIndex = commits.findLastIndex((week) => week.total !== 0);

    const firstDayOfFirstWeek = DateTime
      .fromSeconds(commits[firstWeekIndex].week, { zone: 'UTC' })
      .plus({ days: 1 })
      .toJSDate();

    const firstDayOfLastWeek = DateTime
      .fromSeconds(commits[lastWeekIndex].week, { zone: 'UTC' })
      .plus({ days: 1 })
      .toJSDate();

    const commitCounts = commits
      .slice(firstWeekIndex, lastWeekIndex + 1)
      .map((week, index) => {
        const todaySunday = week.days[0];

        const nextSunday = commits[firstWeekIndex + index + 1] !== undefined
          ? commits[firstWeekIndex + index + 1].days[0]
          : 0;

        return week.total - todaySunday + nextSunday;
      });

    return {
      FirstDayOfFirstWeek: firstDayOfFirstWeek,
      FirstDayOfLastWeek: firstDayOfLastWeek,
      Counts: commitCounts,
    };
  }

  async getWeeklyLines(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: lines } = await this.App.Octokit.rest.repos.getCodeFrequencyStats({
      owner: organizationName,
      repo: repositoryName,
    });

    const firstWeekIndex = lines.findIndex((week) => week[1] !== 0 || week[2] !== 0);
    const lastWeekIndex = lines.findLastIndex((week) => week[1] !== 0 || week[2] !== 0);

    const firstDayOfFirstWeek = DateTime
      .fromSeconds(lines[firstWeekIndex][0], { zone: 'UTC' })
      .plus({ days: 1 })
      .toJSDate();

    const firstDayOfLastWeek = DateTime
      .fromSeconds(lines[lastWeekIndex][0], { zone: 'UTC' })
      .plus({ days: 1 })
      .toJSDate();

    const lineCounts = lines
      .slice(firstWeekIndex, lastWeekIndex + 1)
      .map((week) => ({
        Additions: week[1],
        Deletions: Math.abs(week[2]),
        Differentials: week[1] + week[2],
      }));

    return {
      FirstDayOfFirstWeek: firstDayOfFirstWeek,
      FirstDayOfLastWeek: firstDayOfLastWeek,
      Counts: lineCounts,
    };
  }

  async getHourlyAndDailyCumulativeCommits(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: commits } = await this.App.Octokit.rest.repos.getPunchCardStats({
      owner: organizationName,
      repo: repositoryName,
    });

    const hourlyCumulativeCommitCounts = Array.from({ length: 24 }, () => 0);
    const dailyCumulativeCommitCounts  = Array.from({ length: 7 }, () => 0);

    commits.forEach(([day, hour, count]) => {
      hourlyCumulativeCommitCounts[hour] += count;
      dailyCumulativeCommitCounts[day] += count;
    });

    dailyCumulativeCommitCounts.push(dailyCumulativeCommitCounts.shift());

    return {
      Hourly: {
        Counts: hourlyCumulativeCommitCounts,
      },
      Daily: {
        Counts: dailyCumulativeCommitCounts,
      },
    };
  }
}
