import pg from 'pg';

export default class DatabasePool {
  Pool;

  static Instance = null;

  constructor() {
    this.Pool = new pg.Pool({
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      max: Number(process.env.DATABASE_CONNECTIONS_LIMIT),
    });

    pg.types.setTypeParser(pg.types.builtins.INT8, BigInt);
  }

  async createConnection() {
    return this.Pool.connect();
  }

  async query(query, values, existingConnection) {
    let connection;

    if (existingConnection === undefined) {
      connection = await this.createConnection();
    }
    else {
      connection = existingConnection;
    }

    const result = await connection.query(query, values);

    if (existingConnection === undefined) {
      await connection.release();
    }

    return result.rows;
  }

  static async begin(connection) {
    await connection.query('BEGIN');
  }

  static async commit(connection) {
    await connection.query('COMMIT');
  }

  static async release(connection) {
    await connection.release();
  }
}
