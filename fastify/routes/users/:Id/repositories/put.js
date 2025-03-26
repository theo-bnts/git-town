import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHubApp.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import Repository from '../../../../entities/Repository.js';
import User from '../../../../entities/User.js';
import UserRepository from '../../../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users/:UserId/repositories',
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
        },
      },
      body: {
        type: 'object',
        properties: {
          Repository: {
            type: 'object',
            properties: {
              Id: {
                type: 'string',
                pattern: process.env.UUID_PATTERN,
              },
            },
            required: ['Id'],
          },
        },
        required: ['Repository'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const { Repository: { Id: repositoryId } } = request.body;

      if (!await Repository.isIdInserted(repositoryId)) {
        throw { statusCode: 404, error: 'UNKNOWN_REPOSITORY_ID' };
      }

      const user = await User.fromId(userId);
      const repository = await Repository.fromId(repositoryId);

      if (await UserRepository.isUserAndRepositoryInserted(user, repository)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      if (user.GitHubOrganizationMember) {
        await GitHubApp.Instance.addCollaborator(repository.Id, user.GitHubId);
      }

      const userRepository = new UserRepository(
        null,
        null,
        null,
        user,
        repository,
      );

      await userRepository.insert();

      return repository;
    },
  });
}
