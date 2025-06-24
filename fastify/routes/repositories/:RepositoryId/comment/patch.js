import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../entities/Repository.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
    url: '/repositories/:RepositoryId/comment',
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
          Comment: {
            type: ['string', 'null'],
            pattern: process.env.GENERIC_PATTERN,
          },
        },
        required: ['Comment'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'teacher');
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: repositoryId } = request.params;
      const { Comment: comment } = request.body;

      const repository = await Repository.fromId(repositoryId);

      if (repository.ArchivedAt !== null) {
        throw { statusCode: 423, error: 'ARCHIVED' };
      }

      repository.Comment = comment;

      await repository.update();
    },
  });
}
