import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import Milestone from '../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import Template from '../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'GET',
    url: '/templates/:TemplateId/milestones',
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
          TemplateId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'teacher');
      await ParametersMiddleware.assertTemplateIdExists(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;

      const template = await Template.fromId(templateId);

      return Milestone.fromTemplate(template);
    },
  });
}
