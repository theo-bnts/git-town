import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/user/password',
    schema: {
      querystring: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
        },
        required: ['EmailAddress'],
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_ENDPOINT_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.routerPath}-${request.query.EmailAddress}`,
      },
    },
    handler: async function handler(request) {
      const { EmailAddress: emailAddress } = request.query;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 404, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const { PasswordHash: passwordHash } = await User.fromEmailAddress(emailAddress);

      return { Defined: passwordHash !== null };
    },
  });
}
