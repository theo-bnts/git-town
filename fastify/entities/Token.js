import moment from 'moment';

import DatabasePool from './tools/DatabasePool.js';
import User from './User.js';

export default class Token {
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

  isValid() {
    if (this.CreatedAt === null) {
      return false;
    }

    const expirationSeconds = Number(process.env.TOKEN_EXPIRATION_SECONDS);
    const expirationDate = moment(this.CreatedAt).add(expirationSeconds, 'seconds');
    return expirationDate.isAfter(moment());
  }

  async insert() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        INSERT INTO public.token (user_id, value)
        VALUES ($1::uuid, $2::text)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Value],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.query(
      /* sql */ `
        DELETE FROM public.token
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  toSafeJSON() {
    return {
      Id: this.Id,
      CreatedAt: this.CreatedAt,
      UpdatedAt: this.UpdatedAt,
      User: this.User,
    };
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.token
        WHERE id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isValueInserted(value) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.token
        WHERE value = $1::text
      `,
      [value],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          user_id,
          value
        FROM public.token
        WHERE id = $1::uuid
      `,
      [id],
    );

    const user = await User.fromId(row.user_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      row.value,
    );
  }

  static async fromValue(value) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          user_id
        FROM public.token
        WHERE value = $1::text
      `,
      [value],
    );

    const user = await User.fromId(row.user_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      value,
    );
  }

  static async fromUser(user) {
    const rows = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          value
        FROM public.token
        WHERE user_id = $1::uuid
      `,
      [user.Id],
    );

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      row.value,
    ));
  }
}
