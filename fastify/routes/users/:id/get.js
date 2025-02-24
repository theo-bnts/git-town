import Middleware from '../../../entities/tools/Middleware.js';
import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:Id',
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
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertUserIdMatch(request);
    },
    handler: async (request) => {
      const { Id: id } = request.params;

      const user = await User.fromId(id);

      return user;
    },
  });
}
