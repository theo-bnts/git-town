import DataQualityMiddleware from '../../../../entities/tools/DataQualityMiddleware.js';
import Milestone from '../../../../entities/Milestone.js';
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
          additionalProperties: false,
        },
      },
    },
    preHandler: async (request) => {
      await DataQualityMiddleware.assertAuthentication(request);
      await DataQualityMiddleware.assertSufficientUserRole(request, 'teacher');
      await DataQualityMiddleware.assertMilestoneIdExists(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;

      const template = await Template.fromId(templateId);

      return Milestone.fromTemplate(template);
    },
  });
}
