import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../entities/EnseignementUnit.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/enseignement-units',
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
    handler: () => EnseignementUnit.all(),
  });
}
