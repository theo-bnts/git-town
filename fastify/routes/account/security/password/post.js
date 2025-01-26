import Security from '../../../../entities/tools/Security.js';
import TemporaryCode from '../../../../entities/TemporaryCode.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/account/security/password',
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
          temporary_code: {
            type: 'string',
            minLength: parseInt(process.env.TEMPORARY_CODE_LENGTH, 10),
            maxLength: parseInt(process.env.TEMPORARY_CODE_LENGTH, 10),
            pattern: '^[0-9]*$',
          },
        },
        required: ['email_address', 'temporary_code', 'password'],
      },
    },
    handler: async function handler(request) {
      const {
        email_address: emailAddress,
        password,
        temporary_code: temporaryCode,
      } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      if (!(await TemporaryCode.isValidValue(temporaryCode, user))) {
        throw { statusCode: 403, code: 'INVALID_TEMPORARY_CODE' };
      }

      await TemporaryCode.expireAll(user);

      const passwordHashSalt = Security.generateSaltValue();

      user.PasswordHash = Security.hashPassword(password, passwordHashSalt);
      user.PasswordHashSalt = passwordHashSalt;

      await user.update();

      return { success: true };
    },
  });
}
