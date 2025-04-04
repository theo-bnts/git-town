import moment from 'moment';

import AuthorizationMiddleware from '../../../../../entities/tools/AuthorizationMiddleware.js';
import GitHubApp from '../../../../../entities/tools/GitHubApp.js';
import Milestone from '../../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../../entities/tools/ParametersMiddleware.js';
import Repository from '../../../../../entities/Repository.js';
import Template from '../../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'PATCH',
    url: '/templates/:TemplateId/milestones/:MilestoneId',
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
          MilestoneId: {
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
        minProperties: 1,
      },
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertAuthentication(request);
      await AuthorizationMiddleware.assertSufficientUserRole(request, 'administrator');
      await ParametersMiddleware.assertTemplateIdInserted(request);
      await ParametersMiddleware.assertMilestoneIdInserted(request);
      await ParametersMiddleware.assertTemplateIdAndMilestoneIdMatch(request);
    },
    handler: async (request) => {
      const { TemplateId: templateId, MilestoneId: milestoneId } = request.params;
      const { Title: title, Date: dateString } = request.body;

      const template = await Template.fromId(templateId);
      const milestone = await Milestone.fromId(milestoneId);

      const oldTitle = milestone.Title;
      const oldDate = milestone.Date;

      if (title) {
        if (title === milestone.Title) {
          throw { statusCode: 409, error: 'SAME_TITLE' };
        }

        if (await Milestone.isTemplateAndTitleInserted(template, title)) {
          throw { statusCode: 409, error: 'DUPLICATE_TITLE' };
        }

        milestone.Title = title;
      }

      if (dateString) {
        const date = moment(dateString).toDate();

        if (date.getTime() === milestone.Date.getTime()) {
          throw { statusCode: 409, error: 'SAME_DATE' };
        }

        if (await Milestone.isTemplateAndDateInserted(template, date)) {
          throw { statusCode: 409, error: 'DUPLICATE_DATE' };
        }

        milestone.Date = date;
      }

      const repositories = await Repository.fromTemplate(template);

      await Promise.all(
        repositories.map(async (repository) => {
          const gitHubMilestones = await GitHubApp.Instance.getOrganizationRepositoryMilestones(
            repository.Id,
          );

          const concernedGitHubMilestone = gitHubMilestones.find((gitHubMilestone) => (
            gitHubMilestone.Title === oldTitle
            && moment(gitHubMilestone.Date).format('YYYY-MM-DD')
              === moment(oldDate).format('YYYY-MM-DD')
          ));

          return GitHubApp.Instance.updateOrganizationRepositoryMilestone(
            repository.Id,
            concernedGitHubMilestone.Number,
            milestone.Title,
            milestone.Date,
          );
        }),
      );

      await milestone.update();
    },
  });
}
