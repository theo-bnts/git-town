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

  async begin(connection) {
    await connection.query('BEGIN');
  }

  async query(query, values, connection) {
    const connectionExists = connection !== undefined;

    if (!connectionExists) {
      connection = await this.createConnection();
    }
    
    const result = await connection.query(query, values);

    if (!connectionExists) {
      connection.release();
    }

    return result.rows;
  }

  async commit(connection) {
    await connection.query('COMMIT');
  }

  async release(connection) {
    await connection.release();
  }
}
