import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import Milestone from '../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../entities/tools/ParametersMiddleware.js';
import Template from '../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
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
      body: {
        type: 'object',
        properties: {
          Title: {
            type: 'string',
            maxLength: Number(process.env.MILESTONE_TITLE_MAX_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
          Date: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['Title', 'Date'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;
      const { Title: title, Date: dateString } = request.body;

      const template = await Template.fromId(templateId);

      const date = new Date(dateString);

      if (await Milestone.isTemplateTitleAndDateInserted(template, title, date)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      const milestone = new Milestone(
        null,
        null,
        null,
        template,
        title,
        date,
      );

      await milestone.insert();

      return milestone;
    },
  });
}
