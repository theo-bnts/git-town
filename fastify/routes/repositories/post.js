import AuthorizationMiddleware from '../../entities/tools/AuthorizationMiddleware.js';
import DatabasePool from '../../entities/tools/DatabasePool.js';
import GitHubApp from '../../entities/tools/GitHubApp.js';
import Milestone from '../../entities/Milestone.js';
import Promotion from '../../entities/Promotion.js';
import Repository from '../../entities/Repository.js';
import Template from '../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/repositories',
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
          Template: {
            type: 'object',
            properties: {
              Id: {
                type: 'string',
                pattern: process.env.UUID_PATTERN,
              },
            },
            required: ['Id'],
          },
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
        required: ['Template', 'Promotion'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const { Template: { Id: templateId }, Promotion: { Id: promotionId } } = request.body;

      if (!await Template.isIdInserted(templateId)) {
        throw { statusCode: 404, error: 'UNKNOWN_TEMPLATE_ID' };
      }

      if (!await Promotion.isIdInserted(promotionId)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
      }

      const template = await Template.fromId(templateId);
      const promotion = await Promotion.fromId(promotionId);

      if (template.Year !== promotion.Year) {
        throw { statusCode: 409, error: 'YEAR_MISMATCH' };
      }

      const connection = await DatabasePool.Instance.createConnection();

      await DatabasePool.begin(connection);

      const repository = new Repository(
        null,
        null,
        null,
        null,
        template,
        promotion,
        null,
        null,
        null,
      );

      await repository.insert(connection);

      await GitHubApp.Instance.addOrganizationRepository(repository.Id);

      const milestones = await Milestone.fromTemplate(template);

      await Promise.all(
        milestones.map(async (milestone) => (
          GitHubApp.Instance.addOrganizationRepositoryMilestone(
            repository.Id,
            milestone.Title,
            milestone.Date,
          )
        )),
      );

      await DatabasePool.commit(connection);
      await DatabasePool.release(connection);

      return repository;
    },
  });
}
