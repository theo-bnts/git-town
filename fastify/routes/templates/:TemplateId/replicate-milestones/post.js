import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import Milestone from '../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Template from '../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/templates/:TemplateId/replicate-milestones',
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
      body: {
        type: 'object',
        properties: {
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        required: ['Id'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
    },
    handler: async (request) => {
      const { TemplateId: sourceTemplateId } = request.params;
      const { Id: targetTemplateId } = request.body;

      if (!await Template.isIdInserted(targetTemplateId)) {
        throw { statusCode: 404, error: 'UNKNOWN_TARGET_TEMPLATE_ID' };
      }

      if (targetTemplateId === sourceTemplateId) {
        throw { statusCode: 409, error: 'SAME_TEMPLATE_ID' };
      }

      const sourceTemplate = await Template.fromId(sourceTemplateId);

      if (!await Milestone.isTemplateInserted(sourceTemplate)) {
        throw { statusCode: 409, error: 'HAS_NO_MILESTONES' };
      }

      const targetTemplate = await Template.fromId(targetTemplateId);

      if (await Milestone.isTemplateInserted(targetTemplate)) {
        throw { statusCode: 409, error: 'TARGET_HAS_MILESTONES' };
      }

      await Milestone.replicate(sourceTemplate, targetTemplate);
    },
  });
}
