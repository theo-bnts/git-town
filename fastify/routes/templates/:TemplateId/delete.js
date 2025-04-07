import AuthorizationMiddleware from '../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../entities/Repository.js';
import Template from '../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/templates/:TemplateId',
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
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;

      const template = await Template.fromId(templateId);

      if (await Repository.isTemplateInserted(template)) {
        throw { statusCode: 409, error: 'HAS_REPOSITORIES' };
      }

      await template.delete();
    },
  });
}
