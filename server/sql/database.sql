-- =============================================================================
-- database.sql
-- LMS (Learning Management System) — Oracle Database Setup
--
-- This single file combines all SQL definitions required by the application.
-- Run sections in order:
--   SECTION 1 — Cleanup      : Drop/clear stale tables before re-seeding
--   SECTION 2 — DDL Patches  : ALTER statements to add missing columns/constraints
--   SECTION 3 — Packages     : PL/SQL package for admin user CRUD via admin_user_pkg
--   SECTION 4 — Procedures   : Stored procedures used by the Node.js API
--
-- Usage: Executed by seed.js and apply_admin_pkg.js at setup time.
--        Each block is delimited by a lone '/' on its own line for OracleDB
--        block-by-block execution.
-- =============================================================================


-- =============================================================================
-- SECTION 1: CLEANUP
-- Drop any leftover duplicate plural tables, then clear all singular tables
-- in dependency order (children before parents).
-- Called by: seed.js at startup before re-seeding.
-- =============================================================================
DECLARE
  PROCEDURE drop_table(table_name VARCHAR2) IS
  BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE ' || table_name || ' CASCADE CONSTRAINTS';
  EXCEPTION
    WHEN OTHERS THEN
      NULL; -- ignore if table doesn't exist
  END;
BEGIN
  -- Drop stale plural-named duplicates (legacy naming)
  drop_table('MCQS');
  drop_table('QUIZZES');
  drop_table('SUBJECTS');
  drop_table('LIBRARY_TRANSACTIONS');
  drop_table('BOOKS');
  drop_table('STUDENTS');
  drop_table('MESSAGES');
  drop_table('SCHOOL_EVENT');

  -- Clear all rows from existing singular tables (children first)
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM MESSAGES';          EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM SCHOOL_EVENT';      EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM NOTIFICATIONS';     EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM APPLICATIONS';      EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM JOBS';              EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM NOTIFICATION';      EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM QUIZ_RESPONSE';     EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM QUIZ_QUESTION';     EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM QUIZ';              EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM GRADE';             EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM EXAM';              EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM CLASS_SUBJECT';     EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM STUDENT_SUBJECT';   EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM SUBJECT';           EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM CLASSROOM';         EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM LIBRARY_TRANSACTION'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM BOOK';              EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM PARENT';            EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM FEES';              EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM ATTENDANCE';        EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM TIMETABLE';         EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM STUDENT';           EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM TEACHER';           EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM LIBRARIAN';         EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM USERS';             EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE IMMEDIATE 'DELETE FROM DEPARTMENT';        EXCEPTION WHEN OTHERS THEN NULL; END;

  COMMIT;
END;
/


-- =============================================================================
-- SECTION 2: DDL PATCHES
-- One-time idempotent ALTER statements for columns and constraints that are
-- required by the application but may not be in the original table schema.
-- Called by: seed.js after cleanup.
-- =============================================================================

-- 2a. QUIZ table — add class_name column (used to filter quizzes by class)
DECLARE
  v_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists
  FROM user_tab_columns
  WHERE table_name = 'QUIZ' AND column_name = 'CLASS_NAME';

  IF v_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE QUIZ ADD class_name VARCHAR2(50)';
  END IF;
END;
/

-- 2b. QUIZ table — add time_limit column (minutes; used by quiz timer in UI)
DECLARE
  v_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists
  FROM user_tab_columns
  WHERE table_name = 'QUIZ' AND column_name = 'TIME_LIMIT';

  IF v_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE QUIZ ADD time_limit NUMBER';
  END IF;
END;
/

-- 2c. EXAM table — add term column (e.g. 'Term 1', 'Term 2')
DECLARE
  v_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists
  FROM user_tab_columns
  WHERE table_name = 'EXAM' AND column_name = 'TERM';

  IF v_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE EXAM ADD term VARCHAR2(50)';
  END IF;
END;
/

-- 2d. EXAM table — add class_name column (filters exams to a specific class)
DECLARE
  v_exists NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists
  FROM user_tab_columns
  WHERE table_name = 'EXAM' AND column_name = 'CLASS_NAME';

  IF v_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE EXAM ADD class_name VARCHAR2(50)';
  END IF;
END;
/

-- 2e. LIBRARY_TRANSACTION — add TEACHERID FK column
--     Allows teachers (not just students) to borrow books.
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
/

-- 2f. ATTENDANCE — replace old status CHECK constraint to include 'Late' and 'Leave'
--     Original constraint only allowed 'Present'/'Absent'.
DECLARE
  v_constraint VARCHAR2(100);
