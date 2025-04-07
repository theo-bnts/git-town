// eslint-disable-next-line import/no-unresolved
import { cache } from '@security-alliance/octokit-plugin-cache';
import { createAppAuth } from '@octokit/auth-app';
import moment from 'moment';
// eslint-disable-next-line import/no-unresolved
import { Octokit } from 'octokit';

export default class GitHubApp {
  Octokit;

  Users;

  Organization;

  EducationalTeam;

  Repositories;
  
  Milestones;

  static Instance;

  constructor() {
    this.Octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: Number(process.env.GITHUB_APP_ID),
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
        installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
      },
    });

    cache(this.Octokit, {
      cache: {
        enabled: true,
      },
    });

    this.Users = new Users(this);
    this.Organization = new Organization(this);
    this.EducationalTeam = new EducationalTeam(this);
    this.Repositories = new Repositories(this);
    this.Milestones = new Milestones(this);
  }
}

class Users {
  App;

  constructor(app) {
    this.App = app;
  }

  async get(userId) {
    const { data: user } = await this.App.Octokit.rest.users.getById({
      account_id: Number(userId),
    });

    return {
      Id: user.id,
      Username: user.login,
    };
  }
}

class Organization {
  App;

  constructor(app) {
    this.App = app;
  }

  async get() {
    const { data: organization } = await this.App.Octokit.rest.orgs.get({
      org: process.env.GITHUB_ORGANIZATION_ID,
    });

    return {
      Id: organization.id,
      Name: organization.login,
    };
  }

  async getInvitations(userId) {
    const { Name: organizationName } = await this.get();

    const invitations = await this.App.Octokit.paginate(
      this.App.Octokit.rest.orgs.listPendingInvitations,
      { org: organizationName }
    );

    const { Username: username } = await this.App.Users.get(userId);

    return invitations
      .filter((invitation) => invitation.login === username)
      .map((invitation) => ({
        Id: invitation.id,
        User: {
          Username: invitation.login,
        },
      }));
  }

  async addInvitation(userId) {
    const { Name: organizationName } = await this.get();

    await this.App.Octokit.rest.orgs.createInvitation({
      org: organizationName,
      invitee_id: Number(userId),
    });
  }

  async removeInvitation(invitationId) {
    const { Name: organizationName } = await this.get();

    await this.App.Octokit.rest.orgs.cancelInvitation({
      org: organizationName,
      invitation_id: invitationId,
    });
  }

  async removeMember(userId) {
    const { Name: organizationName } = await this.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.orgs.removeMembershipForUser({
      org: organizationName,
      username,
    });
  }
}

class EducationalTeam {
  App;

  constructor(app) {
    this.App = app;
  }

  async get() {
    const { Name: organizationName } = await this.App.Organization.get();

    const { data: teams } = await this.App.Octokit.rest.teams.list({
      org: organizationName,
    });

    const educationalTeam = teams.find(
      (team) => team.id === Number(process.env.GITHUB_EDUCATIONAL_TEAM_ID)
    );

    return {
      Id: educationalTeam.id,
      Slug: educationalTeam.slug,
      Name: educationalTeam.name,
    };
  }

  async addMember(userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    const { Slug: teamSlug } = await this.get();

    await this.App.Octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
      org: organizationName,
      team_slug: teamSlug,
      username,
    });
  }

  async addRepository(repositoryName) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Slug: teamSlug } = await this.App.Teams.getEducationalTeam();

    await this.App.Octokit.rest.teams.addOrUpdateRepoPermissionsInOrg({
      org: organizationName,
      team_slug: teamSlug,
      owner: organizationName,
      repo: repositoryName,
    });
  }
}

class Repositories {
  App;

  constructor(app) {
    this.App = app;
  }

  async add(name) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.repos.createInOrg({
      org: organizationName,
      name,
      homepage:
        `${process.env.FRONTEND_BASE_URL}${process.env.FRONTEND_REPOSITORIES_ENDPOINT}/${name}`,
      private: true,
    });
  }

  async addMember(repositoryName, userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.repos.addCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }

  async removeMember(repositoryName, userId) {
    const { Name: organizationName } = await this.App.Organization.get();

    const { Username: username } = await this.App.Users.get(userId);

    await this.App.Octokit.rest.repos.removeCollaborator({
      owner: organizationName,
      repo: repositoryName,
      username,
    });
  }
}

class Milestones {
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
      Date: moment(milestone.due_on).toDate(),
    }));
  }

  async add(repositoryName, title, date) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.issues.createMilestone({
      owner: organizationName,
      repo: repositoryName,
      title,
      due_on: moment(date).format('YYYY-MM-DD'),
    });
  }

  async update(repositoryName, milestoneNumber, title, date) {
    const { Name: organizationName } = await this.App.Organization.get();

    await this.App.Octokit.rest.issues.updateMilestone({
      owner: organizationName,
      repo: repositoryName,
      milestone_number: milestoneNumber,
      title,
      due_on: moment(date).format('YYYY-MM-DD'),
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
