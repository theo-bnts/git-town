import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import Security from '../../../../entities/tools/Security.js';
import TemporaryCode from '../../../../entities/TemporaryCode.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:UserId/password',
    schema: {
      params: {
        type: 'object',
        properties: {
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        additionalProperties: false,
      },
      body: {
        type: 'object',
        properties: {
          TemporaryCode: {
            type: 'string',
            pattern: process.env.TEMPORARY_CODE_PATTERN,
          },
          Password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
        },
        additionalProperties: false,
        required: ['TemporaryCode', 'Password'],
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.params.UserId}-${request.routeOptions.url}`,
      },
    },
    preHandler: async (request) => ParametersMiddleware.assertUserIdExists(request),
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const { Password: password, TemporaryCode: temporaryCode } = request.body;

      const user = await User.fromId(userId);

      if (!(await TemporaryCode.isValidValue(temporaryCode, user))) {
        throw { statusCode: 401, error: 'INVALID_TEMPORARY_CODE' };
      }

      await TemporaryCode.deleteAll(user);

      user.PasswordHashSalt = Security.generateHashSaltValue();
      user.PasswordHash = Security.hashPassword(password, user.PasswordHashSalt);

      await user.update();
    },
  });
}
