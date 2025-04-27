import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../entities/Repository.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/repositories/:RepositoryId/archive',
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
      body: {
        type: 'object',
        properties: {
          Archived: {
            type: 'boolean',
          },
        },
        required: ['Archived'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: repositoryId } = request.params;
      const { Archived: archived } = request.body;

      const repository = await Repository.fromId(repositoryId);

      if (archived === (repository.ArchivedAt !== null)) {
        throw { statusCode: 409, error: 'SAME_STATE' };
      }

      await GitHubApp.EnvironmentInstance.Repositories.updateArchivageState(
        repository.Id,
        archived,
      );

      repository.ArchivedAt = archived ? new Date() : null;

      await repository.update();
    },
  });
}
