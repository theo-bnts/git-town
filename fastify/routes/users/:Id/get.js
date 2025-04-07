import AuthorizationMiddleware from '../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../entities/tools/Middleware/ParametersMiddleware.js';
import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:UserId',
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
      await ParametersMiddleware.assertUserIdInserted(request);
    },
    handler: (request) => {
      const { UserId: userId } = request.params;

      return User.fromId(userId);
    },
  });
}
