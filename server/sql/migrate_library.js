import { initializeDatabase, executeQuery, closeDatabase } from '../config/db.js';

async function migrate() {
  try {
    await initializeDatabase();
    
    console.log('Running migration block to add TEACHERID to LIBRARY_TRANSACTION...');
    
    const alterSql = `
      DECLARE
        v_exists NUMBER;
      BEGIN
        SELECT COUNT(*) INTO v_exists 
        FROM user_tab_columns 
        WHERE table_name = 'LIBRARY_TRANSACTION' AND column_name = 'TEACHERID';
        
        IF v_exists = 0 THEN
          EXECUTE IMMEDIATE 'ALTER TABLE LIBRARY_TRANSACTION ADD teacherid NUMBER NULL';
          EXECUTE IMMEDIATE 'ALTER TABLE LIBRARY_TRANSACTION ADD CONSTRAINT fk_lt_teacher FOREIGN KEY (teacherid) REFERENCES TEACHER(TEACHERID)';
          COMMIT;
        END IF;
      END;
    `;
    
    await executeQuery(alterSql);
    console.log('Database migration successfully completed.');

  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await closeDatabase();
  }
}

migrate();
