import AutoLoad from '@fastify/autoload';
import Fastify from 'fastify';
import { join } from 'desm';
import MultiPart from '@fastify/multipart';

import DatabasePool from './entities/tools/DatabasePool.js';
import MailTransporter from './entities/tools/MailTransporter.js';

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

app.register(MultiPart, {
  attachFieldsToBody: 'keyValues',
  limits: {
    fileSize: process.env.UPLOAD_MAX_SIZE_MB * 1024 * 1024,
  },
});

app.register(AutoLoad, {
  dir: join(import.meta.url, 'routes'),
  dirNameRoutePrefix: false,
});
