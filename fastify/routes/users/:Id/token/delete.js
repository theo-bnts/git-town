import Token from '../../../../entities/Token.js';
import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:UserId/token',
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
      await AuthorizationMiddleware.assertSufficientUserRoleOrUserIdMatch(request, 'administrator');
      await ParametersMiddleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      const tokens = await Token.fromUser(user);

      await Promise.all(tokens.map((token) => token.delete()));
    },
  });
}
