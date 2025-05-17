import AuthorizationMiddleware from '../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../entities/tools/GitHub/GitHubApp.js';
import Milestone from '../../../entities/Milestone.js';
import ParametersMiddleware from '../../../entities/tools/Middleware/ParametersMiddleware.js';
import Promotion from '../../../entities/Promotion.js';
import Repository from '../../../entities/Repository.js';
import Template from '../../../entities/Template.js';
import User from '../../../entities/User.js';
import UserRepository from '../../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
    url: '/repositories/:RepositoryId',
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
          RepositoryId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
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
        minProperties: 1,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertRepositoryIdInserted(request);
    },
    handler: async (request) => {
      const { RepositoryId: repositoryId } = request.params;
      const { Template: template, Promotion: promotion, User: user } = request.body;

      const repository = await Repository.fromId(repositoryId);

      if (repository.ArchivedAt !== null) {
        throw { statusCode: 423, error: 'ARCHIVED' };
      }

      if (await UserRepository.isRepositoryInserted(repository)) {
        throw { statusCode: 409, error: 'HAS_USERS' };
      }

      if (template !== undefined) {
        const { Id: templateId } = template;

        if (!await Template.isIdInserted(templateId)) {
          throw { statusCode: 404, error: 'UNKNOWN_TEMPLATE_ID' };
        }

        if (templateId === repository.Template.Id) {
          throw { statusCode: 409, error: 'SAME_TEMPLATE_ID' };
        }

        const oldMilestones = await GitHubApp.EnvironmentInstance.Milestones.get(repository.Id);

        await Promise.all(
          oldMilestones.map(async (milestone) => (
            GitHubApp.EnvironmentInstance.Milestones.remove(
              repository.Id,
              milestone.Number,
            )
          )),
        );

        const newMilestones = await Milestone.fromTemplate(template);

        await Promise.all(
          newMilestones.map(async (milestone) => (
            GitHubApp.EnvironmentInstance.Milestones.add(
              repository.Id,
              milestone.Title,
              milestone.Date,
            )
          )),
        );

        repository.Template = await Template.fromId(templateId);
      }

      if (promotion !== undefined) {
        const { Id: promotionId } = promotion;

        if (!await Promotion.isIdInserted(promotionId)) {
          throw { statusCode: 404, error: 'UNKNOWN_PROMOTION_ID' };
        }

        if (promotionId === repository.Promotion.Id) {
          throw { statusCode: 409, error: 'SAME_PROMOTION_ID' };
        }

        repository.Promotion = await Promotion.fromId(promotionId);
      }

      if (repository.Template.Year !== repository.Promotion.Year) {
        throw { statusCode: 409, error: 'YEAR_MISMATCH' };
      }

      if (user !== undefined) {
        const { Id: userId } = user;

        if (!await User.isIdInserted(userId)) {
          throw { statusCode: 404, error: 'UNKNOWN_USER_ID' };
        }

        if (userId === repository.User.Id) {
          throw { statusCode: 409, error: 'SAME_USER_ID' };
        }

        repository.User = await User.fromId(userId);
      }

      await repository.update();
    },
  });
}
