import Middleware from '../../../../entities/tools/Middleware.js';
import Security from '../../../../entities/tools/Security.js';
import TemporaryCode from '../../../../entities/TemporaryCode.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:Id/password',
    schema: {
      params: {
        type: 'object',
        properties: {
          Id: {
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
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_ENDPOINT_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.params.Id}-${request.routeOptions.url}`,
      },
    },
    preHandler: async (request) => Middleware.assertUserIdExists(request),
    handler: async (request) => {
      const { Id: id } = request.params;
      const { Password: password, TemporaryCode: temporaryCode } = request.body;

      const user = await User.fromId(id);

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
