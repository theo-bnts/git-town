import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Promotion from '../../../../entities/Promotion.js';
import UserPromotion from '../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/promotions/:PromotionId/replicate-users',
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
      body: {
        type: 'object',
        properties: {
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        required: ['Id'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertPromotionIdInserted(request);
    },
    handler: async (request) => {
      const { PromotionId: sourcePromotionId } = request.params;
      const { Id: targetPromotionId } = request.body;

      if (!await Promotion.isIdInserted(targetPromotionId)) {
        throw { statusCode: 404, error: 'UNKNOWN_TARGET_PROMOTION_ID' };
      }

      if (targetPromotionId === sourcePromotionId) {
        throw { statusCode: 409, error: 'SAME_PROMOTION_ID' };
      }

      const sourcePromotion = await Promotion.fromId(sourcePromotionId);

      if (!await UserPromotion.isPromotionInserted(sourcePromotion)) {
        throw { statusCode: 409, error: 'HAS_NO_USERS' };
      }

      const targetPromotion = await Promotion.fromId(targetPromotionId);

      if (await UserPromotion.isPromotionInserted(targetPromotion)) {
        throw { statusCode: 409, error: 'TARGET_HAS_USERS' };
      }

      await UserPromotion.replicateUsers(sourcePromotion, targetPromotion);
    },
  });
}
