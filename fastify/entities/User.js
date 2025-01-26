import DatabasePool from './tools/DatabasePool.js';
import Security from './tools/Security.js';

class User {
  Id;

  EmailAddress;

  PasswordHash;

  PasswordHashSalt;

  UserName;

  constructor(id, emailAddress, passwordHash, passwordHashSalt, userName) {
    this.Id = id;
    this.EmailAddress = emailAddress;
    this.PasswordHash = passwordHash;
    this.PasswordHashSalt = passwordHashSalt;
    this.UserName = userName;
  }

  isValidPassword(password) {
    return (
      this.PasswordHash !== null
      && Security.hashPassword(password, this.PasswordHashSalt)
        === this.PasswordHash
    );
  }

  async insert() {
    const result = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO USER_ (EMAIL_ADDRESS, PASSWORD_HASH, PASSWORD_HASH_SALT, USER_NAME)
        VALUES (?, ?, ?, ?)
      `,
      [
        this.EmailAddress,
        this.PasswordHash,
        this.PasswordHashSalt,
        this.UserName,
      ],
    );

    this.Id = result.insertId;
  }

  async update() {
    await DatabasePool.Instance.execute(
      /* sql */ `
                UPDATE USER_
                SET
                  EMAIL_ADDRESS = ?,
                  PASSWORD_HASH = ?,
                  PASSWORD_HASH_SALT = ?,
                  USER_NAME = ?
                WHERE ID_USER = ?
      `,
      [
        this.EmailAddress,
        this.PasswordHash,
        this.PasswordHashSalt,
        this.UserName,
        this.Id,
      ],
    );
  }

  static async isEmailAddressInserted(emailAddress) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT COUNT(*) AS COUNT
                FROM USER_
                WHERE EMAIL_ADDRESS = ?
            `,
      [emailAddress],
    );

    return row.COUNT === 1;
  }

  static async isUserNameInserted(userName) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT COUNT(*) AS COUNT
                FROM USER_
                WHERE USER_NAME = ?
            `,
      [userName],
    );

    return row.COUNT === 1;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT
                    EMAIL_ADDRESS,
                    PASSWORD_HASH,
                    PASSWORD_HASH_SALT,
                    USER_NAME
                FROM USER_
                WHERE ID_USER = ?
            `,
      [id],
    );

    return new this(
      id,
      row.EMAIL_ADDRESS,
      row.PASSWORD_HASH,
      row.PASSWORD_HASH_SALT,
      row.USER_NAME,
    );
  }

  static async fromEmailAddress(emailAddress) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT
                    ID_USER,
                    PASSWORD_HASH,
                    PASSWORD_HASH_SALT,
                    USER_NAME
                FROM USER_
                WHERE EMAIL_ADDRESS = ?
            `,
      [emailAddress],
    );

    return new this(
      row.ID_USER,
      emailAddress,
      row.PASSWORD_HASH,
      row.PASSWORD_HASH_SALT,
      row.USER_NAME,
    );
  }
}

export default User;
