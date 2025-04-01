import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';
import Request from '../../../entities/tools/Request.js';
import User from '../../../entities/User.js';
import Role from '../../../entities/Role.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
    url: '/users/:UserId',
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
      params: {
        type: 'object',
        properties: {
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
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
        minProperties: 1,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const { EmailAddress: emailAddress, FullName: fullName, Role: role } = request.body;

      const requestedUser = await User.fromId(userId);

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

      await requestedUser.update();

      return requestedUser;
    },
  });
}
