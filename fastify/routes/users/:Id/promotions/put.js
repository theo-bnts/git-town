import AuthorizationMiddleware from '../../../../entities/tools/AuthorizationMiddleware.js';
import DataQualityMiddleware from '../../../../entities/tools/DataQualityMiddleware.js';
import Diploma from '../../../../entities/Diploma.js';
import Promotion from '../../../../entities/Promotion.js';
import PromotionLevel from '../../../../entities/PromotionLevel.js';
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
        additionalProperties: false,
      },
      body: {
        type: 'object',
        properties: {
          Promotion: {
            type: 'object',
            properties: {
              Diploma: {
                type: 'object',
                properties: {
                  Initialism: {
                    type: 'string',
                    pattern: process.env.DIPLOMA_INITIALISM_PATTERN,
                  },
                },
                required: ['Initialism'],
                additionalProperties: false,
              },
              PromotionLevel: {
                type: 'object',
                properties: {
                  Initialism: {
                    type: 'string',
                    pattern: process.env.PROMOTION_LEVEL_INITIALISM_PATTERN,
                  },
                },
                required: ['Initialism'],
                additionalProperties: false,
              },
              Year: {
                type: 'integer',
                minimum: Number(process.env.PROMOTION_YEAR_MIN),
                maximum: Number(process.env.PROMOTION_YEAR_MAX),
              },
            },
            required: ['Diploma', 'PromotionLevel', 'Year'],
            additionalProperties: false,
          },
        },
        required: ['Promotion'],
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await DataQualityMiddleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { UserId: userId } = request.params;
      const {
        Promotion: {
          Diploma: { Initialism: promotionDiplomaInitialism },
          PromotionLevel: { Initialism: promotionLevelInitialism },
          Year: promotionYear,
        },
      } = request.body;

      if (!await Diploma.isInitialismInserted(promotionDiplomaInitialism)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_DIPLOMA_INITIALISM' };
      }

      if (!await PromotionLevel.isInitialismInserted(promotionLevelInitialism)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_LEVEL_INITIALISM' };
      }

      const diploma = await Diploma.fromInitialism(promotionDiplomaInitialism);
      const promotionLevel = await PromotionLevel.fromInitialism(promotionLevelInitialism);

      if (
        !await Promotion.isDiplomaPromotionLevelAndYearInserted(
          diploma,
          promotionLevel,
          promotionYear,
        )
      ) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION' };
      }

      const user = await User.fromId(userId);

      if (user.Role.Keyword !== 'student') {
        throw { statusCode: 409, error: 'NOT_STUDENT_ROLE' };
      }

      const promotion = await Promotion.fromDiplomaPromotionLevelAndYear(
        diploma,
        promotionLevel,
        promotionYear,
      );

      if (await UserPromotion.isUserAndPromotionInserted(user, promotion)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
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
