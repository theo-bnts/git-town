import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../entities/EnseignementUnit.js';
import Template from '../../entities/Template.js';

export default async function route(app) {
  // TODO: Replace Initialism with Id
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
              Initialism: {
                type: 'string',
                pattern: process.env.ENSEIGNEMENT_UNIT_INITIALISM_PATTERN,
              },
            },
            required: ['Initialism'],
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
      const {
        EnseignementUnit: { Initialism: enseignementUnitInitialism },
        Year: year,
      } = request.body;

      if (!await EnseignementUnit.isInitialismInserted(enseignementUnitInitialism)) {
        throw { statusCode: 404, error: 'UNKNOWN_ENSEIGNEMENT_UNIT_INITIALISM' };
      }

      const enseignementUnit = await EnseignementUnit.fromInitialism(enseignementUnitInitialism);

      if (await Template.isEnseignementUnitAndYearInserted(enseignementUnit, year)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
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
