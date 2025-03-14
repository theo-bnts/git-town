import Diploma from '../../../entities/Diploma.js';
import DataQualityMiddleware from '../../../entities/tools/DataQualityMiddleware.js';
import Promotion from '../../../entities/Promotion.js';
import PromotionLevel from '../../../entities/PromotionLevel.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
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
        minProperties: 1,
        additionalProperties: false,
      },
    },
    preHandler: async (request) => {
      await DataQualityMiddleware.assertAuthentication(request);
      await DataQualityMiddleware.assertSufficientUserRole(request, 'administrator');
      await DataQualityMiddleware.assertPromotionIdExists(request);
    },
    handler: async (request) => {
      const { PromotionId: promotionId } = request.params;
      const { Diploma: diploma, PromotionLevel: promotionLevel, Year: year } = request.body;

      const promotion = await Promotion.fromId(promotionId);

      if (diploma !== undefined) {
        const { Initialism: diplomaInitialism } = diploma;

        if (!await Diploma.isInitialismInserted(diplomaInitialism)) {
          throw { statusCode: 404, error: 'UNKNOWN_DIPLOMA_INITIALISM' };
        }

        if (diplomaInitialism === promotion.Diploma.Initialism) {
          throw { statusCode: 409, error: 'SAME_DIPLOMA_INITIALISM' };
        }

        promotion.Diploma = await Diploma.fromInitialism(diplomaInitialism);
      }

      if (promotionLevel !== undefined) {
        const { Initialism: promotionLevelInitialism } = promotionLevel;

        if (!await PromotionLevel.isInitialismInserted(promotionLevelInitialism)) {
          throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_LEVEL_INITIALISM' };
        }

        if (promotionLevelInitialism === promotion.PromotionLevel.Initialism) {
          throw { statusCode: 409, error: 'SAME_PROMOTION_LEVEL_INITIALISM' };
        }

        promotion.PromotionLevel = await PromotionLevel
          .fromInitialism(promotionLevelInitialism);
      }

      if (year !== undefined) {
        if (year === promotion.Year) {
          throw { statusCode: 409, error: 'SAME_YEAR' };
        }

        promotion.Year = year;
      }

      if (await Promotion.isDiplomaPromotionLevelAndYearInserted(diploma, promotionLevel, year)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      await promotion.update();

      return promotion;
    },
  });
}
