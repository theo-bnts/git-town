import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import DataQualityMiddleware from '../../../../entities/tools/DataQualityMiddleware.js';
import User from '../../../../entities/User.js';
import UserPromotion from '../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:UserId/promotions',
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
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'teacher');
      await DataQualityMiddleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      return UserPromotion.fromUser(user);
    },
  });
}
