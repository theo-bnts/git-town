import Middleware from '../../../../entities/tools/Middleware.js';

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
      },
    },
    /*
    preHandler: async (request) => {
      await Middleware.assertGitHubWebhookAuthentication(request);
    },
    */
    handler: async (request) => {
      // eslint-disable-next-line no-console
      console.log(request.body);
      await Middleware.assertGitHubWebhookAuthentication(request);
    },
  });
}
