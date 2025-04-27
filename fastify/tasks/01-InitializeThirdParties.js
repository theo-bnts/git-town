import DatabasePool from '../entities/tools/DatabasePool.js';
import EmailTransporter from '../entities/tools/EmailTransporter.js';
import GitHubApp from '../entities/tools/GitHub/GitHubApp.js';

export default function task() {
  DatabasePool.EnvironmentInstance = DatabasePool.fromEnvironment();
  EmailTransporter.EnvironmentInstance = EmailTransporter.fromEnvironment();
  GitHubApp.EnvironmentInstance = GitHubApp.fromEnvironment();
}
