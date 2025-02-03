import Security from '../../../../entities/tools/Security.js';
import Token from '../../../../entities/Token.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/account/security/token',
    schema: {
      body: {
        type: 'object',
        properties: {
          email_address: {
            type: 'string',
            maxLength: Number(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH),
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
          },
        },
        required: ['email_address', 'password'],
      },
    },
    handler: async function handler(request) {
      const { email_address: emailAddress, password } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      if (!user.isValidPassword(password)) {
        // throw { statusCode: 403, code: 'INVALID_PASSWORD' };
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
