import DatabasePool from './tools/DatabasePool.js';

export default class UserPromotion {
  Id;

  CreatedAt;

  UpdatedAt;

  User;

  Promotion;

  constructor(id, createdAt, updatedAt, user, promotion) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.User = user;
    this.Promotion = promotion;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.user_promotion (user_id, promotion_id)
        VALUES ($1::uuid, $2::uuid)
        RETURNING id, created_at, updated_at
      `,
      [this.User.Id, this.Promotion.Id],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM public.user_promotion
        WHERE user_id = $1::uuid
        AND promotion_id = $2::uuid
      `,
      [this.User.Id, this.Promotion.Id],
    );
  }

  static async isMemberOfAnyPromotion(user) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user_promotion
        WHERE user_promotion.user_id = $1::uuid
      `,
      [user.Id],
    );

    return row.count > 0;
  }
}
