import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import User from '../../../../entities/User.js';
import UserRepository from '../../../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'GET',
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
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRoleOrUserIdMatch(request, 'teacher');
      await ParametersMiddleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      const repositories = await UserRepository.fromUser(user);

      return repositories.map((repository) => repository.Repository);
    },
  });
}
