import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import Repository from '../../entities/Repository.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/repositories',
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
    handler: async (request) => Repository.all(),
  });
}
