import DataQualityMiddleware from '../../../entities/tools/DataQualityMiddleware.js';
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
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await DataQualityMiddleware.assertAuthentication(request);
      await DataQualityMiddleware.assertUserIdMatch(request);
    },
    handler: (request) => {
      const { UserId: userId } = request.params;

      return User.fromId(userId);
    },
  });
}
