import pg from 'pg';

export default class DatabasePool {
  Pool;

  static Instance = null;

  constructor() {
    this.Pool = new pg.Pool({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      max: process.env.DATABASE_CONNECTIONS_LIMIT,
    });

    pg.types.setTypeParser(pg.types.builtins.INT8, BigInt);
  }

  async getConnection() {
    return this.Pool.connect();
  }

  async execute(query, values) {
    const connection = await this.getConnection();
    const result = await connection.query(query, values);
    connection.release();
    return result.rows;
  }
}
