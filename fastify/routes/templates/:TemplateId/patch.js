import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../../entities/EnseignementUnit.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';
import Template from '../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
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
      body: {
        type: 'object',
        properties: {
          EnseignementUnit: {
            type: 'object',
            properties: {
              Id: {
                type: 'string',
                pattern: process.env.UUID_PATTERN,
              },
            },
            required: ['Id'],
          },
          Year: {
            type: 'integer',
            minimum: Number(process.env.TEMPLATE_YEAR_MIN),
            maximum: Number(process.env.TEMPLATE_YEAR_MAX),
          },
        },
        minProperties: 1,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;
      const { EnseignementUnit: enseignementUnit, Year: year } = request.body;

      const template = await Template.fromId(templateId);

      if (enseignementUnit !== undefined) {
        const { Id: enseignementUnitId } = enseignementUnit;

        if (!await EnseignementUnit.isIdInserted(enseignementUnitId)) {
          throw { statusCode: 404, error: 'UNKNOWN_ENSEIGNEMENT_UNIT_INITIALISM' };
        }

        console.log(enseignementUnitId, template.EnseignementUnit);
        if (enseignementUnitId === template.EnseignementUnit.Id) {
          throw { statusCode: 409, error: 'SAME_ENSEIGNEMENT_UNIT' };
        }

        template.EnseignementUnit = await EnseignementUnit.fromId(enseignementUnitId);
      }

      if (year !== undefined) {
        if (year === template.Year) {
          throw { statusCode: 409, error: 'SAME_YEAR' };
        }

        template.Year = year;
      }

      if (await Template.isEnseignementUnitAndYearInserted(enseignementUnit, year)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      // TODO: Make GitHub action to update template in GitHub

      await template.update();

      return template;
    },
  });
}
