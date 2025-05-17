import DatabasePool from './tools/DatabasePool.js';
import Promotion from './Promotion.js';
import Template from './Template.js';
import User from './User.js';

export default class Repository {
  Id;

  CreatedAt;

  UpdatedAt;

  ArchivedAt;

  Template;

  Promotion;

  User;

  Comment;

  constructor(
    id,
    createdAt,
    updatedAt,
    archivedAt,
    template,
    promotion,
    user,
    comment,
  ) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.ArchivedAt = archivedAt;
    this.Template = template;
    this.Promotion = promotion;
    this.User = user;
    this.Comment = comment;
  }

  async insert(connection) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        INSERT INTO public.repository (
          archived_at,
          template_id,
          promotion_id,
          user_id,
          comment
        )
        VALUES (
          $1::timestamp with time zone,
          $2::uuid,
          $3::uuid,
          $4::uuid,
          $5::text
        )
        RETURNING id, created_at, updated_at
      `,
      [
        this.ArchivedAt,
        this.Template.Id,
        this.Promotion.Id,
        this.User.Id,
        this.Comment,
      ],
      connection,
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  async update() {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        UPDATE public.repository
        SET
          archived_at = $1::timestamp with time zone,
          template_id = $2::uuid,
          promotion_id = $3::uuid,
          user_id = $4::uuid,
          comment = $5::text
        WHERE id = $6::uuid
        RETURNING updated_at
      `,
      [
        this.ArchivedAt,
        this.Template.Id,
        this.Promotion.Id,
        this.User.Id,
        this.Comment,
        this.Id,
      ],
    );

    this.UpdatedAt = row.updated_at;
  }

  toJSON() {
    return {
      Id: this.Id,
      CreatedAt: this.CreatedAt,
      UpdatedAt: this.UpdatedAt,
      ArchivedAt: this.ArchivedAt,
      Template: this.Template,
      User: this.User,
      Promotion: this.Promotion,
    };
  }

  static async isIdInserted(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.repository
        WHERE repository.id = $1::uuid
      `,
      [id],
    );

    return row.count > 0;
  }

  static async isPromotionInserted(promotion) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.repository
        WHERE repository.promotion_id = $1::uuid
      `,
      [promotion.Id],
    );

    return row.count > 0;
  }

  static async isTemplateInserted(template) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.repository
        WHERE repository.template_id = $1::uuid
      `,
      [template.Id],
    );

    return row.count > 0;
  }

  static async isUserInserted(user) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.repository
        WHERE repository.user_id = $1::uuid
      `,
      [user.Id],
    );

    return row.count > 0;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          repository.created_at,
          repository.updated_at,
          repository.archived_at,
          repository.template_id,
          repository.promotion_id,
          repository.user_id,
          repository.comment
        FROM public.repository
        WHERE repository.id = $1::uuid
      `,
      [id],
    );

    const template = await Template.fromId(row.template_id);
    const promotion = await Promotion.fromId(row.promotion_id);
    const user = await User.fromId(row.user_id);

    return new this(
      id,
      row.created_at,
      row.updated_at,
      row.archived_at,
      template,
      promotion,
      user,
      row.comment,
    );
  }

  static async fromTemplate(template) {
    const rows = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          repository.id,
          repository.created_at,
          repository.updated_at,
          repository.archived_at,
          repository.promotion_id,
          repository.user_id,
          repository.comment
        FROM public.repository
        WHERE repository.template_id = $1::uuid
      `,
      [template.Id],
    );

    return Promise.all(
      rows.map(async (row) => {
        const promotion = await Promotion.fromId(row.promotion_id);
        const user = await User.fromId(row.user_id);

        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          row.archived_at,
          template,
          promotion,
          user,
          row.comment,
        );
      }),
    );
  }

  static async all() {
    const rows = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          repository.id,
          repository.created_at,
          repository.updated_at,
          repository.archived_at,
          repository.template_id,
          repository.promotion_id,
          repository.user_id,
          repository.comment
        FROM public.repository
      `,
    );

    return Promise.all(
      rows.map(async (row) => {
        const template = await Template.fromId(row.template_id);
        const promotion = await Promotion.fromId(row.promotion_id);
        const user = await User.fromId(row.user_id);

        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          row.archived_at,
          template,
          promotion,
          user,
          row.comment,
        );
      }),
    );
  }

  static async allToArchive() {
    const rows = await DatabasePool.EnvironmentInstance.query(
      /* sql */ `
        SELECT
          repository.id,
          repository.created_at,
          repository.updated_at,
          repository.archived_at,
          repository.template_id,
          repository.promotion_id,
          repository.user_id,
          repository.comment
        FROM public.repository
        WHERE archived_at IS NULL
        AND created_at < (NOW() - (($1 || ' hours')::interval))
      `,
      [Number(process.env.REPOSITORY_ARCHIVAGE_AFTER_HOURS)],
    );

    return Promise.all(
      rows.map(async (row) => {
        const template = await Template.fromId(row.template_id);
        const promotion = await Promotion.fromId(row.promotion_id);
        const user = await User.fromId(row.user_id);

        return new this(
          row.id,
          row.created_at,
          row.updated_at,
          row.archived_at,
          template,
          promotion,
          user,
          row.comment,
        );
      }),
    );
  }
}
