import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import UserRepository from '../../../../entities/UserRepository.js';
import Repository from '../../../../entities/Repository.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/repositories/:RepositoryId/users',
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
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRoleOrUserInRepository(request, 'teacher');
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: repositoryId } = request.params;

      const repository = await Repository.fromId(repositoryId);

      const userRepositories = await UserRepository.fromRepository(repository);

      return userRepositories.map((userRepository) => userRepository.User);
    },
  });
}
