import User from '../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/account',
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
      const { email_address: emailAddress } = request.body;

      if (await User.isEmailAddressInserted(emailAddress)) {
        throw { statusCode: 409, code: 'EMAIL_ADDRESS_ALREADY_EXISTS' };
      }

      const user = new User(
        null,
        emailAddress,
        null,
        null,
        null,
      );

      await user.insert();

      return { success: true };
    },
  });
}
