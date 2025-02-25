import Middleware from '../../../../entities/tools/Middleware.js';
import Promotion from '../../../../entities/Promotion.js';
import User from '../../../../entities/User.js';
import UserPromotion from '../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/users/:Id/promotions',
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
          Id: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
        additionalProperties: false,
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
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
      await Middleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { Id: userId } = request.params;
      const { Id: promotionId } = request.body;

      if (!await Promotion.isIdInserted(promotionId)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
      }

      const user = await User.fromId(userId);
      const promotion = await Promotion.fromId(request.body.Id);

      if (await UserPromotion.isUserAndPromotionInserted(user, promotion)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      const userPromotion = new UserPromotion(user, promotion);

      await userPromotion.insert();

      return userPromotion;
    },
  });
}
