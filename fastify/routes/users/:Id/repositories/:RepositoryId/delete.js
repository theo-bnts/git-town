import AuthorizationMiddleware from '../../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../../entities/Repository.js';
import User from '../../../../../entities/User.js';
import UserRepository from '../../../../../entities/UserRepository.js';
import GitHubApp from '../../../../../entities/tools/GitHub/GitHubApp.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:UserId/repositories/:RepositoryId',
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
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
          RepositoryId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdInserted(request);
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId, RepositoryId: repositoryId } = request.params;

      const user = await User.fromId(userId);
      const repository = await Repository.fromId(repositoryId);

      if (!await UserRepository.isUserAndRepositoryInserted(user, repository)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_REPOSITORY' };
      }

      if (user.GitHubOrganizationMember) {
        GitHubApp.EnvironmentInstance.Repositories.removeMember(repository.GitHubId, user.GitHubId);
      }

      const userRepository = await UserRepository.fromUserAndRepository(user, repository);

      await userRepository.delete();
    },
  });
}
