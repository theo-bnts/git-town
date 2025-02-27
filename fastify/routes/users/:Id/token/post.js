import Middleware from '../../../../entities/tools/Middleware.js';
import Security from '../../../../entities/tools/Security.js';
import Token from '../../../../entities/Token.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/users/:UserId/token',
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
          Password: {
            type: 'string',
            minLength: Number(process.env.USER_PASSWORD_MIN_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
        },
        additionalProperties: false,
        required: ['Password'],
      },
    },
    config: {
      rateLimit: {
        max: Number(process.env.RATE_LIMIT_NOT_AUTHENTICATED_ENDPOINT_MAX),
        allowList: false,
        keyGenerator: (request) => `${request.params.UserId}-${request.routeOptions.url}`,
      },
    },
    preHandler: async (request) => Middleware.assertUserIdExists(request),
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const { Password: password } = request.body;

      const user = await User.fromId(userId);

      if (!user.isValidPassword(password)) {
        throw { statusCode: 401, error: 'INVALID_PASSWORD' };
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
