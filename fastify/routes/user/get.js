import Request from '../../entities/tools/Request.js';
import User from '../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/user',
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
      await Request.handleAuthentified(request, 'student');
    },
    handler: async function handler(request) {
      const user = await Request.getAuthentifiedUser(request, User);

      return user;
    },
  });
}
