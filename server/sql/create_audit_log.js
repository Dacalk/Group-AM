/**
 * create_audit_log.js
 * 
 * Run once: node server/sql/create_audit_log.js
 * Creates the AUDIT_LOG table required for admin activity tracking.
 */
import { initializeDatabase, executeQuery, closeDatabase } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createAuditLog() {
  try {
    await initializeDatabase();
    console.log('Connected to Oracle Database.');

    // Create AUDIT_LOG table (idempotent - skips if already exists ORA-00955)
    await executeQuery(`
      DECLARE
        e_table_exists EXCEPTION;
        PRAGMA EXCEPTION_INIT(e_table_exists, -955);
      BEGIN
        EXECUTE IMMEDIATE 'CREATE TABLE AUDIT_LOG (id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id NUMBER, username VARCHAR2(100), action VARCHAR2(255) NOT NULL, target_type VARCHAR2(100), target_id VARCHAR2(100), details VARCHAR2(1000), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)';
      EXCEPTION
        WHEN e_table_exists THEN NULL;
      END;
    `);

    console.log('AUDIT_LOG table ensured (created or already existed).');
    console.log('Done!');
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

createAuditLog();
