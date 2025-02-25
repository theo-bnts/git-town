import DatabasePool from './tools/DatabasePool.js';
import Diploma from './Diploma.js';
import PromotionLevel from './PromotionLevel.js';

export default class Promotion {
  Id;

  CreatedAt;

  UpdatedAt;

  Diploma;

  PromotionLevel;

  Year;

  constructor(id, createdAt, updatedAt, diploma, promotionLevel, year) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.Diploma = diploma;
    this.PromotionLevel = promotionLevel;
    this.Year = year;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.promotion (diploma_id, promotion_level_id, year)
        VALUES ($1::uuid, $2::integer, $3::integer)
        RETURNING id, created_at, updated_at
      `,
      [this.Diploma.Id, this.PromotionLevel, this.Year],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.execute(
      /* sql */ `
        DELETE FROM public.promotion
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.promotion
        WHERE promotion.id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          diploma_id,
          promotion_level_id,
          year
        FROM public.promotion
        WHERE id = $1::uuid
      `,
      [id],
    );

    const diploma = await Diploma.fromId(row.diploma_id);
    const promotionLevel = await PromotionLevel.fromId(row.promotion_level);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      diploma,
      promotionLevel,
      row.year,
    );
  }

  static async all() {
    const rows = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          diploma_id
          promotion_level_id,
          year
        FROM public.promotion
      `,
    );

    return Promise.all(
      rows.map((row) => {
        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          Diploma.fromId(row.diploma_id),
          PromotionLevel.fromId(row.promotion_level_id),
          row.year,
        );
      }),
    );
  }
}
