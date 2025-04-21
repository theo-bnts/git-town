import { DateTime } from 'luxon';

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

  async getLanguages(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: languages } = await this.App.Octokit.rest.repos.listLanguages({
      owner: organizationName,
      repo: repositoryName,
    });

    const languagesArray = Object.entries(languages);

    const languagesSize = languagesArray.reduce((accumulator, [, size]) => accumulator + size, 0);

    return languagesArray
      .map(([name, size]) => ({
        Name: name,
        Percentage: Math.round((size / languagesSize) * 100 * 10) / 10,
      }));
  }

  async getPullRequestCounts(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const pullRequests = await this.App.Octokit.paginate(
      this.App.Octokit.rest.pulls.list,
      {
        owner: organizationName,
        repo: repositoryName,
        state: 'all',
      },
    );

    const pullRequestWeekStartTimestamps = pullRequests.map((pullRequest) => DateTime.fromISO(pullRequest.created_at, { zone: 'UTC' })
      .startOf('week')
      .toMillis());

    const uniquePullRequestWeekStartTimestamps = Array.from(
      new Set(pullRequestWeekStartTimestamps),
    );

    const firstDayOfFirstWeek = DateTime
      .fromMillis(uniquePullRequestWeekStartTimestamps[0], { zone: 'UTC' })
      .toJSDate();
    const firstDayOfLastWeek = DateTime
      .fromMillis(
        uniquePullRequestWeekStartTimestamps[uniquePullRequestWeekStartTimestamps.length - 1],
        { zone: 'UTC' },
      )
      .toJSDate();

    const weeklyCounts = uniquePullRequestWeekStartTimestamps.map((uniqueTimestamps) => (
      pullRequestWeekStartTimestamps
        .filter((timestamps) => timestamps === uniqueTimestamps)
        .length
    ));

    return {
      Global: {
        All: pullRequests.length,
        Open: pullRequests.filter((pullRequest) => pullRequest.state === 'open').length,
        Closed: pullRequests.filter((pullRequest) => pullRequest.state === 'closed').length,
        Weekly: {
          FirstDayOfFirstWeek: firstDayOfFirstWeek,
          FirstDayOfLastWeek: firstDayOfLastWeek,
          Counts: weeklyCounts,
        },
      },
      User: {
      },
    };
  }

  async getWeeklyCommits(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const response = await this.App.Octokit.rest.repos.getCommitActivityStats({
      owner: organizationName,
      repo: repositoryName,
    });

    if (response.status === 202) {
      return null;
    }

    const commits = response.data;

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

    const response = await this.App.Octokit.rest.repos.getCodeFrequencyStats({
      owner: organizationName,
      repo: repositoryName,
    });

    if (response.status === 202) {
      return null;
    }

    const lines = response.data;

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
    const dailyCumulativeCommitCounts = Array.from({ length: 7 }, () => 0);

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

  async getUsersWeeklyCommitsAndLines(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const response = await this.App.Octokit.rest.repos.getContributorsStats({
      owner: organizationName,
      repo: repositoryName,
    });

    if (response.status === 202) {
      return null;
    }

    const commits = response.data;

    return commits.map((userContributions) => {
      const firstWeekIndex = userContributions.weeks.findIndex((week) => week.c !== 0);
      const lastWeekIndex = userContributions.weeks.findLastIndex((week) => week.c !== 0);

      const firstDayOfFirstWeek = DateTime
        .fromSeconds(userContributions.weeks[firstWeekIndex].w, { zone: 'UTC' })
        .plus({ days: 1 })
        .toJSDate();
      const firstDayOfLastWeek = DateTime
        .fromSeconds(userContributions.weeks[lastWeekIndex].w, { zone: 'UTC' })
        .plus({ days: 1 })
        .toJSDate();

      const commitCounts = userContributions.weeks
        .slice(firstWeekIndex, lastWeekIndex + 1)
        .map((week, index) => {
          const todaySunday = week.c;
          const nextSunday = userContributions.weeks[firstWeekIndex + index + 1] !== undefined
            ? userContributions.weeks[firstWeekIndex + index + 1].c
            : 0;

          return week.c - todaySunday + nextSunday;
        });

      const linesCounts = userContributions.weeks
        .slice(firstWeekIndex, lastWeekIndex + 1)
        .map((week) => ({
          Additions: week.a,
          Deletions: Math.abs(week.d),
          Differentials: week.a + week.d,
        }));

      return {
        User: {
          Id: userContributions.author.id,
        },
        Commits: {
          Weekly: {
            FirstDayOfFirstWeek: firstDayOfFirstWeek,
            FirstDayOfLastWeek: firstDayOfLastWeek,
            Counts: commitCounts,
          },
        },
        Lines: {
          Weekly: {
            FirstDayOfFirstWeek: firstDayOfFirstWeek,
            FirstDayOfLastWeek: firstDayOfLastWeek,
            Counts: linesCounts,
          },
        },
      };
    });
  }
}
