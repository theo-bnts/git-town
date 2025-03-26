import AuthorizationMiddleware from '../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../entities/tools/ParametersMiddleware.js';
import Promotion from '../../../entities/Promotion.js';
import Repository from '../../../entities/Repository.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/promotions/:PromotionId',
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
          PromotionId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertPromotionIdExists(request);
    },
    handler: async (request) => {
      const { PromotionId: promotionId } = request.params;

      const promotion = await Promotion.fromId(promotionId);

      // TODO: Test
      if (await Repository.isPromotionInserted(promotion)) {
        throw { statusCode: 409, error: 'HAS_REPOSITORIES' };
      }

      await promotion.delete();
    },
  });
}
