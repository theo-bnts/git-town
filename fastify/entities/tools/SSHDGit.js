import { NodeSSH } from 'node-ssh';

import GitHubApp from './GitHub/GitHubApp.js';

export default class SSHDGit {
  Connection;

  constructor(connection) {
    this.Connection = connection;
  }

  async execute(command, options = {}) {
    const { stdout, stderr, code } = await this.Connection.execCommand(command, options);

    if (code !== 0) {
      throw new Error(stderr);
    }

    return stdout;
  }

  async clone(sourceRepository, targetRepository) {
    const installationAccessToken = await GitHubApp.EnvironmentInstance
      .getInstallationAccessToken();

    const { Name: gitHubOrganizationName } = await GitHubApp.EnvironmentInstance.Organization.get();

    const sourceRepositoryFullName = `${sourceRepository}.git`;
    const targetRepositoryFullName = `${targetRepository}.git`;

    const organizationURL = `https://git:${installationAccessToken}@github.com/${gitHubOrganizationName}`;

    const sourceRepositoryURL = `${organizationURL}/${sourceRepositoryFullName}`;
    const targetRepositoryURL = `${organizationURL}/${targetRepositoryFullName}`;

    try {
      await this.execute(`git clone --bare ${sourceRepositoryURL}`, {
        cwd: process.env.SSHD_GIT_CLONE_DIRECTORY,
      });
      await this.execute('git lfs fetch --all', {
        cwd: `${process.env.SSHD_GIT_CLONE_DIRECTORY}/${sourceRepositoryFullName}`,
      });
      await this.execute(`git remote set-url --push origin ${targetRepositoryURL}`, {
        cwd: `${process.env.SSHD_GIT_CLONE_DIRECTORY}/${sourceRepositoryFullName}`,
      });
      await this.execute('git push --mirror origin', {
        cwd: `${process.env.SSHD_GIT_CLONE_DIRECTORY}/${sourceRepositoryFullName}`,
      });
      await this.execute('git lfs push --all origin', {
        cwd: `${process.env.SSHD_GIT_CLONE_DIRECTORY}/${sourceRepositoryFullName}`,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      await this.execute(`rm -rf ${sourceRepositoryFullName}`, {
        cwd: process.env.SSHD_GIT_CLONE_DIRECTORY,
      });
    }
  }

  static async fromEnvironment() {
    const connection = await new NodeSSH().connect({
      host: process.env.SSHD_GIT_HOST,
      port: Number(process.env.SSHD_GIT_PORT),
      username: process.env.SSHD_GIT_USER_NAME,
      privateKey: process.env.SSHD_GIT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    return new this(connection);
  }
}
