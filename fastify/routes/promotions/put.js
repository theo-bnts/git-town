import Diploma from '../../entities/Diploma.js';
import Middleware from '../../entities/tools/Middleware.js';
import Promotion from '../../entities/Promotion.js';
import PromotionLevel from '../../entities/PromotionLevel.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/promotions',
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
      await Middleware.assertSufficientUserRole(request, 'teacher');
    },
    handler: async (request) => {
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

      if (await Promotion.isDiplomaPromotionLevelAndYearInserted(diploma, promotionLevel, year)) {
        throw { statusCode: 409, error: 'ALREADY_EXISTS' };
      }

      const promotion = new Promotion(
        null,
        null,
        null,
        diploma,
        promotionLevel,
        year,
      );

      await promotion.insert();

      return promotion;
    },
  });
}
