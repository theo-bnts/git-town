import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Promotion from '../../../../entities/Promotion.js';
import User from '../../../../entities/User.js';
import UserPromotion from '../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users/:UserId/promotions',
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
        },
      },
      body: {
        type: 'object',
        properties: {
          Promotion: {
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
        required: ['Promotion'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertUserIdInserted(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const { Promotion: { Id: promotionId } } = request.body;

      if (!await Promotion.isIdInserted(promotionId)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
      }

      const user = await User.fromId(userId);

      if (user.Role.Keyword !== 'student') {
        throw { statusCode: 409, error: 'NOT_STUDENT_ROLE' };
      }

      const promotion = await Promotion.fromId(promotionId);

      if (await UserPromotion.isUserAndPromotionInserted(user, promotion)) {
        throw { statusCode: 409, error: 'DUPLICATE' };
      }

      const userPromotion = new UserPromotion(
        null,
        null,
        null,
        user,
        promotion,
      );

      await userPromotion.insert();

      return promotion;
    },
  });
}
