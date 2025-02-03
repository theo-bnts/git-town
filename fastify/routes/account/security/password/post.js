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
            maxLength: Number(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH),
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          temporary_code: {
            type: 'string',
            minLength: Number(process.env.TEMPORARY_CODE_LENGTH),
            maxLength: Number(process.env.TEMPORARY_CODE_LENGTH),
            pattern: process.env.TEMPORARY_CODE_PATTERN,
          },
          password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
          },
        },
        required: ['email_address', 'temporary_code', 'password'],
      },
    },
    handler: async function handler(request) {
      const { email_address: emailAddress, password, temporary_code: temporaryCode } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      if (!(await TemporaryCode.isValidValue(temporaryCode, user))) {
        throw { statusCode: 403, code: 'INVALID_TEMPORARY_CODE' };
      }

      await TemporaryCode.deleteAll(user);

      user.PasswordHashSalt = Security.generateHashSaltValue();
      user.PasswordHash = Security.hashPassword(password, user.PasswordHashSalt);

      await user.update();
    },
  });
}
