import DatabasePool from './tools/DatabasePool.js';

export default class Template {
  Id;

  CreatedAt;

  UpdatedAt;

  EnseignementUnit;

  Year;

  constructor(
    id,
    createdAt,
    updatedAt,
    enseignementUnit,
    year,
  ) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.EnseignementUnit = enseignementUnit;
    this.Year = year;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.template (enseignement_unit_id, year)
        VALUES ($1::uuid, $2::integer)
        RETURNING id, created_at, updated_at
      `,
      [this.EnseignementUnit.Id, this.Year],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        UPDATE public.template
        SET enseignement_unit_id = $1::uuid, year = $2::integer
        WHERE id = $3::uuid
        RETURNING updated_at
      `,
      [this.EnseignementUnit.Id, this.Year, this.Id],
    );

    this.UpdatedAt = row.updated_at;
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.template
        WHERE id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isEnseignementUnitInserted(enseignementUnit) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.template
        WHERE enseignement_unit_id = $1::uuid
      `,
      [enseignementUnit.Id],
    );

    return row.count > 0;
  }

  static async isEnseignementUnitAndYearInserted(enseignementUnit, year) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.template
        WHERE enseignement_unit_id = $1::uuid
        AND year = $2::integer
      `,
      [enseignementUnit.Id, year],
    );

    return row.count > 0;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          enseignement_unit_id,
          year
        FROM public.template
        WHERE id = $1::uuid
      `,
      [id],
    );

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.enseignement_unit_id,
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
          enseignement_unit_id,
          year
        FROM public.template
      `,
    );

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.enseignement_unit_id,
      row.year,
    ));
  }
}
