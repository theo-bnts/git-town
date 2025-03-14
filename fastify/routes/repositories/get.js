import DataQualityMiddleware from '../../entities/tools/DataQualityMiddleware.js';
import Repository from '../../entities/Repository.js';
import Request from '../../entities/tools/Request.js';
import UserRepository from '../../entities/UserRepository.js';

export default async function route(app) {
  app.route({
    method: 'GET',
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
    },
    preHandler: async (request) => {
      await DataQualityMiddleware.assertAuthentication(request);
    },
    handler: async (request) => {
      const { User: user } = await Request.getUsedToken(request);

      if (user.Role.Keyword === 'student') {
        const userRepositories = await UserRepository.fromUser(user);
        return userRepositories.map((userRepository) => userRepository.Repository);
      }

      return Repository.all();
    },
  });
}
