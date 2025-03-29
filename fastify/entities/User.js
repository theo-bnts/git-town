import DatabasePool from './tools/DatabasePool.js';
import Role from './Role.js';
import Security from './tools/Security.js';

export default class User {
  Id;

  CreatedAt;

  UpdatedAt;

  EmailAddress;

  PasswordHashSalt;

  PasswordHash;

  FullName;

  Role;

  GitHubId;

  GitHubOrganizationMember;

  constructor(
    id,
    createdAt,
    updatedAt,
    emailAddress,
    passwordHashSalt,
    passwordHash,
    fullName,
    role,
    gitHubId,
    gitHubOrganizationMember,
  ) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.EmailAddress = emailAddress;
    this.PasswordHashSalt = passwordHashSalt;
    this.PasswordHash = passwordHash;
    this.FullName = fullName;
    this.Role = role;
    this.GitHubId = gitHubId;
    this.GitHubOrganizationMember = gitHubOrganizationMember;
  }

  isPasswordDefined() {
    return this.PasswordHash !== null;
  }

  isValidPassword(password) {
    return (
      this.isPasswordDefined()
      && Security.hashPassword(password, this.PasswordHashSalt) === this.PasswordHash
    );
  }

  async insert() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        INSERT INTO public.user (
          email_address,
          password_hash_salt,
          password_hash,
          full_name,
          role_id,
          github_id,
          github_organization_member
        )
        VALUES (
          $1::text,
          $2::text,
          $3::text,
          $4::text,
          $5::uuid,
          $6::bigint,
          $7::boolean
        )
        RETURNING id, created_at, updated_at
      `,
      [
        this.EmailAddress,
        this.PasswordHashSalt,
        this.PasswordHash,
        this.FullName,
        this.Role.Id,
        this.GitHubId,
        this.GitHubOrganizationMember,
      ],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        UPDATE public.user
        SET
          email_address = $1::text,
          password_hash_salt = $2::text,
          password_hash = $3::text,
          full_name = $4::text,
          role_id = $5::uuid,
          github_id = $6::bigint,
          github_organization_member = $7::boolean
        WHERE id = $8::uuid
        RETURNING updated_at
      `,
      [
        this.EmailAddress,
        this.PasswordHashSalt,
        this.PasswordHash,
        this.FullName,
        this.Role.Id,
        this.GitHubId,
        this.GitHubOrganizationMember,
        this.Id,
      ],
    );

    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.query(
      /* sql */ `
        DELETE FROM public.user
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  toJSON() {
    return {
      Id: this.Id,
      CreatedAt: this.CreatedAt,
      UpdatedAt: this.UpdatedAt,
      EmailAddress: this.EmailAddress,
      PasswordDefined: this.isPasswordDefined(),
      FullName: this.FullName,
      Role: this.Role,
      GitHubId: this.GitHubId,
      GitHubOrganizationMember: this.GitHubOrganizationMember,
    };
  }

  toPublicJSON() {
    return {
      Id: this.Id,
      PasswordDefined: this.isPasswordDefined(),
    };
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user
        WHERE id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isEmailAddressInserted(emailAddress) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user
        WHERE email_address = $1::text
      `,
      [emailAddress],
    );

    return row.count === 1n;
  }

  static async isGitHubIdInserted(gitHubId) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user
        WHERE github_id = $1::bigint
      `,
      [gitHubId],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          created_at,
          updated_at,
          email_address,
          password_hash_salt,
          password_hash,
          full_name,
          role_id,
          github_id,
          github_organization_member
        FROM public.user
        WHERE id = $1::uuid
      `,
      [id],
    );

    const role = await Role.fromId(row.role_id);

    return new this(
      id,
      row.created_at,
      row.updated_at,
      row.email_address,
      row.password_hash_salt,
      row.password_hash,
      row.full_name,
      role,
      row.github_id,
      row.github_organization_member,
    );
  }

  static async fromEmailAddress(emailAddress) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          password_hash_salt,
          password_hash,
          full_name,
          role_id,
          github_id,
          github_organization_member
        FROM public.user
        WHERE email_address = $1::text
      `,
      [emailAddress],
    );

    const role = await Role.fromId(row.role_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      emailAddress,
      row.password_hash_salt,
      row.password_hash,
      row.full_name,
      role,
      row.github_id,
      row.github_organization_member,
    );
  }

  static async fromGitHubId(gitHubId) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          email_address,
          password_hash_salt,
          password_hash,
          full_name,
          role_id,
          github_organization_member
        FROM public.user
        WHERE github_id = $1::bigint
      `,
      [gitHubId],
    );

    const role = await Role.fromId(row.role_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.email_address,
      row.password_hash_salt,
      row.password_hash,
      row.full_name,
      role,
      gitHubId,
      row.github_organization_member,
    );
  }

  static async all() {
    const rows = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          email_address,
          password_hash_salt,
          password_hash,
          full_name,
          role_id,
          github_id,
          github_organization_member
        FROM public.user
      `,
    );

    const roles = await Role.all();

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.email_address,
      row.password_hash_salt,
      row.password_hash,
      row.full_name,
      roles.find((role) => role.Id === row.role_id),
      row.github_id,
      row.github_organization_member,
    ));
  }
}
