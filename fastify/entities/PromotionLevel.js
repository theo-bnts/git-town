import DatabasePool from './tools/DatabasePool.js';

export default class PromotionLevel {
  Id;

  CreatedAt;

  UpdatedAt;

  Initialism;

  Name;

  constructor(id, createdAt, updatedAt, initialism, name) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.Initialism = initialism;
    this.Name = name;
  }

  static async isInitialismInserted(initialism) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.promotion_level
        WHERE initialism = $1::text
      `,
      [initialism],
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
          initialism,
          name
        FROM public.promotion_level
        WHERE id = $1::uuid
      `,
      [id],
    );

    return new this(
      id,
      row.created_at,
      row.updated_at,
      row.initialism,
      row.name,
    );
  }

  static async fromInitialism(initialism) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          initialism,
          name
        FROM public.promotion_level
        WHERE initialism = $1::text
      `,
      [initialism],
    );

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.initialism,
      row.name,
    );
  }

  static async all() {
    const rows = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          initialism,
          name
        FROM public.promotion_level
      `,
    );

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.initialism,
      row.name,
    ));
  }
}
