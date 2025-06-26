import { DateTime } from 'luxon';

import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';
import Milestone from '../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../entities/Repository.js';
import Template from '../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PUT',
    url: '/templates/:TemplateId/milestones',
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
          TemplateId: {
            type: 'string',
            pattern: process.env.UUID_PATTERN,
          },
        },
      },
      body: {
        type: 'object',
        properties: {
          Title: {
            type: 'string',
            maxLength: Number(process.env.MILESTONE_TITLE_MAX_LENGTH),
            pattern: process.env.GENERIC_PATTERN,
          },
          Date: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['Title', 'Date'],
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId } = request.params;
      const { Title: title, Date: dateString } = request.body;

      const date = DateTime.fromISO(dateString).toJSDate();

      const minimumDate = DateTime.fromISO(process.env.MILESTONE_DATE_MIN).toJSDate();
      const maximumDate = DateTime.fromISO(process.env.MILESTONE_DATE_MAX).toJSDate();

      if (date < minimumDate || date > maximumDate) {
        throw { statusCode: 409, error: 'DATE_OUT_OF_RANGE' };
      }

      const template = await Template.fromId(templateId);

      if (await Milestone.isTemplateAndTitleInserted(template, title)) {
        throw { statusCode: 409, error: 'DUPLICATE_TITLE' };
      }

      if (await Milestone.isTemplateAndDateInserted(template, date)) {
        throw { statusCode: 409, error: 'DUPLICATE_DATE' };
      }

      const milestone = new Milestone(
        null,
        null,
        null,
        template,
        title,
        date,
      );

      const repositories = await Repository.fromTemplate(template);

      const nonArchivedRepositories = repositories.filter((repository) => (
        repository.ArchivedAt === null
      ));

      await Promise.all(
        nonArchivedRepositories.map(async (repository) => {
          const gitHubMilestones = await GitHubApp.EnvironmentInstance.Milestones.get(
            repository.Id,
          );

          const concernedGitHubMilestone = gitHubMilestones.find((gitHubMilestone) => (
            gitHubMilestone.Title === milestone.Title
          ));

          if (concernedGitHubMilestone === undefined) {
            return GitHubApp.EnvironmentInstance.Milestones.add(
              repository.Id,
              milestone.Title,
              milestone.Date,
            );
          }

          return Promise.resolve();
        }),
      );

      await milestone.insert();

      return milestone;
    },
  });
}
