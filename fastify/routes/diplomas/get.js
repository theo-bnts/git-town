import AuthorizationMiddleware from '../../entities/tools/Middleware/AuthorizationMiddleware.js';
import Diploma from '../../entities/Diploma.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/diplomas',
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
    handler: () => Diploma.all(),
  });
}
