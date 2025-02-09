import AutoLoad from '@fastify/autoload';
import Fastify from 'fastify';
import { join } from 'desm';
import RateLimit from '@fastify/rate-limit';

import DatabasePool from './entities/tools/DatabasePool.js';
import MailTransporter from './entities/tools/MailTransporter.js';
import Request from './entities/tools/Request.js';

DatabasePool.Instance = new DatabasePool();
MailTransporter.Instance = new MailTransporter();

const app = Fastify();

app.listen(
  { host: process.env.SERVER_HOST, port: process.env.SERVER_PORT },
  (error) => {
    if (error) {
      throw error;
    }
  },
);

app.register(RateLimit, {
  max: process.env.RATE_LIMIT_AUTHENTICATED_MAX,
  timeWindow: process.env.RATE_LIMIT_TIME_WINDOW,
  hook: 'preHandler',
  allowList: async (request) => !(await Request.isAuthenticated(request)),
  keyGenerator: async (request) => {
    const token = await Request.getUsedToken(request);
    return token.User.Id;
  },
  errorResponseBuilder: () => ({ statusCode: 429, code: 'RATE_LIMIT_EXCEEDED' }),
});

app.register(AutoLoad, {
  dir: join(import.meta.url, 'routes'),
  dirNameRoutePrefix: false,
});