BEGIN
  -- Find and drop any existing status IN (...) constraint
  FOR r IN (
    SELECT constraint_name
    FROM user_constraints
    WHERE table_name = 'ATTENDANCE'
      AND constraint_type = 'C'
      AND LOWER(search_condition) LIKE '%status%in%'
  ) LOOP
    EXECUTE IMMEDIATE 'ALTER TABLE ATTENDANCE DROP CONSTRAINT ' || r.constraint_name;
  END LOOP;

  -- Add new constraint that covers all valid statuses used by the app
  BEGIN
    EXECUTE IMMEDIATE
      'ALTER TABLE ATTENDANCE ADD CONSTRAINT chk_attendance_status CHECK (status IN (''Present'', ''Absent'', ''Late'', ''Leave''))';
  EXCEPTION
    WHEN OTHERS THEN NULL; -- already exists
  END;

  COMMIT;
END;
/

-- 2g. USERS — update role check constraint to include 'Student'
--     Replaces the old constraint that only allowed Admin/Teacher/Parent/Library.
DECLARE
  v_old_name VARCHAR2(100);
BEGIN
  -- Find old role constraint
  FOR r IN (
    SELECT constraint_name
    FROM user_constraints
    WHERE table_name = 'USERS'
      AND constraint_type = 'C'
      AND LOWER(search_condition) LIKE '%role%in%'
  ) LOOP
    EXECUTE IMMEDIATE 'ALTER TABLE USERS DROP CONSTRAINT ' || r.constraint_name;
  END LOOP;

  -- Add new constraint that includes Student
  BEGIN
    EXECUTE IMMEDIATE
      'ALTER TABLE USERS ADD CONSTRAINT role_check CHECK (role IN (''Admin'', ''Teacher'', ''Parent'', ''Library'', ''Student''))';
  EXCEPTION
    WHEN OTHERS THEN NULL; -- already exists
  END;

  COMMIT;
END;
/

-- 2h. AUDIT_LOG — create if not already present
--     Tracks admin actions: who did what to which entity, and when.
DECLARE
  e_table_exists EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_table_exists, -955);
BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE AUDIT_LOG (
      id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id     NUMBER,
      username    VARCHAR2(100),
      action      VARCHAR2(255)  NOT NULL,
      target_type VARCHAR2(100),
      target_id   VARCHAR2(100),
      details     VARCHAR2(1000),
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  ';
EXCEPTION
  WHEN e_table_exists THEN NULL;
END;
/

-- 2i. SCHOOL_EVENT — create if not already present
DECLARE
  e_table_exists EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_table_exists, -955);
BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE SCHOOL_EVENT (
      id         NUMBER PRIMARY KEY,
      title      VARCHAR2(255) NOT NULL,
      event_date VARCHAR2(50)  NOT NULL,
      event_time VARCHAR2(50),
      event_type VARCHAR2(50)  NOT NULL,
      color      VARCHAR2(50)
    )
  ';
EXCEPTION
  WHEN e_table_exists THEN NULL;
END;
/

-- 2j. MESSAGES — create if not already present
DECLARE
  e_table_exists EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_table_exists, -955);
BEGIN
  EXECUTE IMMEDIATE '
    CREATE TABLE MESSAGES (
      id        VARCHAR2(100) PRIMARY KEY,
      from_id   VARCHAR2(100) NOT NULL,
      from_name VARCHAR2(255) NOT NULL,
      from_role VARCHAR2(50)  NOT NULL,
      to_id     VARCHAR2(100) NOT NULL,
      to_name   VARCHAR2(255) NOT NULL,
      to_role   VARCHAR2(50)  NOT NULL,
      subject   VARCHAR2(255) NOT NULL,
      body      VARCHAR2(2000) NOT NULL,
      timestamp NUMBER         NOT NULL,
      is_read   NUMBER(1)      DEFAULT 0,
      conv_key  VARCHAR2(255)  NOT NULL
    )
  ';
EXCEPTION
  WHEN e_table_exists THEN NULL;
END;
/


-- =============================================================================
-- SECTION 3: ADMIN USER CRUD PACKAGE
-- PL/SQL package used by adminController.js to manage user records in USERS.
-- Provides: add_user, update_user, delete_user, get_all_users
-- Called by: apply_admin_pkg.js (setup) and adminController.js (runtime)
-- =============================================================================

