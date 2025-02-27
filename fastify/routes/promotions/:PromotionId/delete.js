import Middleware from '../../../entities/tools/Middleware.js';
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
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
      await Middleware.assertPromotionIdExists(request);
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
