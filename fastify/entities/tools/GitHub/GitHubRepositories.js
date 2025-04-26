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

    if (pullRequests.length === 0) {
      return {
        Global: {
          Open: 0,
          Closed: 0,
          Weekly: null,
        },
        Users: [],
      };
    }

    const weekPullRequestCounts = new Map();
    const usersWeekPullRequestCounts = new Map();

    pullRequests.forEach((pullRequest) => {
      const weekTimestamp = DateTime
        .fromISO(pullRequest.created_at, { zone: 'UTC' })
        .startOf('week')
        .toMillis();

      weekPullRequestCounts.set(
        weekTimestamp,
        (weekPullRequestCounts.get(weekTimestamp) ?? 0) + 1
      );

      if (!usersWeekPullRequestCounts.has(pullRequest.user.id)) {
        usersWeekPullRequestCounts.set(pullRequest.user.id, new Map());
      }

      const userWeekPullRequestCounts = usersWeekPullRequestCounts.get(pullRequest.user.id);

      userWeekPullRequestCounts.set(
        weekTimestamp,
        (userWeekPullRequestCounts.get(weekTimestamp) ?? 0) + 1
      );
    });

    const sortedWeekTimestamps = Array.from(weekPullRequestCounts.keys()).sort();

    const firstDayOfFirstWeek = DateTime
        .fromMillis(sortedWeekTimestamps[0], { zone: 'UTC' })
        .toJSDate();
    const firstDayOfLastWeek = DateTime
        .fromMillis(sortedWeekTimestamps.at(-1), { zone: 'UTC' })
        .toJSDate();

    const openPullRequests = pullRequests.filter((pullRequest) => pullRequest.state === 'open');
    const closedPullRequests = pullRequests.filter((pullRequest) => pullRequest.state === 'closed');

    const weeklyCounts = sortedWeekTimestamps.map(
      (weekTimestamp) => weekPullRequestCounts.get(weekTimestamp),
    );

    const usersWeeklyPullRequestCounts = Array.from(usersWeekPullRequestCounts.entries())
      .map(([userId, userWeekPullRequestCounts]) => {
        const sortedUserWeekTimestamps = Array.from(userWeekPullRequestCounts.keys())
          .sort();

        const firstDayOfFirstWeekUser = DateTime
          .fromMillis(sortedUserWeekTimestamps[0], { zone: 'UTC' })
          .toJSDate();
        const firstDayOfLastWeekUser = DateTime
          .fromMillis(sortedUserWeekTimestamps.at(-1), { zone: 'UTC' })
          .toJSDate();

        return {
          User: { Id: userId },
          Open: openPullRequests.filter((pullRequest) => pullRequest.user.id === userId).length,
          Closed: closedPullRequests.filter((pullRequest) => pullRequest.user.id === userId).length,
          Weekly: {
            FirstDayOfFirstWeek: firstDayOfFirstWeekUser,
            FirstDayOfLastWeek: firstDayOfLastWeekUser,
            Counts: sortedUserWeekTimestamps
              .map((timestamp) => userWeekPullRequestCounts.get(timestamp) ?? 0),
          },
        };
      });

    return {
      Global: {
        Open: openPullRequests.length,
        Closed: closedPullRequests.length,
        Weekly: {
          FirstDayOfFirstWeek: firstDayOfFirstWeek,
          FirstDayOfLastWeek: firstDayOfLastWeek,
          Counts: weeklyCounts,
        },
      },
      Users: usersWeeklyPullRequestCounts,
    };
  }

  async getWeeklyCommits(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const response = await this.App.Octokit.rest.repos.getCommitActivityStats({
      owner: organizationName,
      repo: repositoryName,
    });

    if (response.status === 202 || response.status === 204) {
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

    if (response.status === 202 || response.status === 204) {
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
      }));

    return {
      FirstDayOfFirstWeek: firstDayOfFirstWeek,
      FirstDayOfLastWeek: firstDayOfLastWeek,
      Counts: lineCounts,
    };
  }

  async getHourlyAndDailyCumulativeCommits(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const response = await this.App.Octokit.rest.repos.getPunchCardStats({
      owner: organizationName,
      repo: repositoryName,
    });

    if (response.status === 204) {
      return null;
    }

    const commits = response.data;

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

    if (response.status === 202 || response.status === 204) {
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
