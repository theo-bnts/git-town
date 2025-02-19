import DatabasePool from './tools/DatabasePool.js';

export default class TemporaryCode {
  Id;

  CreatedAt;

  UpdatedAt;

  User;

  Value;

  constructor(id, createdAt, updatedAt, user, value) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.User = user;
    this.Value = value;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.temporary_code (user_id, value)
        VALUES ($1::uuid, $2::text)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Value],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  toJSON() {
    return {
      Id: this.Id,
      CreatedAt: this.CreatedAt,
      UpdatedAt: this.UpdatedAt,
      User: this.User,
    };
  }

  static async isValidValue(value, user) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.temporary_code tc
        WHERE tc.user_id = $1::uuid
        AND tc.value = $2::text
        AND (tc.created_at + ($3::int * INTERVAL '1 second')) > NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM public.temporary_code tc2
          WHERE tc2.user_id = tc.user_id
          AND tc2.created_at > tc.created_at
        )
      `,
      [user.Id, value, Number(process.env.TEMPORARY_CODE_EXPIRATION_SECONDS)],
    );

    return row.count === 1n;
  }

  static async deleteAll(user) {
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM public.temporary_code
        WHERE user_id = $1::uuid
      `,
      [user.Id],
    );
  }
}
