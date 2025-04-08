import AuthorizationMiddleware from '../../entities/tools/Middleware/AuthorizationMiddleware.js';
import Promotion from '../../entities/Promotion.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/promotions',
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
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'teacher');
    },
    handler: () => Promotion.all(),
  });
}