-- Package specification
CREATE OR REPLACE PACKAGE admin_user_pkg AS
  PROCEDURE add_user(
    p_name         IN VARCHAR2,
    p_username     IN VARCHAR2,
    p_password     IN VARCHAR2,
    p_role         IN VARCHAR2,
    p_email        IN VARCHAR2,
    p_avatar_class IN VARCHAR2,
    p_initials     IN VARCHAR2,
    p_out_msg      OUT VARCHAR2
  );

  PROCEDURE update_user(
    p_id           IN NUMBER,
    p_name         IN VARCHAR2,
    p_username     IN VARCHAR2,
    p_password     IN VARCHAR2,
    p_role         IN VARCHAR2,
    p_email        IN VARCHAR2,
    p_avatar_class IN VARCHAR2,
    p_initials     IN VARCHAR2,
    p_out_msg      OUT VARCHAR2
  );

  PROCEDURE delete_user(
    p_id      IN NUMBER,
    p_out_msg OUT VARCHAR2
  );

  FUNCTION get_all_users RETURN SYS_REFCURSOR;
END admin_user_pkg;
/

-- Package body
CREATE OR REPLACE PACKAGE BODY admin_user_pkg AS

  PROCEDURE add_user(
    p_name         IN VARCHAR2,
    p_username     IN VARCHAR2,
    p_password     IN VARCHAR2,
    p_role         IN VARCHAR2,
    p_email        IN VARCHAR2,
    p_avatar_class IN VARCHAR2,
    p_initials     IN VARCHAR2,
    p_out_msg      OUT VARCHAR2
  ) IS
  BEGIN
    INSERT INTO USERS (name, username, password, role, email, avatar_class, initials, last_login)
    VALUES (p_name, p_username, p_password, p_role, p_email, p_avatar_class, p_initials, '-');
    COMMIT;
    p_out_msg := 'User added successfully';
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      p_out_msg := SQLERRM;
  END add_user;

  PROCEDURE update_user(
    p_id           IN NUMBER,
    p_name         IN VARCHAR2,
    p_username     IN VARCHAR2,
    p_password     IN VARCHAR2,
    p_role         IN VARCHAR2,
    p_email        IN VARCHAR2,
    p_avatar_class IN VARCHAR2,
    p_initials     IN VARCHAR2,
    p_out_msg      OUT VARCHAR2
  ) IS
  BEGIN
    UPDATE USERS
    SET name         = p_name,
        username     = p_username,
        password     = COALESCE(p_password, password),
        role         = p_role,
        email        = p_email,
        avatar_class = p_avatar_class,
        initials     = p_initials
    WHERE id = p_id;
    COMMIT;
    p_out_msg := 'User updated successfully';
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      p_out_msg := SQLERRM;
  END update_user;

  PROCEDURE delete_user(
    p_id      IN NUMBER,
    p_out_msg OUT VARCHAR2
  ) IS
  BEGIN
    DELETE FROM USERS WHERE id = p_id;
    COMMIT;
    p_out_msg := 'User deleted successfully';
  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      p_out_msg := SQLERRM;
  END delete_user;

  FUNCTION get_all_users RETURN SYS_REFCURSOR IS
    rc SYS_REFCURSOR;
  BEGIN
    OPEN rc FOR
      SELECT id, name, username, role, email, last_login, avatar_class, initials
      FROM USERS;
    RETURN rc;
  END get_all_users;

END admin_user_pkg;
/


-- =============================================================================
-- SECTION 4: STORED PROCEDURE — GET_TEACHER_DASHBOARD_DATA
-- Returns two SYS_REFCURSORs:
--   1. Student roster with live attendance rate calculation
--   2. Weekly timetable schedule entries
-- Called by: teacherController.js → getDashboardData()
-- =============================================================================
CREATE OR REPLACE PROCEDURE GET_TEACHER_DASHBOARD_DATA (
    p_students_cursor  OUT SYS_REFCURSOR,
    p_timetable_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    -- Cursor 1: student list with calculated attendance rate
    OPEN p_students_cursor FOR
        SELECT
            s.studentid    AS id,
            s.fullname     AS name,
            s.admissionno  AS roll_no,
            s.classname    AS grade,
            s.status,
            COALESCE(
              (SELECT ROUND(
                         COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END) * 100
                         / NULLIF(COUNT(*), 0)
                       )
               FROM ATTENDANCE a
               WHERE a.student_id = s.studentid),
              95
            ) AS attendance_rate
        FROM STUDENT s;

    -- Cursor 2: timetable slots
    OPEN p_timetable_cursor FOR
        SELECT day_of_week, time_slot, class_name, subject, room
        FROM TIMETABLE;
END;
/
