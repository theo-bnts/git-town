import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../../entities/EnseignementUnit.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
    url: '/enseignement-units/:EnseignementUnitId',
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
          EnseignementUnitId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
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
        minProperties: 1,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertEnseignementUnitIdExists(request);
    },
    handler: async (request) => {
      const { EnseignementUnitId: enseignementUnitId } = request.params;
      const { Initialism: initialism, Name: name } = request.body;

      const enseignementUnit = await EnseignementUnit.fromId(enseignementUnitId);

      if (initialism !== undefined) {
        if (initialism === enseignementUnit.Initialism) {
          throw { statusCode: 409, error: 'SAME_INITIALISM' };
        }

        if (await EnseignementUnit.isInitialismInserted(initialism)) {
          throw { statusCode: 409, error: 'DUPLICATE_INITIALISM' };
        }

        enseignementUnit.Initialism = initialism;
      }

      if (name !== undefined) {
        if (name === enseignementUnit.Name) {
          throw { statusCode: 409, error: 'SAME_NAME' };
        }

        enseignementUnit.Name = name;
      }

      await enseignementUnit.update();

      return enseignementUnit;
    },
  });
}
