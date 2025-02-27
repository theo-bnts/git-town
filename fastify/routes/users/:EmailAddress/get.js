import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/users/:UserEmailAddress/public',
    schema: {
      params: {
        type: 'object',
        properties: {
          UserEmailAddress: {
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
        keyGenerator: (request) => `${request.params.UserEmailAddress}-${request.routeOptions.url}`,
      },
    },
    handler: async (request) => {
      const { UserEmailAddress: userEmailAddress } = request.params;

      if (!(await User.isEmailAddressInserted(userEmailAddress))) {
        throw { statusCode: 404, error: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(userEmailAddress);

      return user.toPublicJSON();
    },
  });
}
