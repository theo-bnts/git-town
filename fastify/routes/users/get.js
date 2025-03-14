import DataQualityMiddleware from '../../entities/tools/DataQualityMiddleware.js';
import User from '../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users',
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
    },
    preHandler: async (request) => {
      await DataQualityMiddleware.assertAuthentication(request);
      await DataQualityMiddleware.assertSufficientUserRole(request, 'teacher');
    },
    handler: () => User.all(),
  });
}
