import DatabasePool from './tools/DatabasePool.js';
import Promotion from './Promotion.js';

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
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  static async isUserInserted(user) {
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

  static async isUserAndPromotionInserted(user, promotion) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.user_promotion
        WHERE user_promotion.user_id = $1::uuid
        AND user_promotion.promotion_id = $2::uuid
      `,
      [user.Id, promotion.Id],
    );

    return row.count === 1n;
  }

  static async fromUser(user) {
    const rows = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          user_id,
          promotion_id
        FROM public.user_promotion
        WHERE user_id = $1::uuid
      `,
      [user.Id],
    );

    return Promise.all(
      rows.map(async (row) => {
        const promotion = await Promotion.fromId(row.promotion_id);

        return new UserPromotion(
          row.id,
          row.created_at,
          row.updated_at,
          user,
          promotion,
        );
      }),
    );
  }

  static async fromUserAndPromotion(user, promotion) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at
        FROM public.user_promotion
        WHERE user_id = $1::uuid
        AND promotion_id = $2::uuid
      `,
      [user.Id, promotion.Id],
    );

    return new UserPromotion(
      row.id,
      row.created_at,
      row.updated_at,
      user,
      promotion,
    );
  }
}
