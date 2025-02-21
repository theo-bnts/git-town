import Middleware from '../../../../entities/tools/Middleware.js';
import User from '../../../../entities/User.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/webhooks/github/organizations',
    schema: {
      headers: {
        type: 'object',
        properties: {
          'x-hub-signature-256': {
            type: 'string',
            pattern: process.env.GITHUB_WEBHOOKS_SIGNATURE_PATTERN,
          },
        },
        required: ['x-hub-signature-256'],
      },
      body: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['member_added', 'member_removed'],
          },
          membership: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    minimum: Number(process.env.USER_GITHUB_ID_MIN),
                  },
                },
                required: ['id'],
              },
            },
            required: ['user'],
          },
          organization: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                const: Number(process.env.GITHUB_ORGANIZATION_ID),
              },
            },
            required: ['id'],
          },
        },
        required: ['action', 'membership', 'organization'],
      },
    },
    config: {
      rawBody: true,
    },
    preHandler: async (request) => {
      await Middleware.assertGitHubWebhookAuthentication(request);
    },
    handler: async (request) => {
      const { action, membership: { user: { id: gitHubUserId } } } = request.body;

      if (!await User.isGitHubIdInserted(BigInt(gitHubUserId))) {
        throw { statusCode: 404, error: 'UNKNOWN_GITHUB_USER_ID' };
      }

      const user = await User.fromGitHubId(BigInt(gitHubUserId));

      user.GitHubOrganizationMember = action === 'member_added';

      await user.update();

      return user;
    },
  });
}
