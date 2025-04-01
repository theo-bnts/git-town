import DatabasePool from './tools/DatabasePool.js';

export default class EnseignementUnit {
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

  async insert() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        INSERT INTO public.enseignement_unit (initialism, name)
        VALUES ($1::text, $2::text)
        RETURNING id, created_at, updated_at
      `,
      [this.Initialism, this.Name],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        UPDATE public.enseignement_unit
        SET initialism = $1::text, name = $2::text
        WHERE id = $3::uuid
        RETURNING updated_at
      `,
      [this.Initialism, this.Name, this.Id],
    );

    this.UpdatedAt = row.updated_at;
  }

  async delete() {
    await DatabasePool.Instance.query(
      /* sql */ `
        DELETE FROM public.enseignement_unit
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.enseignement_unit
        WHERE id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isInitialismInserted(initialism) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.enseignement_unit
        WHERE initialism = $1::text
      `,
      [initialism],
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
          initialism,
          name
        FROM public.enseignement_unit
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

  static async all() {
    const rows = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          initialism,
          name
        FROM public.enseignement_unit
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
