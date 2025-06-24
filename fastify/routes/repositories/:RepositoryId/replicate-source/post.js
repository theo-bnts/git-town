import { DateTime } from 'luxon';

import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../entities/Repository.js';
import SSHDGit from '../../../../entities/tools/SSHDGit.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/repositories/:RepositoryId/replicate-source',
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
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        required: ['Id'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: sourceRepositoryId } = request.params;
      const { Id: targetRepositoryId } = request.body;

      if (!await Repository.isIdInserted(targetRepositoryId)) {
        throw { statusCode: 409, error: 'UNKNOWN_TARGET_REPOSITORY_ID' };
      }

      const targetRepository = await Repository.fromId(targetRepositoryId);

      if (targetRepository.ArchivedAt !== null) {
        throw { statusCode: 423, error: 'TARGET_IS_ARCHIVED' };
      }

      if (sourceRepositoryId === targetRepositoryId) {
        throw { statusCode: 409, error: 'SAME_REPOSITORY_ID' };
      }

      const sourceRepository = await Repository.fromId(sourceRepositoryId);

      if (targetRepository.CreatedAt < sourceRepository.CreatedAt) {
        throw { statusCode: 409, error: 'TARGET_IS_OLDER' };
      }

      if (DateTime.now().diff(DateTime.fromJSDate(targetRepository.CreatedAt), 'days').days > 1) {
        throw { statusCode: 409, error: 'TARGET_IS_OLDER_THAN_1_DAY' };
      }

      const SSHDGitInstance = await SSHDGit.fromEnvironment();

      await SSHDGitInstance.clone(sourceRepositoryId, targetRepositoryId);

      const gitHubSourceRepository = await GitHubApp.EnvironmentInstance.Repositories
        .get(sourceRepository.Id);

      await GitHubApp.EnvironmentInstance.Repositories
        .updateDefaultBranch(targetRepository.Id, gitHubSourceRepository.Branches.Default.Name);
    },
  });
}
