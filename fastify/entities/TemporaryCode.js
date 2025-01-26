import DatabasePool from './tools/DatabasePool.js';

class TemporaryCode {
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

  async insert() {
    const result = await DatabasePool.Instance.execute(
      /* sql */ `
                INSERT INTO TEMPORARY_CODE (VALUE_, EXPIRATION, ID_USER)
                VALUES (?, ?, ?)
            `,
      [this.Value, this.Expiration, this.User.Id],
    );

    this.Id = result.insertId;
  }

  static async isValidValue(value, user) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
                SELECT COUNT(*) AS COUNT
                FROM TEMPORARY_CODE TC
                WHERE TC.EXPIRATION > NOW()
                AND TC.VALUE_ = ?
                AND TC.ID_USER = ?
                AND NOT EXISTS (
                    SELECT 1
                    FROM TEMPORARY_CODE TC2
                    WHERE TC2.ID_USER = TC.ID_USER
                    AND TC2.EXPIRATION > TC.EXPIRATION
                )
            `,
      [value, user.Id],
    );

    return row.COUNT === 1;
  }

  static async expireAll(user) {
    await DatabasePool.Instance.execute(
      /* sql */ `
                UPDATE TEMPORARY_CODE
                SET EXPIRATION = NOW()
                WHERE EXPIRATION > NOW()
                AND ID_USER = ?
            `,
      [user.Id],
    );
  }
}

export default TemporaryCode;
