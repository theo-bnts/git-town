import AuthorizationMiddleware from '../../entities/tools/Middleware/AuthorizationMiddleware.js';
import DatabasePool from '../../entities/tools/DatabasePool.js';
import GitHubApp from '../../entities/tools/GitHub/GitHubApp.js';
import Milestone from '../../entities/Milestone.js';
import Promotion from '../../entities/Promotion.js';
import Repository from '../../entities/Repository.js';
import Template from '../../entities/Template.js';
import User from '../../entities/User.js';

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
          User: {
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
        required: ['Template', 'Promotion', 'User'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
    },
    handler: async (request) => {
      const {
        Template: { Id: templateId },
        Promotion: { Id: promotionId },
        User: { Id: userId }
      } = request.body;

      if (!await Template.isIdInserted(templateId)) {
        throw { statusCode: 404, error: 'UNKNOWN_TEMPLATE_ID' };
      }

      if (!await Promotion.isIdInserted(promotionId)) {
        throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
      }

      if (!await User.isIdInserted(userId)) {
        throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
      }

      const template = await Template.fromId(templateId);
      const promotion = await Promotion.fromId(promotionId);

      if (template.Year !== promotion.Year) {
        throw { statusCode: 409, error: 'YEAR_MISMATCH' };
      }

      const user = await User.fromId(userId);

      const connection = await DatabasePool.EnvironmentInstance.createConnection();

      await DatabasePool.begin(connection);

      const repository = new Repository(
        null,
        null,
        null,
        null,
        template,
        promotion,
        user,
        null,
      );

      await repository.insert(connection);

      await GitHubApp.EnvironmentInstance.Repositories.add(repository.Id);

      const milestones = await Milestone.fromTemplate(template);

      await Promise.all(
        milestones.map(async (milestone) => (
          GitHubApp.EnvironmentInstance.Milestones.add(
            repository.Id,
            milestone.Title,
            milestone.Date,
          )
        )),
      );

      await GitHubApp.EnvironmentInstance.EducationalTeam.addRepository(repository.Id);

      await DatabasePool.commit(connection);
      await DatabasePool.release(connection);

      return repository;
    },
  });
}
