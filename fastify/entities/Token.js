import DatabasePool from './tools/DatabasePool.js';
import User from './User.js';

class Token {
  Id;

  Value;

  Expiration;

  User;

  constructor(id, value, expiration, user) {
    this.Id = id;
    this.Value = value;
    this.Expiration = expiration;
    this.User = user;
  }

  isValid() {
    return this.Expiration === null || this.Expiration > new Date();
  }

  async insert() {
    const result = await DatabasePool.Instance.execute(
      /* sql */ `
                INSERT INTO TOKEN (VALUE_, EXPIRATION, ID_USER)
                VALUES (?, ?, ?)
            `,
      [this.Value, this.Expiration, this.User.Id],
    );

    this.Id = result.insertId;
  }

  async expire() {
    this.Expiration = new Date();

    await DatabasePool.Instance.execute(
      /* sql */ `
                UPDATE TOKEN
                SET EXPIRATION = ?
                WHERE VALUE_ = ?
            `,
      [this.Expiration, this.Value],
    );
  }

  static async isValidValue(value) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT COUNT(*) AS COUNT
                FROM TOKEN
                WHERE VALUE_ = ?
            `,
      [value],
    );

    return row.COUNT === 1;
  }

  static async fromValue(value) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT
                    ID_TOKEN,
                    EXPIRATION,
                    ID_USER
                FROM TOKEN
                WHERE VALUE_ = ?
            `,
      [value],
    );

    const user = await User.fromId(row.ID_USER);

    /* eslint-disable-next-line no-underscore-dangle */
    return new this(row.ID_TOKEN, value, row.EXPIRATION, user);
  }
}

export default Token;
