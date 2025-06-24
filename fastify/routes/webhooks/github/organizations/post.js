import AuthorizationMiddleware from '../../../../entities/tools/Middleware/AuthorizationMiddleware.js';
import GitHubApp from '../../../../entities/tools/GitHub/GitHubApp.js';
import User from '../../../../entities/User.js';
import UserRepository from '../../../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'POST',
    url: '/webhooks/github/organizations',
    schema: {
      headers: {
        type: 'object',
        properties: {
          'x-hub-signature-256': {
            type: 'string',
            pattern: process.env.GITHUB_WEBHOOKS_SIGNATURE_PATTERN,
          },
        },
        required: ['x-hub-signature-256'],
      },
      body: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['member_added', 'member_removed'],
          },
          membership: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    minimum: Number(process.env.USER_GITHUB_ID_MIN),
                  },
                },
                required: ['id'],
              },
            },
            required: ['user'],
          },
          organization: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                const: Number(process.env.GITHUB_ORGANIZATION_ID),
              },
            },
            required: ['id'],
          },
        },
        required: ['action', 'membership', 'organization'],
      },
    },
    config: {
      rawBody: true,
    },
    preHandler: async (request) => {
      await AuthorizationMiddleware.assertGitHubWebhookAuthentication(request);
    },
    handler: async (request) => {
      const { action, membership: { user: { id: gitHubUserId } } } = request.body;

      if (!await User.isGitHubIdInserted(BigInt(gitHubUserId))) {
        throw { statusCode: 404, error: 'UNKNOWN_GITHUB_USER_ID' };
      }

      const user = await User.fromGitHubId(BigInt(gitHubUserId));

      if (user.GitHubOrganizationMember !== (action === 'member_added')) {
        user.GitHubOrganizationMember = !user.GitHubOrganizationMember;

        await user.update();
      }

      const userRepositories = await UserRepository.fromUser(user);

      if (user.GitHubOrganizationMember) {
        if (user.Role.Keyword === 'student') {
          const nonArchivedUserRepositories = userRepositories.filter((userRepository) => (
            userRepository.Repository.ArchivedAt === null
          ));

          await Promise.all(
            nonArchivedUserRepositories.map(async (userRepository) => (
              GitHubApp.EnvironmentInstance.Repositories.addMember(
                userRepository.Repository.Id,
                user.GitHubId,
              )
            )),
          );
        } else {
          await GitHubApp.EnvironmentInstance.EducationalTeam.addMember(user.GitHubId);
        }
      } else if (user.Role.Keyword === 'student') {
        await Promise.all(
          userRepositories.map(async (userRepository) => (
            GitHubApp.EnvironmentInstance.Repositories.removeMember(
              userRepository.Repository.Id,
              user.GitHubId,
            )
          )),
        );
      }

      return user;
    },
  });
}
