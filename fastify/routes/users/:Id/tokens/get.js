import Token from '../../../../entities/Token.js';
import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:UserId/tokens',
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
      await ParametersMiddleware.assertUserIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      const tokens = await Token.fromUser(user);

      return tokens.map((token) => token.toSafeJSON());
    },
  });
}
