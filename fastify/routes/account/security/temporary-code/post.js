import MailTransporter from '../../../../entities/tools/MailTransporter.js';
import Security from '../../../../entities/tools/Security.js';
import TemporaryCode from '../../../../entities/TemporaryCode.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/account/security/temporary-code',
    schema: {
      body: {
        type: 'object',
        properties: {
          email_address: {
            type: 'string',
            maxLength: parseInt(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH, 10),
            format: 'email',
          },
        },
        required: ['email_address'],
      },
    },
    handler: async function handler(request) {
      const { email_address: emailAddress } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      const temporaryCode = new TemporaryCode(
        null,
        Security.generateTemporaryCodeValue(),
        new Date(
          Date.now()
            + parseInt(process.env.TEMPORARY_CODE_EXPIRATION_SECONDS, 10) * 1000,
        ),
        user,
      );

      await temporaryCode.insert();

      await MailTransporter.Instance.sendTemporaryCode(
        emailAddress,
        temporaryCode,
      );

      return {
        success: true,
        datas: {
          expiration: temporaryCode.Expiration,
        },
      };
    },
  });
}
