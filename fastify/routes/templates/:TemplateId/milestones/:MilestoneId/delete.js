import { DateTime } from 'luxon';

import AuthorizationMiddleware from '../../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../../entities/tools/GitHub/GitHubApp.js';
import Milestone from '../../../../../entities/Milestone.js';
import ParametersMiddleware from '../../../../../entities/tools/Middleware/ParametersMiddleware.js';
import Repository from '../../../../../entities/Repository.js';
import Template from '../../../../../entities/Template.js';

export default async function route(app) {
  app.route({
    method: 'DELETE',
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

      const template = await Template.fromId(templateId);
      const milestone = await Milestone.fromId(milestoneId);

      const repositories = await Repository.fromTemplate(template);

      await Promise.all(
        repositories.map(async (repository) => {
          const gitHubMilestones = await GitHubApp.EnvironmentInstance.Milestones.get(
            repository.Id,
          );

          const concernedGitHubMilestone = gitHubMilestones.find((gitHubMilestone) => (
            gitHubMilestone.Title === milestone.Title
            && DateTime
              .fromJSDate(gitHubMilestone.Date)
              .hasSame(DateTime.fromJSDate(milestone.Date), 'day')
          ));

          if (concernedGitHubMilestone !== undefined) {
            return GitHubApp.EnvironmentInstance.Milestones.remove(
              repository.Id,
              concernedGitHubMilestone.Number,
            );
          }

          return Promise.resolve();
        }),
      );

      await milestone.delete();
    },
  });
}
