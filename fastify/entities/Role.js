import DatabasePool from './tools/DatabasePool.js';

export default class Role {
  Id;

  CreatedAt;

  UpdatedAt;

  Keyword;

  Name;

  HierarchyLevel;

  constructor(id, createdAt, updatedAt, keyword, name, hierarchyLevel) {
    this.Id = id;
    this.CreatedAt = createdAt;
    this.UpdatedAt = updatedAt;
    this.Keyword = keyword;
    this.Name = name;
    this.HierarchyLevel = hierarchyLevel;
  }

  static async isKeywordInserted(keyword) {
    const [row] = await DatabasePool.Instance.query(
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
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          created_at,
          updated_at,
          keyword,
          name,
          hierarchy_level
        FROM role
        WHERE id = $1::uuid
      `,
      [id],
    );

    return new this(
      id,
      row.created_at,
      row.updated_at,
      row.keyword,
      row.name,
      row.hierarchy_level,
    );
  }

  static async fromKeyword(keyword) {
    const [row] = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          name,
          hierarchy_level
        FROM role
        WHERE keyword = $1::text
      `,
      [keyword],
    );

    return new this(
      row.id,
      row.created_at,
      row.updated_at,
      keyword,
      row.name,
      row.hierarchy_level,
    );
  }

  static async all() {
    const rows = await DatabasePool.Instance.query(
      /* sql */ `
        SELECT
          id,
          created_at,
          updated_at,
          keyword,
          name,
          hierarchy_level
        FROM role
      `,
    );

    return rows.map((row) => new Role(
      row.id,
      row.created_at,
      row.updated_at,
      row.keyword,
      row.name,
      row.hierarchy_level,
    ));
  }
}
