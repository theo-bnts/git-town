import Diploma from '../../../../entities/Diploma.js';
import Middleware from '../../../../entities/tools/Middleware.js';
import Promotion from '../../../../entities/Promotion.js';
import PromotionLevel from '../../../../entities/PromotionLevel.js';
import User from '../../../../entities/User.js';
import UserPromotion from '../../../../entities/UserPromotion.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
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
    preHandler: async (request) => {
      await Middleware.assertAuthentication(request);
      await Middleware.assertSufficientUserRole(request, 'administrator');
      await Middleware.assertUserIdExists(request);
    },
    handler: async (request) => {
      const { Id: userId } = request.params;
      const {
        Diploma: { Initialism: diplomaInitialism },
        PromotionLevel: { Initialism: promotionLevelInitialism },
        Year: year,
      } = request.body;

      if (!await Diploma.isInitialismInserted(diplomaInitialism)) {
        throw { statusCode: 404, error: 'UNKNOWN_DIPLOMA_INITIALISM' };
      }

      if (!await PromotionLevel.isInitialismInserted(promotionLevelInitialism)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_LEVEL_INITIALISM' };
      }

      const diploma = await Diploma.fromInitialism(diplomaInitialism);
      const promotionLevel = await PromotionLevel.fromInitialism(promotionLevelInitialism);

      if (!await Promotion.isDiplomaPromotionLevelAndYearInserted(diploma, promotionLevel, year)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION' };
      }

      const user = await User.fromId(userId);
      const promotion = await Promotion.fromDiplomaPromotionLevelAndYear(
        diploma,
        promotionLevel,
        year,
      );

      if (user.Role.Keyword !== 'student') {
        throw { statusCode: 409, error: 'NOT_STUDENT_ROLE' };
      }

      if (!await UserPromotion.isUserAndPromotionInserted(user, promotion)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_PROMOTION' };
      }

      const userPromotion = await UserPromotion.fromUserAndPromotion(user, promotion);

      await userPromotion.delete();
    },
  });
}
