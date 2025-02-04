import DatabasePool from './tools/DatabasePool.js';

class Role {
  Id;

  CreatedAt;

  UpdatedAt;

  Keyword;

  Name;

  constructor(id, createdAt, updatedAt, keyword, name) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.Keyword = keyword;
    this.Name = name;
  }

  static async isKeywordInserted(keyword) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT COUNT(*) AS count
        FROM role
        WHERE keyword = $1::text
      `,
      [keyword],
    );

    return row.count === 1n;
  }

  static async fromId(id) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          created_at,
          updated_at,
          keyword,
          name
        FROM role
        WHERE id = $1::uuid
      `,
      [id],
    );

    return new Role(
      id,
      row.created_at,
      row.updated_at,
      row.keyword,
      row.name,
    );
  }

  static async fromKeyword(keyword) {
    const [row] = await DatabasePool.Instance.execute(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          name
        FROM role
        WHERE keyword = $1::text
      `,
      [keyword],
    );

    return new Role(
      row.id,
      row.created_at,
      row.updated_at,
      keyword,
      row.name,
    );
  }
}

export default Role;
