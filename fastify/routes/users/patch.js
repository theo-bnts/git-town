import Middleware from '../../entities/tools/Middleware.js';
import User from '../../entities/User.js';
import Request from '../../entities/tools/Request.js';
import Role from '../../entities/Role.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
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
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
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
            additionalProperties: false,
            required: ['Keyword'],
          },
        },
        required: ['Id'],
        additionalProperties: false,
        minProperties: 2,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const {
        Id: id, EmailAddress: emailAddress, FullName: fullName, Role: role,
      } = request.body;

      if (!await User.isIdInserted(id)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
      }

      const requestedUser = await User.fromId(id);

      if (emailAddress !== undefined) {
        if (emailAddress === requestedUser.EmailAddress) {
          throw { statusCode: 409, error: 'SAME_EMAIL_ADDRESS' };
        }

        if (await User.isEmailAddressInserted(emailAddress)) {
          throw { statusCode: 409, error: 'DUPLICATE_EMAIL_ADDRESS' };
        }

        requestedUser.EmailAddress = emailAddress;
      }

      if (fullName !== undefined) {
        if (fullName === requestedUser.FullName) {
          throw { statusCode: 409, error: 'SAME_FULL_NAME' };
        }

        requestedUser.FullName = fullName;
      }

      if (role !== undefined) {
        const roleKeyword = role.Keyword;

        if (!(await Role.isKeywordInserted(roleKeyword))) {
          throw { statusCode: 404, error: 'UNKNOWN_ROLE_KEYWORD' };
        }

        if (roleKeyword === requestedUser.Role.Keyword) {
          throw { statusCode: 409, error: 'SAME_ROLE_KEYWORD' };
        }

        if (roleKeyword === 'student' || requestedUser.Role.Keyword === 'student') {
          throw { statusCode: 409, error: 'STUDENT_ROLE' };
        }

        const token = await Request.getUsedToken(request);
        const authenticatedUser = token.User;

        if (requestedUser.Id === authenticatedUser.Id) {
          throw { statusCode: 403, error: 'SELF_ROLE' };
        }

        requestedUser.Role = await Role.fromKeyword(roleKeyword);
      }

      return requestedUser.update();
    },
  });
}
