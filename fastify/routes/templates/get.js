import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import Template from '../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/templates',
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
    handler: () => Template.all(),
  });
}
