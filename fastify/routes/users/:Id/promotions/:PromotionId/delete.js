import AuthorizationMiddleware from '../../../../../entities/tools/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../../entities/tools/ParametersMiddleware.js';
import Promotion from '../../../../../entities/Promotion.js';
import User from '../../../../../entities/User.js';
import UserPromotion from '../../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
    url: '/users/:UserId/promotions/:PromotionId',
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
          UserId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
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
      await ParametersMiddleware.assertUserIdInserted(request);
      await ParametersMiddleware.assertPromotionIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId, PromotionId: promotionId } = request.params;

      const user = await User.fromId(userId);
      const promotion = await Promotion.fromId(promotionId);

      if (!await UserPromotion.isUserAndPromotionInserted(user, promotion)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_PROMOTION' };
      }

      if (user.Role.Keyword !== 'student') {
        throw { statusCode: 409, error: 'NOT_STUDENT_ROLE' };
      }

      const userPromotion = await UserPromotion.fromUserAndPromotion(user, promotion);

      await userPromotion.delete();
    },
  });
}
