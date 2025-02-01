import DatabasePool from './tools/DatabasePool.js';

class TemporaryCode {
  Id;

  CreatedAt;

  UpdatedAt;

  User;

  Code;

  constructor(id, createdAt, updatedAt, user, code) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.User = user;
    this.Code = code;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO temporary_code (user_id, code)
        VALUES ($1::uuid, $2::text)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Code],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  static async isValidValue(user, code) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.temporary_code tc
        WHERE tc.id_user = $1::uuid
        AND tc.code = $2::text
        AND WHERE (tc.created_at + ($3::int * INTERVAL '1 second')) > NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM public.temporary_code tc2
          WHERE tc2.id_user = tc.id_user
          AND tc2.created_at > tc.created_at
        )
      `,
      [user.Id, code, process.env.TEMPORARY_CODE_EXPIRATION_SECONDS],
    );

    return row.count === 1n;
  }

  static async deleteAll(user) {
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM temporary_code
        WHERE id_user = $1::uuid
      `,
      [user.Id],
    );
  }
}

export default TemporaryCode;
