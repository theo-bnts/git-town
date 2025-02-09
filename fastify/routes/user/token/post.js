import Security from '../../../entities/tools/Security.js';
import Token from '../../../entities/Token.js';
import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/user/token',
    schema: {
      body: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          Password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
        },
        required: ['EmailAddress', 'Password'],
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_ENDPOINT_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.routerPath}-${request.body.EmailAddress}`,
      },
    },
    handler: async function handler(request) {
      const { EmailAddress: emailAddress, Password: password } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 404, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      if (!user.isValidPassword(password)) {
        throw { statusCode: 401, code: 'INVALID_PASSWORD' };
      }

      const token = new Token(
        null,
        null,
        null,
        user,
        Security.generateTokenValue(),
      );

      await token.insert();

      return token;
    },
  });
}
