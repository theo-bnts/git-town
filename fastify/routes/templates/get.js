import DataQualityMiddleware from '../../entities/tools/DataQualityMiddleware.js';
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
      await DataQualityMiddleware.assertAuthentication(request);
      await DataQualityMiddleware.assertSufficientUserRole(request, 'teacher');
    },
    handler: () => Template.all(),
  });
}
