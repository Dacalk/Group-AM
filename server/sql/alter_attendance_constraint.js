import oracledb from 'oracledb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function alterAttendanceConstraint() {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER || 'system',
      password: process.env.DB_PASSWORD || 'oracle',
      connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/FREE',
      ...(process.env.DB_WALLET_LOCATION && { walletLocation: process.env.DB_WALLET_LOCATION }),
      ...(process.env.DB_WALLET_PASSWORD && { walletPassword: process.env.DB_WALLET_PASSWORD }),
      ...(process.env.DB_CONFIG_DIR && { configDir: process.env.DB_CONFIG_DIR }),
    });

    console.log('Fetching constraints for ATTENDANCE table...');
    const cResult = await conn.execute(
      `SELECT constraint_name, search_condition 
       FROM user_constraints 
       WHERE table_name = 'ATTENDANCE' AND constraint_type = 'C'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let dropped = false;
    for (const r of cResult.rows) {
      const name = r.CONSTRAINT_NAME;
      const condition = r.SEARCH_CONDITION;
      if (condition && condition.toLowerCase().includes('status') && condition.toLowerCase().includes('in')) {
        console.log(`Found status check constraint: ${name} with condition: ${condition}`);
        await conn.execute(`ALTER TABLE ATTENDANCE DROP CONSTRAINT ${name}`, [], { autoCommit: true });
        console.log(`Successfully dropped constraint ${name}`);
        dropped = true;
      }
    }

    if (!dropped) {
      // In case search_condition couldn't be parsed or was empty, try dropping standard SYS_C0033610 with try/catch
      try {
        await conn.execute(`ALTER TABLE ATTENDANCE DROP CONSTRAINT SYS_C0033610`, [], { autoCommit: true });
        console.log('Attempted dropping SYS_C0033610 directly.');
      } catch (err) {
        console.log('Direct drop of SYS_C0033610 failed (maybe already dropped or named differently).');
      }
    }

    // Step 2: Add the new constraint allowing 'Present', 'Absent', 'Late', 'Leave'
    console.log('Adding new chk_attendance_status constraint...');
    await conn.execute(
      `ALTER TABLE ATTENDANCE ADD CONSTRAINT chk_attendance_status CHECK (status IN ('Present', 'Absent', 'Late', 'Leave'))`,
      [],
      { autoCommit: true }
    );
    console.log('New constraint chk_attendance_status added successfully.');

  } catch (err) {
    console.error('Error altering constraint:', err.message);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

alterAttendanceConstraint();
