import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';

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

      const hourlyAndDailyCumulativeCommits = await GitHubApp.EnvironmentInstance.Repositories
        .getHourlyAndDailyCumulativeCommits(repositoryId);

      const weeklyCommits = await GitHubApp.EnvironmentInstance.Repositories
        .getWeeklyCommits(repositoryId);

      const weeklyLines = await GitHubApp.EnvironmentInstance.Repositories
        .getWeeklyLines(repositoryId);

      return {
        Commits: {
          ...hourlyAndDailyCumulativeCommits,
          Weekly: weeklyCommits,
        },
        Lines: {
          Weekly: weeklyLines,
        },
      };
    },
  });
}
