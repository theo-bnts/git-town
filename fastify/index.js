import autoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastify from 'fastify';
import { join } from 'desm';
import rateLimit from '@fastify/rate-limit';
import rawBody from 'fastify-raw-body';

import DatabasePool from './entities/tools/DatabasePool.js';
import GitHubApp from './entities/tools/GitHubApp.js';
import MailTransporter from './entities/tools/MailTransporter.js';
import Request from './entities/tools/Request.js';

DatabasePool.Instance = new DatabasePool();
GitHubApp.Instance = new GitHubApp();
MailTransporter.Instance = new MailTransporter();

/* eslint-disable-next-line no-extend-native */
BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};

const app = fastify({
  logger: {
    level: process.env.SERVER_LOG_LEVEL,
  },
});

await app.register(cors, {
  origin: process.env.FRONTEND_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

await app.register(rateLimit, {
  max: Number(process.env.RATE_LIMIT_AUTHENTICATED_STUDENT_INTERNAL_MAX),
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
  hook: 'preHandler',
  allowList: async (request) => {
    if (await Request.isAuthenticated(request)) {
      const token = await Request.getUsedToken(request);

      if (token.User.Role.Keyword === 'student') {
        return false;
      }
    }

    return true;
  },
  keyGenerator: async (request) => {
    if (await Request.isAuthenticated(request)) {
      const token = await Request.getUsedToken(request);

      return token.User.Id;
    }

    return null;
  },
  errorResponseBuilder: () => ({ statusCode: 429, error: 'RATE_LIMIT_EXCEEDED' }),
});

await app.register(rawBody, {
  global: false,
});

await app.register(autoLoad, {
  dir: join(import.meta.url, 'routes'),
  dirNameRoutePrefix: false,
});

app.listen(
  { host: process.env.SERVER_HOST, port: Number(process.env.SERVER_PORT) },
  (error) => {
    if (error) {
      throw error;
    }
  },
);
