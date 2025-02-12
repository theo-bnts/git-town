import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:EmailAddress/public',
    schema: {
      params: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
        },
        additionalProperties: false,
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_ENDPOINT_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.query.EmailAddress}-${request.routeOptions.url}`,
      },
    },
    handler: async (request) => {
      const { EmailAddress: emailAddress } = request.params;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 404, error: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      return {
        Id: user.Id,
        PasswordDefined: user.isPasswordDefined(),
      };
    },
  });
}
