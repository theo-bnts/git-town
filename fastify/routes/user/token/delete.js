import Request from '../../../entities/tools/Request.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/user/token',
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
      await Request.handleAuthenticatedWithRole(request, 'student');
    },
    handler: async function handler(request) {
      const token = await Request.getUsedToken(request);

      await token.delete();
    },
  });
}
