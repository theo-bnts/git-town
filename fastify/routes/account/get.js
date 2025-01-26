import Request from '../../entities/tools/Request.js';
import User from '../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/account',
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
      const user = await Request.getAuthentifiedUser(request, User);

      return {
        success: true,
        datas: {
          email_address: user.EmailAddress,
          user_name: user.UserName,
        },
      };
    },
  });
}
