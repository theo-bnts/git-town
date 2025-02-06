import Security from '../../../entities/tools/Security.js';
import TemporaryCode from '../../../entities/TemporaryCode.js';
import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/user/password',
    schema: {
      body: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          TemporaryCode: {
            type: 'string',
            pattern: process.env.TEMPORARY_CODE_PATTERN,
          },
          Password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
          },
        },
        required: ['EmailAddress', 'TemporaryCode', 'Password'],
      },
    },
    handler: async function handler(request) {
      const {
        EmailAddress: emailAddress,
        Password: password,
        TemporaryCode: temporaryCode,
      } = request.body;

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
