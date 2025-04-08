import { DateTime } from 'luxon';

export default class GitHubMilestones {
  App;

  constructor(app) {
    this.App = app;
  }

  async get(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: milestones } = await this.App.Octokit.rest.issues.listMilestones({
      owner: organizationName,
      repo: repositoryName,
    });

    return milestones.map((milestone) => ({
      Id: milestone.id,
      Number: milestone.number,
      Title: milestone.title,
      Date: DateTime.fromISO(milestone.due_on).toJSDate(),
    }));
  }

  async add(repositoryName, title, date) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.issues.createMilestone({
      owner: organizationName,
      repo: repositoryName,
      title,
      due_on: DateTime.fromJSDate(date).toISO(),
    });
  }

  async update(repositoryName, milestoneNumber, title, date) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.issues.updateMilestone({
      owner: organizationName,
      repo: repositoryName,
      milestone_number: milestoneNumber,
      title,
      due_on: DateTime.fromJSDate(date).toISO(),
    });
  }

  async remove(repositoryName, milestoneNumber) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.issues.deleteMilestone({
      owner: organizationName,
      repo: repositoryName,
      milestone_number: milestoneNumber,
    });
  }
}
