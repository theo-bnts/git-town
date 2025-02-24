import DatabasePool from './tools/DatabasePool.js';

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
    const [row] = await DatabasePool.Instance.execute(
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
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM public.user_repository
        WHERE user_id = $1::uuid
        AND repository_id = $2::uuid
      `,
      [this.User.Id, this.Repository.Id],
    );
  }

  static async isCollaboratorOfAnyRepository(user) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user_repository
        WHERE user_repository.user_id = $1::uuid
      `,
      [user.Id],
    );

    return row.count > 0;
  }
}
