import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Enable node-oracledb thin mode (thin mode is enabled by default in v6+ if initOracleClient is not called)
// but we explicitly define connection parameters.

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  ...(process.env.DB_WALLET_LOCATION && { walletLocation: process.env.DB_WALLET_LOCATION }),
  ...(process.env.DB_WALLET_PASSWORD && { walletPassword: process.env.DB_WALLET_PASSWORD }),
  ...(process.env.DB_CONFIG_DIR && { configDir: process.env.DB_CONFIG_DIR }),
};

let pool;

export async function initializeDatabase() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('Oracle DB Connection Pool initialized successfully.');
  } catch (err) {
    console.error('Error initializing Oracle DB Pool:', err.message);
    throw err;
  }
}

export async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    // Default autoCommit to true for inserts/updates unless specified
    if (options.autoCommit === undefined) {
      options.autoCommit = true;
    }
    // Set outFormat to OBJECT for easier JSON mapping
    if (options.outFormat === undefined) {
      options.outFormat = oracledb.OUT_FORMAT_OBJECT;
    }
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Database query execution error. SQL:', sql, 'Error:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing database connection:', err.message);
      }
    }
  }
}

export async function closeDatabase() {
  if (pool) {
    try {
      await pool.close();
      console.log('Oracle DB Connection Pool closed.');
    } catch (err) {
      console.error('Error closing Oracle DB pool:', err.message);
    }
}
