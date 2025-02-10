import User from '../../entities/User.js';
import Request from '../../entities/tools/Request.js';
import Role from '../../entities/Role.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users',
    schema: {
      headers: {
        type: 'object',
        properties: {
          authorization: {
            type: 'string',
            pattern: process.env.TOKEN_PATTERN,
          },
        },
        required: ['authorization'],
      },
      body: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          FullName: {
            type: 'string',
            maxLength: Number(process.env.USER_FULL_NAME_MAX_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
          Role: {
            type: 'object',
            properties: {
              Keyword: {
                type: 'string',
                pattern: process.env.ROLE_KEYWORD_PATTERN,
              },
            },
            required: ['Keyword'],
          },
        },
        required: ['EmailAddress', 'FullName', 'Role'],
      },
    },
    preHandler: async (request) => {
      await Request.handleAuthenticationWithRole(request, 'administrator');
    },
    handler: async function handler(request) {
      const {
        EmailAddress: emailAddress,
        FullName: fullName,
        Role: { Keyword: roleKeyword },
      } = request.body;

      if (await User.isEmailAddressInserted(emailAddress)) {
        throw { statusCode: 409, error: 'EMAIL_ADDRESS_ALREADY_EXISTS' };
      }

      if (!(await Role.isKeywordInserted(roleKeyword))) {
        throw { statusCode: 404, error: 'UNKNOWN_ROLE_KEYWORD' };
      }

      const role = await Role.fromKeyword(roleKeyword);

      const user = new User(
        null,
        null,
        null,
        emailAddress,
        null,
        null,
        fullName,
        role,
        null,
      );

      await user.insert();
    },
  });
}
