import AuthorizationMiddleware from '../../entities/tools/Middleware/AuthorizationMiddleware.js';
import EnseignementUnit from '../../entities/EnseignementUnit.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/enseignement-units',
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
          Initialism: {
            type: 'string',
            pattern: process.env.ENSEIGNEMENT_UNIT_INITIALISM_PATTERN,
          },
          Name: {
            type: 'string',
            maxLength: Number(process.env.ENSEIGNEMENT_UNIT_NAME_MAX_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
        },
        required: ['Initialism', 'Name'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const { Initialism: initialism, Name: name } = request.body;

      if (await EnseignementUnit.isInitialismInserted(initialism)) {
        throw { statusCode: 409, error: 'DUPLICATE_INITIALISM' };
      }

      const enseignementUnit = new EnseignementUnit(null, null, null, initialism, name);

      await enseignementUnit.insert();

      return enseignementUnit;
    },
  });
}
