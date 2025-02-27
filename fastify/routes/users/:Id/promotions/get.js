import Middleware from '../../../../entities/tools/Middleware.js';
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
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'teacher');
      await Middleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      return UserPromotion.fromUser(user);
    },
  });
}
