import oracledb from 'oracledb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

async function runSeed() {
  let connection;
  try {
    console.log('Connecting to database with config:', { ...dbConfig, password: '*****' });
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to Oracle Database.');

    // 1. Execute Sections 1 & 2 from database.sql
    //    Section 1 = cleanup (drop/clear tables)
    //    Section 2 = DDL patches (ALTER TABLE / CREATE TABLE / constraints)
    const dbSqlPath = path.join(__dirname, 'database.sql');
    const dbSql = fs.readFileSync(dbSqlPath, 'utf8');

    // Split on lines that are just '/' — each block is a standalone PL/SQL or DDL statement
    const sqlBlocks = dbSql.split(/\r?\n\/\r?\n/).map(b => b.trim()).filter(Boolean);

    // Sections 1 and 2 end before 'SECTION 3'. Find the boundary.
    const section3Idx = sqlBlocks.findIndex(b => b.includes('SECTION 3:'));
    const setupBlocks = section3Idx === -1 ? sqlBlocks : sqlBlocks.slice(0, section3Idx);

    console.log(`Running ${setupBlocks.length} setup SQL blocks (cleanup + DDL patches)...`);
    for (let i = 0; i < setupBlocks.length; i++) {
      const block = setupBlocks[i];
      // Skip comment-only blocks
      if (/^(-{2,}.*\n?)+$/.test(block)) continue;
      try {
        await connection.execute(block);
        console.log(`  Block ${i + 1}/${setupBlocks.length} executed.`);
      } catch (err) {
        // Non-fatal: log and continue (many blocks are idempotent guards)
        console.warn(`  Block ${i + 1} warning: ${err.message}`);
      }
    }
    console.log('Database cleanup and DDL patches applied.');

    // 2. Insert Seed Data
    console.log('Inserting seed data into singular tables...');

    // Seed Users
    const users = [
      { id: 1, name: 'Parent One', username: 'parent1', password: 'password', role: 'Parent', email: 'parent1@school.edu', last_login: 'June 9, 2026', avatar_class: 'bg-[#6C63FF]', initials: 'PO' },
      { id: 2, name: 'Teacher One', username: 'teacher1', password: 'password', role: 'Teacher', email: 'teacher1@school.edu', last_login: 'June 10, 2026', avatar_class: 'bg-[#FF6584]', initials: 'TO' },
      { id: 3, name: 'Admin User', username: 'admin', password: 'admin123', role: 'Admin', email: 'admin@school.edu', last_login: 'June 10, 2026', avatar_class: 'bg-[#43B89C]', initials: 'AD' },
      { id: 4, name: 'Librarian', username: 'librarian', password: 'password', role: 'Library', email: 'library@school.edu', last_login: 'June 8, 2026', avatar_class: 'bg-[#F59E0B]', initials: 'LB' },
      { id: 5, name: 'Student One User', username: 'student1', password: 'password', role: 'Student', email: 'student1@school.edu', last_login: '-', avatar_class: 'bg-[#3B82F6]', initials: 'SO' }
    ];

    for (const user of users) {
      await connection.execute(
        `INSERT INTO USERS (id, name, username, password, role, email, last_login, avatar_class, initials) 
         VALUES (:id, :name, :username, :password, :role, :email, :last_login, :avatar_class, :initials)`,
        user,
        { autoCommit: true }
      );
    }
    console.log('Users seeded.');

    // Seed Departments
    const departments = [
      { departmentid: 1, departmentname: 'Science', description: 'Department of Science' },
      { departmentid: 2, departmentname: 'Information Technology', description: 'Department of IT' },
      { departmentid: 3, departmentname: 'Mathematics', description: 'Department of Mathematics' },
      { departmentid: 4, departmentname: 'Commerce', description: 'Department of Commerce' },
      { departmentid: 5, departmentname: 'English', description: 'Department of English' },
      { departmentid: 6, departmentname: 'Fine Arts', description: 'Department of Fine Arts' },
      { departmentid: 7, departmentname: 'Physical Education', description: 'Department of Physical Education' },
      { departmentid: 8, departmentname: 'Engineering', description: 'Department of Engineering' },
      { departmentid: 9, departmentname: 'Medicine', description: 'Department of Medicine' },
      { departmentid: 10, departmentname: 'Law', description: 'Department of Law' }
    ];
    for (const d of departments) {
      await connection.execute(
        `INSERT INTO DEPARTMENT (departmentid, departmentname, description)
         VALUES (:departmentid, :departmentname, :description)`,
        d,
        { autoCommit: true }
      );
    }
    console.log('Departments seeded.');

    // Seed Teacher
    const teachers = [
      { teacherid: 1, userid: 2, qualification: 'BSc Education', specialization: 'Biology', salary: 120000, yearsexperience: 8, departmentid: 1 }
    ];
    for (const t of teachers) {
      await connection.execute(
        `INSERT INTO TEACHER (teacherid, userid, qualification, specialization, salary, yearsexperience, departmentid)
         VALUES (:teacherid, :userid, :qualification, :specialization, :salary, :yearsexperience, :departmentid)`,
        t,
        { autoCommit: true }
      );
    }
    console.log('Teachers seeded.');

    // Seed Librarian
    const librarians = [
      { librarianid: 1, userid: 4 }
    ];
    for (const l of librarians) {
      await connection.execute(
        `INSERT INTO LIBRARIAN (librarianid, userid) VALUES (:librarianid, :userid)`,
        l,
        { autoCommit: true }
      );
    }
    console.log('Librarians seeded.');

    // Seed Students
    const students = [
      { studentid: 1, userid: 5, admissionno: 'ADM001', fullname: 'Student One', gender: 'Female', dob: '2012-03-15', medicalinfo: 'None', guardianname: 'Parent One', classname: '7-A', academicyear: 2026, status: 'ACTIVE' }
    ];
    for (const s of students) {
      await connection.execute(
        `INSERT INTO STUDENT (studentid, userid, admissionno, fullname, gender, dob, medicalinfo, guardianname, classname, academicyear, status)
         VALUES (:studentid, :userid, :admissionno, :fullname, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), :medicalinfo, :guardianname, :classname, :academicyear, :status)`,
        s,
        { autoCommit: true }
      );
    }
    console.log('Students seeded.');

    // Seed Parents link
    const parents = [
      { parentid: 1, userid: 1, studentid: 1, relationship: 'Parent' }
    ];
    for (const p of parents) {
      await connection.execute(
        `INSERT INTO PARENT (parentid, userid, studentid, relationship)
         VALUES (:parentid, :userid, :studentid, :relationship)`,
        p,
        { autoCommit: true }
      );
    }
    console.log('Parents link seeded.');

    // Seed Subjects
    const subjects = [
      { subjectid: 1, subjectcode: 'MTH101', subjectname: 'Mathematics', credithours: 4, teacherid: 1 },
      { subjectid: 2, subjectcode: 'SCI101', subjectname: 'Science', credithours: 3, teacherid: 1 },
      { subjectid: 3, subjectcode: 'ENG101', subjectname: 'English', credithours: 3, teacherid: 1 },
      { subjectid: 4, subjectcode: 'HIS201', subjectname: 'History', credithours: 2, teacherid: 1 }
    ];
    for (const sub of subjects) {
      await connection.execute(
        `INSERT INTO SUBJECT (subjectid, subjectcode, subjectname, credithours, teacherid)
         VALUES (:subjectid, :subjectcode, :subjectname, :credithours, :teacherid)`,
        sub,
        { autoCommit: true }
      );
    }
    console.log('Subjects seeded.');

    // Seed Timetable
    const timetable = [
      { id: 1, day_of_week: 'Monday', time_slot: '8:30 AM - 9:15 AM', class_name: 'Grade 7-A', subject: 'Mathematics', room: 'Room 101' },
      { id: 2, day_of_week: 'Wednesday', time_slot: '8:30 AM - 9:15 AM', class_name: 'Grade 7-A', subject: 'Mathematics', room: 'Room 101' },
      { id: 3, day_of_week: 'Friday', time_slot: '8:30 AM - 9:15 AM', class_name: 'Grade 7-A', subject: 'Mathematics', room: 'Room 101' },
      { id: 4, day_of_week: 'Tuesday', time_slot: '9:15 AM - 10:00 AM', class_name: 'Grade 8-B', subject: 'Science', room: 'Lab 1' },
      { id: 5, day_of_week: 'Thursday', time_slot: '9:15 AM - 10:00 AM', class_name: 'Grade 8-B', subject: 'Science', room: 'Lab 1' }
    ];
    for (const tt of timetable) {
      await connection.execute(
        `INSERT INTO TIMETABLE (id, day_of_week, time_slot, class_name, subject, room)
         VALUES (:id, :day_of_week, :time_slot, :class_name, :subject, :room)`,
        tt,
        { autoCommit: true }
      );
    }
    console.log('Timetable seeded.');

    // Seed Attendance
    const attendance = [
      { id: 1, student_id: 1, attendance_date: '2026-06-01', status: 'Present' },
      { id: 2, student_id: 1, attendance_date: '2026-06-02', status: 'Present' }
    ];
    for (const att of attendance) {
      await connection.execute(
        `INSERT INTO ATTENDANCE (id, student_id, attendance_date, status)
         VALUES (:id, :student_id, :attendance_date, :status)`,
        att,
        { autoCommit: true }
      );
    }
    console.log('Attendance seeded.');

    // Seed Fees
    const fees = [
      { id: 'INV-001', student_id: 1, fee_type: 'Tuition Fee', amount: 350, due_date: '2026-06-01', status: 'Paid' }
    ];
    for (const fee of fees) {
      await connection.execute(
        `INSERT INTO FEES (id, student_id, fee_type, amount, due_date, status)
         VALUES (:id, :student_id, :fee_type, :amount, :due_date, :status)`,
        fee,
        { autoCommit: true }
      );
    }
    console.log('Fees seeded.');

    // Seed Books
    const books = [
      { bookid: 1, isbn: 'ISBN001', title: 'Introduction to Computer Science', author: 'John Smith', category: 'Technology', availabilitystatus: 'Available' },
      { bookid: 2, isbn: 'ISBN002', title: 'Database Systems', author: 'Henry Korth', category: 'Database', availabilitystatus: 'Available' },
      { bookid: 3, isbn: 'ISBN003', title: 'Java Programming', author: 'James Gosling', category: 'Programming', availabilitystatus: 'Available' }
    ];
    for (const b of books) {
      await connection.execute(
        `INSERT INTO BOOK (bookid, isbn, title, author, category, availabilitystatus)
         VALUES (:bookid, :isbn, :title, :author, :category, :availabilitystatus)`,
        b,
        { autoCommit: true }
      );
    }
    console.log('Books seeded.');

    // Seed Quiz
    const quizzes = [
      { quizid: 1, subjectid: 1, title: 'Algebra basics', totalmarks: 20, createddate: '2026-06-01', class_name: 'Grade 7-A', time_limit: 20 }
    ];
    for (const q of quizzes) {
      await connection.execute(
        `INSERT INTO QUIZ (quizid, subjectid, title, totalmarks, createddate, class_name, time_limit)
         VALUES (:quizid, :subjectid, :title, :totalmarks, TO_DATE(:createddate, 'YYYY-MM-DD'), :class_name, :time_limit)`,
        q,
        { autoCommit: true }
      );
    }
    console.log('Quizzes seeded.');

    // Seed Quiz Questions
    const questions = [
      { questionid: 1, quizid: 1, questiontext: 'Solve for x: 2x + 5 = 15', optiona: 'x = 5', optionb: 'x = 10', optionc: 'x = 3', optiond: 'x = 8', correctanswer: 'A' }
    ];
    for (const q of questions) {
      await connection.execute(
        `INSERT INTO QUIZ_QUESTION (questionid, quizid, questiontext, optiona, optionb, optionc, optiond, correctanswer)
         VALUES (:questionid, :quizid, :questiontext, :optiona, :optionb, :optionc, :optiond, :correctanswer)`,
        q,
        { autoCommit: true }
      );
    }
    console.log('Quiz questions seeded.');

    // Seed Exams
    const exams = [
      { examid: 1, subjectid: 1, examname: 'Algebra Written Exam', examdate: '2026-06-05', totalmarks: 100, term: 'Term 1', class_name: 'Grade 7-A' },
      { examid: 2, subjectid: 1, examname: 'Calculus Written Quiz', examdate: '2026-06-12', totalmarks: 50, term: 'Term 2', class_name: 'Grade 7-A' }
    ];
    for (const ex of exams) {
      await connection.execute(
        `INSERT INTO EXAM (examid, subjectid, examname, examdate, totalmarks, term, class_name)
         VALUES (:examid, :subjectid, :examname, TO_DATE(:examdate, 'YYYY-MM-DD'), :totalmarks, :term, :class_name)`,
        ex,
        { autoCommit: true }
      );
    }
    console.log('Exams seeded.');

    // Seed Grades
    const grades = [
      { gradeid: 1, examid: 1, studentid: 1, marks: 88, grade: 'A', remarks: 'Strong analytical skills shown.' },
      { gradeid: 2, examid: 2, studentid: 1, marks: 45, grade: 'A+', remarks: 'Excellent score in calculus.' }
    ];
    for (const gr of grades) {
      await connection.execute(
        `INSERT INTO GRADE (gradeid, examid, studentid, marks, grade, remarks)
         VALUES (:gradeid, :examid, :studentid, :marks, :grade, :remarks)`,
        gr,
        { autoCommit: true }
      );
    }
    console.log('Grades seeded.');

    // Seed Events
    console.log('Seeding school events...');
    const events = [
      { id: 1, title: 'Annual Sports Day', event_date: '2026-06-20', event_time: '9:00 AM', event_type: 'activity', color: '#5b5fc7' },
      { id: 2, title: 'Parent-Teacher Meeting', event_date: '2026-06-15', event_time: '1:00 PM', event_type: 'meeting', color: '#f97316' },
      { id: 3, title: 'Textbook Distribution', event_date: '2026-06-10', event_time: '8:30 AM', event_type: 'holiday', color: '#3b82f6' },
      { id: 4, title: 'Science Exhibition', event_date: '2026-06-25', event_time: '10:00 AM', event_type: 'activity', color: '#22c55e' }
    ];
    for (const ev of events) {
      await connection.execute(
        `INSERT INTO SCHOOL_EVENT (id, title, event_date, event_time, event_type, color)
         VALUES (:id, :title, :event_date, :event_time, :event_type, :color)`,
        ev,
        { autoCommit: true }
      );
    }
    console.log('School events seeded.');

    // Seed Messages
    console.log('Seeding messages...');
    const nowTs = Date.now();
    const messages = [
      { id: 'demo-1', from_id: '2', from_name: 'Teacher One', from_role: 'Teacher', to_id: '3', to_name: 'Admin User', to_role: 'Admin', subject: 'Timetable updates', body: 'Hello Admin, I have updated the timetable.', timestamp: nowTs - 3600000 * 2, is_read: 0, conv_key: '2__3__Timetable updates' },
      { id: 'demo-2', from_id: '3', from_name: 'Admin User', from_role: 'Admin', to_id: '2', to_name: 'Teacher One', to_role: 'Teacher', subject: 'Timetable updates', body: 'Great, thank you. I will review it shortly.', timestamp: nowTs - 3600000, is_read: 1, conv_key: '2__3__Timetable updates' },
      { id: 'demo-3', from_id: '1', from_name: 'Parent One', from_role: 'Parent', to_id: '3', to_name: 'Admin User', to_role: 'Admin', subject: 'School Holiday Enquiry', body: 'Dear Admin, is tomorrow a school holiday?', timestamp: nowTs - 60000 * 30, is_read: 0, conv_key: '1__3__School Holiday Enquiry' }
    ];
    for (const msg of messages) {
      await connection.execute(
        `INSERT INTO MESSAGES (id, from_id, from_name, from_role, to_id, to_name, to_role, subject, body, timestamp, is_read, conv_key)
         VALUES (:id, :from_id, :from_name, :from_role, :to_id, :to_name, :to_role, :subject, :body, :timestamp, :is_read, :conv_key)`,
        msg,
        { autoCommit: true }
      );
    }
    console.log('Messages seeded.');

    // Create PL/SQL Sections 3 & 4 from database.sql (package + stored procedure)
    console.log('Applying PL/SQL package and stored procedure from database.sql...');
    const section3Idx2 = sqlBlocks.findIndex(b => b.includes('SECTION 3:'));
    const plsqlBlocks = section3Idx2 === -1 ? [] : sqlBlocks.slice(section3Idx2);
    for (let i = 0; i < plsqlBlocks.length; i++) {
      const block = plsqlBlocks[i];
      if (/^(-{2,}.*\n?)+$/.test(block)) continue;
      try {
        await connection.execute(block);
        console.log(`  PL/SQL block ${i + 1}/${plsqlBlocks.length} executed.`);
      } catch (err) {
        console.warn(`  PL/SQL block ${i + 1} warning: ${err.message}`);
      }
    }
    console.log('PL/SQL package and stored procedure applied.');

    console.log('Oracle Database seeding completed successfully.');
  } catch (err) {
    console.error('Error during seeding:', err.message);
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

runSeed();
