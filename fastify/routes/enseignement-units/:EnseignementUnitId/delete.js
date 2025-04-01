import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import EnseignementUnit from '../../../entities/EnseignementUnit.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';
import Template from '../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
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
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertEnseignementUnitIdInserted(request);
    },
    handler: async (request) => {
      const { EnseignementUnitId: enseignementUnitId } = request.params;

      const enseignementUnit = await EnseignementUnit.fromId(enseignementUnitId);

      if (await Template.isEnseignementUnitInserted(enseignementUnit)) {
        throw { statusCode: 409, error: 'HAS_TEMPLATES' };
      }

      await enseignementUnit.delete();
    },
  });
}
