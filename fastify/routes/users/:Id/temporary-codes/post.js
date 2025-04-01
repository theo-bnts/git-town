import MailTransporter from '../../../../entities/tools/MailTransporter.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import Security from '../../../../entities/tools/Security.js';
import TemporaryCode from '../../../../entities/TemporaryCode.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:UserId/temporary-codes',
    schema: {
      params: {
        type: 'object',
        properties: {
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.params.UserId}-${request.routeOptions.url}`,
      },
    },
    preHandler: async (request) => ParametersMiddleware.assertUserIdInserted(request),
    handler: async (request) => {
      const { UserId: userId } = request.params;

      const user = await User.fromId(userId);

      const temporaryCode = new TemporaryCode(
        null,
        null,
        null,
        user,
        Security.generateTemporaryCodeValue(),
      );

      await temporaryCode.insert();

      await MailTransporter.Instance.sendTemporaryCode(
        user.EmailAddress,
        temporaryCode,
      );

      return temporaryCode.toPublicJSON();
    },
  });
}
