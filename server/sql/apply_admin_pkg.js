import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import oracledb from 'oracledb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  user: process.env.DB_USER || 'system',
  password: process.env.DB_PASSWORD || 'oracle',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREE',
  ...(process.env.DB_WALLET_LOCATION && { walletLocation: process.env.DB_WALLET_LOCATION }),
  ...(process.env.DB_WALLET_PASSWORD && { walletPassword: process.env.DB_WALLET_PASSWORD }),
  ...(process.env.DB_CONFIG_DIR && { configDir: process.env.DB_CONFIG_DIR }),
};

async function run() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected.');

    // Read the combined database.sql file
    const sqlPath = path.join(__dirname, 'database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split on lone '/' line separators — each block is a PL/SQL or DDL statement
    const allBlocks = sqlContent.split(/\r?\n\/\r?\n/).map(b => b.trim()).filter(Boolean);

    // Execute only Sections 3 and 4 (PL/SQL package + stored procedure)
    const section3Idx = allBlocks.findIndex(b => b.includes('SECTION 3:'));
    const plsqlBlocks = section3Idx === -1 ? allBlocks : allBlocks.slice(section3Idx);

    console.log(`Executing ${plsqlBlocks.length} PL/SQL block(s) from database.sql (Sections 3 & 4)...`);
    for (let i = 0; i < plsqlBlocks.length; i++) {
      const block = plsqlBlocks[i];
      // Skip comment-only blocks (lines starting with --)
      if (/^(\s*--[^\n]*\n?)+$/.test(block)) continue;
      console.log(`  Block ${i + 1}: ${block.substring(0, 80).replace(/\n/g, ' ')}...`);
      await connection.execute(block);
      console.log(`  Block ${i + 1} executed successfully.`);
    }
    console.log('PL/SQL package (admin_user_pkg) and stored procedure (GET_TEACHER_DASHBOARD_DATA) loaded successfully.');
  } catch (err) {
    console.error('Error applying PL/SQL:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

run();
