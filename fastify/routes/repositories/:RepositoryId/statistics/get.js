import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/repositories/:RepositoryId/statistics',
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            pattern: process.env.TOKEN_PATTERN,
          },
        },
        required: ['authorization'],
      },
      params: {
        type: 'object',
        properties: {
          RepositoryId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
      config: {
        rateLimit: {
          max: Number(process.env.RATE_LIMIT_AUTHENTICATED_STUDENT_GITHUB_MAX),
        },
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: repositoryId } = request.params;

      const [
        repository,
        languages,
        pullRequestCounts,
        hourlyAndDailyCumulativeCommits,
        weeklyCommits,
        weeklyLines,
        usersWeeklyCommitsAndLines,
      ] = await Promise.all([
        GitHubApp.EnvironmentInstance.Repositories.get(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getLanguages(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getPullRequestCounts(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getHourlyAndDailyCumulativeCommits(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getWeeklyCommits(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getWeeklyLines(repositoryId),
        GitHubApp.EnvironmentInstance.Repositories.getUsersWeeklyCommitsAndLines(repositoryId),
      ]);

      const mappedUsersPullRequestCounts = new Map();

      const existantPullRequestsUsers = await Promise.all(
        pullRequestCounts.Users.map((userContributions) => (
          User.isGitHubIdInserted(userContributions.User.Id))),
      );

      const filteredUsersPullRequestCounts = pullRequestCounts.Users
        .filter((_, index) => existantPullRequestsUsers[index]);

      await Promise.all(
        filteredUsersPullRequestCounts.map(async (userContributions) => {
          const user = await User.fromGitHubId(userContributions.User.Id);

          mappedUsersPullRequestCounts.set(user.Id, {
            User: user,
            PullRequests: {
              Open: userContributions.Open,
              Closed: userContributions.Closed,
              Weekly: userContributions.Weekly,
            },
          });
        }),
      );

      const mappedUsersWeeklyCommitsAndLines = new Map();

      if (usersWeeklyCommitsAndLines !== undefined) {
        const existantWeeklyCommitsAndLinesUsers = await Promise.all(
          usersWeeklyCommitsAndLines.map((userContributions) => (
            User.isGitHubIdInserted(userContributions.User.Id))),
        );

        const filteredUsersWeeklyCommitsAndLines = usersWeeklyCommitsAndLines
          .filter((_, index) => existantWeeklyCommitsAndLinesUsers[index]);

        await Promise.all(
          filteredUsersWeeklyCommitsAndLines.map(async (userContributions) => {
            const user = await User.fromGitHubId(userContributions.User.Id);

            mappedUsersWeeklyCommitsAndLines.set(user.Id, {
              User: user,
              Commits: userContributions.Commits,
              Lines: userContributions.Lines,
            });
          }),
        );
      }

      const sortedUsersContributions = Array.from(
        [mappedUsersPullRequestCounts, mappedUsersWeeklyCommitsAndLines]
          .reduce((accumulator, current) => {
            current.forEach((userData, userId) => {
              const previousUserData = accumulator.get(userId) || {
                User: userData.User,
                PullRequests: {
                  Open: 0,
                  Closed: 0,
                  Weekly: null,
                },
                Commits: {
                  Weekly: usersWeeklyCommitsAndLines !== undefined ? null : undefined,
                },
                Lines: {
                  Weekly: usersWeeklyCommitsAndLines !== undefined ? null : undefined,
                },
              };

              accumulator.set(userId, {
                User: userData.User,
                PullRequests: userData.PullRequests ?? previousUserData.PullRequests,
                Commits: userData.Commits ?? previousUserData.Commits,
                Lines: userData.Lines ?? previousUserData.Lines,
              });
            });

            return accumulator;
          }, new Map())
          .values(),
      )
        .sort((a, b) => a.User.FullName.localeCompare(b.User.FullName));

      return {
        Global: {
          Languages: languages,
          Issues: {
            Open: repository.Issues.Open - pullRequestCounts.Global.Open,
          },
          PullRequests: pullRequestCounts.Global,
          Pushes: repository.Pushes,
          Commits: {
            ...hourlyAndDailyCumulativeCommits,
            Weekly: weeklyCommits,
          },
          Lines: {
            Weekly: weeklyLines,
          },
        },
        Users: sortedUsersContributions.length > 0 || usersWeeklyCommitsAndLines !== undefined
          ? sortedUsersContributions
          : undefined,
      };
    },
  });
}
