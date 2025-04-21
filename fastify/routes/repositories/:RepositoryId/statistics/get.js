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

      const languages = await GitHubApp.EnvironmentInstance.Repositories
        .getLanguages(repositoryId);

      const hourlyAndDailyCumulativeCommits = await GitHubApp.EnvironmentInstance.Repositories
        .getHourlyAndDailyCumulativeCommits(repositoryId);

      const weeklyCommits = await GitHubApp.EnvironmentInstance.Repositories
        .getWeeklyCommits(repositoryId);

      const weeklyLines = await GitHubApp.EnvironmentInstance.Repositories
        .getWeeklyLines(repositoryId);

      const usersWeeklyCommitsAndLines = await GitHubApp.EnvironmentInstance.Repositories
        .getUsersWeeklyCommitsAndLines(repositoryId);

      const existantUsers = await Promise.all(
        usersWeeklyCommitsAndLines.map((userContributions) => (
          User.isGitHubIdInserted(userContributions.User.Id))),
      );

      const filteredUsersWeeklyCommitsAndLines = usersWeeklyCommitsAndLines
        .filter((_, index) => existantUsers[index]);

      const mappedUsersWeeklyCommitsAndLines = await Promise.all(
        filteredUsersWeeklyCommitsAndLines.map(async (userContributions) => {
          const user = await User.fromGitHubId(userContributions.User.Id);
          return { ...userContributions, User: user };
        }),
      );

      const sortedUsersWeeklyCommitsAndLines = mappedUsersWeeklyCommitsAndLines
        .sort((a, b) => a.User.FullName.localeCompare(b.User.FullName));

      const pullRequestCounts = await GitHubApp.EnvironmentInstance.Repositories
        .getPullRequestCounts(repositoryId);

      return {
        Global: {
          Languages: languages,
          PullRequests: pullRequestCounts,
          Commits: {
            ...hourlyAndDailyCumulativeCommits,
            Weekly: weeklyCommits,
          },
          Lines: {
            Weekly: weeklyLines,
          },
        },
        Users: sortedUsersWeeklyCommitsAndLines,
      };
    },
  });
}
