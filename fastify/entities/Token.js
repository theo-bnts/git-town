import DatabasePool from './tools/DatabasePool.js';
import User from './User.js';

class Token {
  Id;

  CreatedAt;

  UpdatedAt;

  User;

  Token;

  constructor(id, createdAt, updatedAt, user, token) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.User = user;
    this.Token = token;
  }

  isValid() {
    if (this.CreatedAt === null) {
      return false;
    }

    const expirationSeconds = Number(process.env.TOKEN_EXPIRATION_SECONDS);
    const expirationDate = new Date(this.CreatedAt.getTime() + (expirationSeconds * 1000));
    return expirationDate > new Date();
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.token (user_id, token)
        VALUES ($1::uuid, $2::text)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Token],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM public.token
        WHERE id = $1::uuid
      `,
      [this.Id],
    );

    this.Id = null;
    this.CreatedAt = null;
    this.UpdatedAt = null;
  }

  static async isValidValue(value) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.token
        WHERE token = $1::text
      `,
      [value],
    );

    return row.count === 1n;
  }

  static async fromValue(value) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          user_id,
          token
        FROM public.token
        WHERE token = $1::text
      `,
      [value],
    );

    const user = await User.fromId(row.user_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      row.token,
    );
  }
}

export default Token;
