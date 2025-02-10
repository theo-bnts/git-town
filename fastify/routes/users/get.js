import User from '../../entities/User.js';
import Request from '../../entities/tools/Request.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users',
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
      await Request.handleAuthenticationWithRole(request, 'teacher');
    },
    handler: async function handler() {
      const users = await User.all();

      return users;
    },
  });
}
