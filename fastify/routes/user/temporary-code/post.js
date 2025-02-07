import MailTransporter from '../../../entities/tools/MailTransporter.js';
import Security from '../../../entities/tools/Security.js';
import TemporaryCode from '../../../entities/TemporaryCode.js';
import User from '../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/user/temporary-code',
    schema: {
      body: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
        },
        required: ['EmailAddress'],
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
      const { EmailAddress: emailAddress } = request.body;

      if (!(await User.isEmailAddressInserted(emailAddress))) {
        throw { statusCode: 401, code: 'UNKNOWN_EMAIL_ADDRESS' };
      }

      const user = await User.fromEmailAddress(emailAddress);

      const temporaryCode = new TemporaryCode(
        null,
        null,
        null,
        user,
        Security.generateTemporaryCodeValue(),
      );

      await temporaryCode.insert();

      await MailTransporter.Instance.sendTemporaryCode(
        emailAddress,
        temporaryCode,
      );

      return temporaryCode;
    },
  });
}
