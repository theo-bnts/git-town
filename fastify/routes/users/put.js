import User from '../../entities/User.js';
import Role from '../../entities/Role.js';

// TODO: Replace role_keyword with role.keyword
// TODO: Add schema validation for full_name and role_keyword
// TODO: Add value validation for role_keyword
// TODO: Check that user role is administrator

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users',
    schema: {
      body: {
        type: 'object',
        properties: {
          email_address: {
            type: 'string',
            maxLength: Number(process.env.USER_EMAIL_ADDRESS_MAX_LENGTH),
            format: 'email',
          },
        },
        required: ['email_address'],
      },
    },
    handler: async function handler(request) {
      const {
        email_address: emailAddress,
        full_name: fullName,
        role_keyword: roleKeyword,
      } = request.body;

      if (await User.isEmailAddressInserted(emailAddress)) {
        throw { statusCode: 409, code: 'EMAIL_ADDRESS_ALREADY_EXISTS' };
      }

      const role = Role.fromKeyword(roleKeyword);

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
