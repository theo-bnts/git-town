import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../entities/EnseignementUnit.js';
import Template from '../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/templates',
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
        required: ['EnseignementUnit', 'Year'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const { EnseignementUnit: { Id: enseignementUnitId }, Year: year } = request.body;

      if (!await EnseignementUnit.isIdInserted(enseignementUnitId)) {
        throw { statusCode: 404, error: 'UNKNOWN_ENSEIGNEMENT_UNIT_ID' };
      }

      const enseignementUnit = await EnseignementUnit.fromId(enseignementUnitId);

      if (await Template.isEnseignementUnitAndYearInserted(enseignementUnit, year)) {
        throw { statusCode: 409, error: 'DUPLICATE' };
      }

      const template = new Template(
        null,
        null,
        null,
        enseignementUnit,
        year,
      );

      await template.insert();

      return template;
    },
  });
}
