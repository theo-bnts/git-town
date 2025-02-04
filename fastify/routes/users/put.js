import User from '../../entities/User.js';
import Role from '../../entities/Role.js';

// TODO: Dans les autres routes, reformater le schéma avec les majuscules
// TODO: Add default value validation
// TODO: Check that user role is administrator

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users',
    schema: {
      body: {
        type: 'object',
        properties: {
          EmailAddress: {
            type: 'string',
            maxLength: Number(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH),
            format: 'email',
            pattern: process.env.USER_EMAIL_ADDRESS_PATTERN,
          },
          FullName: {
            type: 'string',
            maxLength: Number(process.env.USER_FULL_NAME_MAX_LENGTH),
          },
          Role: {
            type: 'object',
            properties: {
              Keyword: {
                type: 'string',
                maxLength: Number(process.env.ROLE_KEYWORD_MAX_LENGTH),
                pattern: process.env.ROLE_KEYWORD_PATTERN,
              },
            },
            required: ['Keyword'],
          },
        },
        required: ['EmailAddress', 'FullName', 'Role'],
      },
    },
    handler: async function handler(request) {
      const { EmailAddress: emailAddress, FullName: fullName } = request.body;
      const { Keyword: roleKeyword } = request.body.Role;

      if (await User.isEmailAddressInserted(emailAddress)) {
        throw { statusCode: 409, code: 'EMAIL_ADDRESS_ALREADY_EXISTS' };
      }

      if (!(await Role.isKeywordInserted(roleKeyword))) {
        throw { statusCode: 404, code: 'ROLE_NOT_FOUND' };
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
