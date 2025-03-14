import DatabasePool from './tools/DatabasePool.js';

export default class Repository {
  Id;

  CreatedAt;

  UpdatedAt;

  ArchivedAt;

  Template;

  Promotion;

  Comment;

  GitHubId;

  GitHubTeamId;

  constructor(
    id,
    createdAt,
    updatedAt,
    archivedAt,
    template,
    promotion,
    comment,
    gitHubId,
    gitHubTeamId,
  ) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.ArchivedAt = archivedAt;
    this.Template = template;
    this.Promotion = promotion;
    this.Comment = comment;
    this.GitHubId = gitHubId;
    this.GitHubTeamId = gitHubTeamId;
  }

  async insert() {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        INSERT INTO public.repository (
          archived_at,
          template_id,
          promotion_id,
          comment,
          github_id,
          github_team_id
        )
        VALUES (
          $1::timestamp with time zone,
          $2::uuid,
          $3::uuid,
          $4::text,
          $5::bigint,
          $6::bigint
        )
        RETURNING id, created_at, updated_at
      `,
      [
        this.ArchivedAt,
        this.Template.Id,
        this.Promotion.Id,
        this.Comment,
        this.GitHubId,
        this.GitHubTeamId,
      ],
    );

    this.Id = row.id;
    this.CreatedAt = row.created_at;
    this.UpdatedAt = row.updated_at;
  }

  static async isPromotionInserted(promotion) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM public.repository
        WHERE repository.promotion_id = $1::uuid
      `,
      [promotion.Id],
    );

    return row.count > 0;
  }

  static async all() {
    const rows = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          repository.id,
          repository.created_at,
          repository.updated_at,
          repository.archived_at,
          repository.template_id,
          repository.promotion_id,
          repository.comment,
          repository.github_id,
          repository.github_team_id
        FROM public.repository
        ORDER BY repository.created_at DESC
      `,
    );

    return rows.map((row) => new this(
      row.id,
      row.created_at,
      row.updated_at,
      row.archived_at,
      row.template_id,
      row.promotion_id,
      row.comment,
      row.github_id,
      row.github_team_id,
    ));
  }
}
