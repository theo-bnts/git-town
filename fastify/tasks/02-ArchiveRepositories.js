import { AsyncTask, SimpleIntervalJob } from 'toad-scheduler';

import GitHubApp from '../entities/tools/GitHub/GitHubApp.js';
import Repository from '../entities/Repository.js';

export default function task(app) {
  app.scheduler.addSimpleIntervalJob(
    new SimpleIntervalJob(
      {
        hours: Number(process.env.REPOSITORY_ARCHIVAGE_INTERVAL_HOURS),
        runImmediately: true,
      },
      new AsyncTask(
        'ArchiveRepositories',
        async () => {
          const repositories = await Repository.allToArchive();

          return Promise.all(
            repositories.map(async (repository) => {
              await GitHubApp.EnvironmentInstance.Repositories.updateArchivageState(
                repository.Id,
                true,
              );

              // eslint-disable-next-line no-param-reassign
              repository.ArchivedAt = new Date();

              return repository.update();
            }),
          );
        },
      ),
    ),
  );
}
