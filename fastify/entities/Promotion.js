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
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        INSERT INTO public.promotion (diploma_id, promotion_level_id, year)
        VALUES ($1::uuid, $2::uuid, $3::integer)
        RETURNING id, created_at, updated_at
      `,
      [this.Diploma.Id, this.PromotionLevel.Id, this.Year],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        UPDATE public.promotion
        SET
          diploma_id = $1::uuid,
          promotion_level_id = $2::uuid,
          year = $3::integer
        WHERE id = $4::uuid
        RETURNING updated_at
      `,
      [
        this.Diploma.Id,
        this.PromotionLevel.Id,
        this.Year,
        this.Id,
      ],
    );

    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        DELETE FROM public.promotion
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.promotion
        WHERE promotion.id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isDiplomaPromotionLevelAndYearInserted(diploma, promotionLevel, year) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.promotion
        WHERE promotion.diploma_id = $1::uuid
        AND promotion.promotion_level_id = $2::uuid
        AND promotion.year = $3::integer
      `,
      [diploma.Id, promotionLevel.Id, year],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
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
    const promotionLevel = await PromotionLevel.fromId(row.promotion_level_id);

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      diploma,
      promotionLevel,
      row.year,
    );
  }

  static async fromDiplomaPromotionLevelAndYear(diploma, promotionLevel, year) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at
        FROM public.promotion
        WHERE diploma_id = $1::uuid
        AND promotion_level_id = $2::uuid
        AND year = $3::integer
      `,
      [diploma.Id, promotionLevel.Id, year],
    );

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      diploma,
      promotionLevel,
      year,
    );
  }

  static async all() {
    const rows = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          diploma_id,
          promotion_level_id,
          year
        FROM public.promotion
      `,
    );

    return Promise.all(
      rows.map(async (row) => {
        const diploma = await Diploma.fromId(row.diploma_id);
        const promotionLevel = await PromotionLevel.fromId(row.promotion_level_id);

        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          diploma,
          promotionLevel,
          row.year,
        );
      }),
    );
  }
}
