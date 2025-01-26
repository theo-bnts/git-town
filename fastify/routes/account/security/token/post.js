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
            maxLength: parseInt(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH, 10),
            format: 'email',
          },
          password: {
            type: 'string',
            minLength: parseInt(process.env.USER_PASSWORD_MIN_LENGTH, 10),
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
        throw { statusCode: 403, code: 'INVALID_PASSWORD' };
      }

      const token = new Token(
        null,
        Security.generateTokenValue(),
        new Date(
          Date.now()
            + parseInt(process.env.TOKEN_EXPIRATION_SECONDS, 10) * 1000,
        ),
        user,
        false,
      );

      await token.insert();

      const formattedToken = {
        value: token.Value,
        expiration: token.Expiration,
      };

      return {
        success: true,
        datas: formattedToken,
      };
    },
  });
}
