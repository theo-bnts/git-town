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
          },
        },
        required: ['EmailAddress', 'Password'],
      },
    },
    handler: async function handler(request) {
      const { EmailAddress: emailAddress, Password: password } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      if (!user.isValidPassword(password)) {
        throw { statusCode: 403, code: 'INVALID_PASSWORD' };
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
