import autoLoad from '@fastify/autoload';
import cors from '@fastify/cors';
import fastify from 'fastify';
import { join } from 'desm';
import rateLimit from '@fastify/rate-limit';

import DatabasePool from './entities/tools/DatabasePool.js';
import MailTransporter from './entities/tools/MailTransporter.js';
import Request from './entities/tools/Request.js';

DatabasePool.Instance = new DatabasePool();
MailTransporter.Instance = new MailTransporter();

const app = fastify({
  logger: {
    level: process.env.SERVER_LOG_LEVEL,
  },
});

app.listen(
  { host: process.env.SERVER_HOST, port: process.env.SERVER_PORT },
  (error) => {
    if (error) {
      throw error;
    }
  },
);

app.register(rateLimit, {
  max: process.env.RATE_LIMIT_AUTHENTICATED_MAX,
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
  hook: 'preHandler',
  allowList: async (request) => (!await Request.isAuthenticated(request)),
  keyGenerator: async (request) => {
    const token = await Request.getUsedToken(request);
    return token.User.Id;
  },
  errorResponseBuilder: () => ({ statusCode: 429, error: 'RATE_LIMIT_EXCEEDED' }),
});

app.register(cors, {
  origin: process.env.CORS_ORIGIN,
});

app.register(autoLoad, {
  dir: join(import.meta.url, 'routes'),
  dirNameRoutePrefix: false,
});

/* eslint-disable-next-line no-extend-native */
BigInt.prototype.toJSON = function toJSON() {
  return this.toString();
};
