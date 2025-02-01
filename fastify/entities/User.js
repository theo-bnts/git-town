import DatabasePool from './tools/DatabasePool.js';
import Role from './Role.js';
import Security from './tools/Security.js';

class User {
  Id;

  CreatedAt;

  UpdatedAt;

  EmailAddress;

  PasswordHash;

  PasswordHashSalt;

  FullName;

  Role;

  GitHubId;

  constructor(
    id,
    createdAt,
    updatedAt,
    emailAddress,
    passwordHash,
    passwordHashSalt,
    fullName,
    role,
    gitHubId,
  ) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.EmailAddress = emailAddress;
    this.PasswordHash = passwordHash;
    this.PasswordHashSalt = passwordHashSalt;
    this.FullName = fullName;
    this.Role = role;
    this.GitHubId = gitHubId;
  }

  isValidPassword(password) {
    return (
      this.PasswordHash !== null
      && Security.hashPassword(password, this.PasswordHashSalt) === this.PasswordHash
    );
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO user (
          email_address,
          password_hash,
          password_hash_salt,
          full_name,
          role_id,
          github_id
        )
        VALUES (
          $1::text,
          $2::text,
          $3::text,
          $4::text,
          $5::uuid,
          $6::text
        )
        RETURNING id, created_at, updated_at
      `,
      [
        this.EmailAddress,
        this.PasswordHash,
        this.PasswordHashSalt,
        this.FullName,
        this.Role.Id,
        this.GitHubId,
      ],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    await DatabasePool.Instance.execute(
      /* sql */ `
        UPDATE USER_
        SET
          email_address = $1::text,
          password_hash = $2::text,
          password_hash_salt = $3::text,
          full_name = $4::text,
          role_id = $5::uuid,
          github_id = $6::text
          WHERE id_user = $7::uuid
      `,
      [
        this.EmailAddress,
        this.PasswordHash,
        this.PasswordHashSalt,
        this.FullName,
        this.Role.Id,
        this.GitHubId,
        this.Id,
      ],
    );
  }

  static async isEmailAddressInserted(emailAddress) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user
        WHERE email_address = $1::text
      `,
      [emailAddress],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          created_at,
          updated_at,
          email_address,
          password_hash,
          password_hash_salt,
          full_name,
          role_id,
          github_id
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
      row.password_hash,
      row.password_hash_salt,
      row.full_name,
      role,
      row.github_id,
    );
  }

  static async fromEmailAddress(emailAddress) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          password_hash,
          password_hash_salt,
          full_name,
          role_id,
          github_id
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
      row.password_hash,
      row.password_hash_salt,
      row.full_name,
      role,
      row.github_id,
    );
  }
}

export default User;
