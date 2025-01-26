import pg from 'pg';

class DatabasePool {
  Pool;

  static Instance = null;

  constructor() {
    this.Pool = new pg.Pool({
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
      waitForConnections: true,
    });
  }

  async getConnection() {
    return this.Pool.getConnection();
  }

  async execute(query, values) {
    const connection = await this.getConnection();
    const [rows] = await connection.execute(query, values);
    connection.release();
    return rows;
  }
}

export default DatabasePool;
