import DatabasePool from './tools/DatabasePool.js';

export default class Milestone {
  Id;

  CreatedAt;

  UpdatedAt;

  Template;

  Title;

  Date;

  constructor(id, createdAt, updatedAt, template, title, date) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.Template = template;
    this.Title = title;
    this.Date = date;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.milestone (template_id, title, date)
        VALUES ($1::uuid, $2::text, $3::date)
        RETURNING id, created_at, updated_at
      `,
      [this.Template.Id, this.Title, this.Date],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        UPDATE public.milestone
        SET template_id = $1::uuid, title = $2::text, date = $3::date
        WHERE id = $4::uuid
        RETURNING updated_at
      `,
      [this.Template.Id, this.Title, this.Date, this.Id],
    );

    this.UpdatedAt = row.updated_at;
  }

  toJSON() {
    return {
      id: this.Id,
      createdAt: this.CreatedAt,
      updatedAt: this.UpdatedAt,
      title: this.Title,
      date: this.Date.toISOString().split('T')[0],
    };
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.milestone
        WHERE initialism = $1::text
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isTemplateTitleAndDateInserted(template, title, date) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.milestone
        WHERE template_id = $1::uuid
        AND title = $2::text
        AND date = $3::date
      `,
      [template.Id, title, date],
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
          initialism,
          name
        FROM public.milestone
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

  static async fromTemplate(template) {
    const rows = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          title,
          date
        FROM public.milestone
        WHERE template_id = $1::uuid
      `,
      [template.Id],
    );

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      template,
      row.title,
      row.date,
    ));
  }
}
