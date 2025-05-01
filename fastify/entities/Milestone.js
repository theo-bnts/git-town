import { DateTime } from 'luxon';

import DatabasePool from './tools/DatabasePool.js';
import Template from './Template.js';

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
    const [row] = await DatabasePool.EnvironmentInstance.query(
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
    const [row] = await DatabasePool.EnvironmentInstance.query(
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

  async delete() {
    await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        DELETE FROM public.milestone
        WHERE id = $1::uuid
      `,
      [this.Id],
    );
  }

  toJSON() {
    return {
      Id: this.Id,
      CreatedAt: this.CreatedAt,
      UpdatedAt: this.UpdatedAt,
      Title: this.Title,
      Date: DateTime
        .fromJSDate(this.Date)
        .toFormat('yyyy-MM-dd'),
    };
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.milestone
        WHERE id = $1::uuid
      `,
      [id],
    );

    return row.count === 1n;
  }

  static async isTemplateAndTitleInserted(template, title) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.milestone
        WHERE template_id = $1::uuid
        AND title = $2::text
      `,
      [template.Id, title],
    );

    return row.count === 1n;
  }

  static async isTemplateAndDateInserted(template, date) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.milestone
        WHERE template_id = $1::uuid
        AND date = $2::date
      `,
      [template.Id, date],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          created_at,
          updated_at,
          template_id,
          title,
          date
        FROM public.milestone
        WHERE id = $1::uuid
      `,
      [id],
    );

    const template = await Template.fromId(row.template_id);

    return new this(
      id,
      row.created_at,
      row.updated_at,
      template,
      row.title,
      row.date,
    );
  }

  static async fromTemplate(template) {
    const rows = await DatabasePool.EnvironmentInstance.query(
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
