import DatabasePool from './tools/DatabasePool.js';
import Repository from './Repository.js';

export default class UserRepository {
  Id;

  CreatedAt;

  UpdatedAt;

  User;

  Repository;

  constructor(id, createdAt, updatedAt, user, repository) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.User = user;
    this.Repository = repository;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        INSERT INTO public.user_repository (user_id, repository_id)
        VALUES ($1::uuid, $2::uuid)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Repository.Id],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.query(
      /* sql */ `
        DELETE FROM public.user_repository
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  static async isUserInserted(user) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user_repository
        WHERE user_repository.user_id = $1::uuid
      `,
      [user.Id],
    );

    return row.count > 0;
  }

  static async isUserAndRepositoryInserted(user, repository) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user_repository
        WHERE user_repository.user_id = $1::uuid
        AND user_repository.repository_id = $2::uuid
      `,
      [user.Id, repository.Id],
    );

    return row.count === 1n;
  }

  static async fromUser(user) {
    const rows = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          repository_id
        FROM public.user_repository
        WHERE user_id = $1::uuid
      `,
      [user.Id],
    );

    return Promise.all(
      rows.map(async (row) => {
        const repository = await Repository.fromId(row.repository_id);

        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          user,
          repository,
        );
      }),
    );
  }

  static async fromUserAndRepository(user, repository) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at
        FROM public.user_repository
        WHERE user_id = $1::uuid
        AND repository_id = $2::uuid
      `,
      [user.Id, repository.Id],
    );

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      repository,
    );
  }
}
