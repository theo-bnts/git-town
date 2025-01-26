import Request from '../../../../entities/tools/Request.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/account/security/token',
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            pattern: `${process.env.TOKEN_TYPE} [a-f0-9]{${process.env.TOKEN_LENGTH}}`,
          },
        },
        required: ['authorization'],
      },
    },
    preHandler: Request.handleAuthentified,
    handler: async function handler(request) {
      const token = await Request.getUsedToken(request);

      await token.expire();

      return { success: true };
    },
  });
}
