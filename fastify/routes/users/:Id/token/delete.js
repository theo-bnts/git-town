import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import Request from '../../../../entities/tools/Request.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:UserId/token',
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
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertUserIdMatch(request);
    },
    handler: async (request) => {
      const token = await Request.getUsedToken(request);

      await token.delete();
    },
  });
}
