import oracledb from 'oracledb';
import { executeQuery } from '../config/db.js';

// ─── Helper: write an audit log entry (fire-and-forget — never throws) ─────────

async function auditLog({ userId, username, action, targetType, targetId, details }) {
  try {
    await executeQuery(
      `INSERT INTO AUDIT_LOG (user_id, username, action, target_type, target_id, details)
       VALUES (:userId, :username, :action, :targetType, :targetId, :details)`,
      { userId: userId || null, username: username || 'system', action, targetType: targetType || null, targetId: targetId ? String(targetId) : null, details: details || null }
    );
  } catch (e) {
    console.warn('auditLog write failed:', e.message);
  }
}

// ─── GET ADMIN DATA ─────────────────────────────────────────────────────────────

export async function getAdminData(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `BEGIN :rc := admin_user_pkg.get_all_users(); END;`,
      { rc: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const usersCursor = result.outBinds.rc;
    const usersRows = [];
    let row;
    while ((row = await usersCursor.getRow())) {
      usersRows.push(row);
    }
    await usersCursor.close();
    const usersRes = { rows: usersRows };

    const studentsProfileRes = await executeQuery(`SELECT userid, admissionno, classname, gender, TO_CHAR(dob, 'YYYY-MM-DD') AS dob, medicalinfo FROM STUDENT`);
    const teachersProfileRes = await executeQuery(`SELECT userid, departmentid, specialization, qualification, yearsexperience, salary FROM TEACHER`);
    const parentsProfileRes = await executeQuery(`SELECT userid, studentid, relationship FROM PARENT`);

    const subjectsRes = await executeQuery(`SELECT subjectid AS id, subjectname AS name, subjectcode AS grade FROM SUBJECT`);
    const timetableRes = await executeQuery(
      `SELECT t.id, t.day_of_week, t.time_slot, t.class_name, t.subject, t.room, u.name AS teacher_name
       FROM TIMETABLE t
       LEFT JOIN SUBJECT s ON t.subject = s.subjectname
       LEFT JOIN TEACHER te ON s.teacherid = te.teacherid
       LEFT JOIN USERS u ON te.userid = u.id`
    );
    
    const quizzesRes = await executeQuery(
      `SELECT q.quizid AS id, q.title, q.class_name, q.time_limit, s.subjectname AS subject 
       FROM QUIZ q 
       LEFT JOIN SUBJECT s ON q.subjectid = s.subjectid`
    );
    
    const studentsRes = await executeQuery(
      `SELECT s.studentid AS id, s.fullname AS name, s.admissionno AS roll_no, s.classname AS grade, s.status,
              COALESCE(
                (SELECT ROUND(COUNT(CASE WHEN status = 'Present' THEN 1 END) * 100 / NULLIF(COUNT(*), 0))
                 FROM ATTENDANCE a WHERE a.student_id = s.studentid),
                95
              ) AS attendance_rate
       FROM STUDENT s`
    );
    
    const eventsRes = await executeQuery(
      `SELECT id, title, event_date, event_time, event_type, color 
       FROM SCHOOL_EVENT`
    );
    
    const mcqsRes = await executeQuery(
      `SELECT questionid AS id, quizid AS quiz_id, questiontext AS question, 
              optiona AS option_a, optionb AS option_b, optionc AS option_c, optiond AS option_d, 
              correctanswer AS correct_option 
       FROM QUIZ_QUESTION`
    );
    
    const quizzes = quizzesRes.rows.map(quiz => {
      const mcqs = mcqsRes.rows
        .filter(m => m.QUIZ_ID === quiz.ID)
        .map(m => ({
          id: m.ID,
          question: m.QUESTION,
          options: [m.OPTION_A, m.OPTION_B, m.OPTION_C, m.OPTION_D],
          correctAnswer: m.CORRECT_OPTION
        }));
      return {
        id: quiz.ID,
        title: quiz.TITLE,
        subject: quiz.SUBJECT || 'General',
        className: quiz.CLASS_NAME || 'All Classes',
        timeLimit: quiz.TIME_LIMIT || 30,
        mcqs
      };
    });

    const classesRes = await executeQuery(
      `SELECT c.classroomid AS id, c.classname AS name, c.roomno AS room, c.capacity, 
              u.name AS teacher_name, c.classteacherid AS teacher_id,
              (SELECT COUNT(*) FROM STUDENT s WHERE s.classname = c.classname OR c.classname = 'Grade ' || s.classname OR s.classname = 'Grade ' || c.classname) AS student_count
       FROM CLASSROOM c
       LEFT JOIN TEACHER t ON c.classteacherid = t.teacherid
       LEFT JOIN USERS u ON t.userid = u.id`
    );

    res.json({
      users: usersRes.rows.map(u => {
        const studentProfile = studentsProfileRes.rows.find(s => s.USERID === u.ID);
        const teacherProfile = teachersProfileRes.rows.find(t => t.USERID === u.ID);
        const parentProfile = parentsProfileRes.rows.find(p => p.USERID === u.ID);

        return {
          id: u.ID,
          name: u.NAME,
          username: u.USERNAME,
          role: u.ROLE,
          email: u.EMAIL,
          lastLogin: u.LAST_LOGIN || '-',
          avatarClass: u.AVATAR_CLASS,
          initials: u.INITIALS,
          
          // Student details
          admissionNo: studentProfile ? studentProfile.ADMISSIONNO : '',
          className: studentProfile ? studentProfile.CLASSNAME : '',
          gender: studentProfile ? studentProfile.GENDER : '',
          dob: studentProfile ? studentProfile.DOB : '',
          medicalInfo: studentProfile ? studentProfile.MEDICALINFO : '',

          // Teacher details
          departmentId: teacherProfile ? (teacherProfile.DEPARTMENTID !== null ? String(teacherProfile.DEPARTMENTID) : '') : '',
          specialization: teacherProfile ? teacherProfile.SPECIALIZATION : '',
          qualification: teacherProfile ? teacherProfile.QUALIFICATION : '',
          yearsExperience: teacherProfile ? (teacherProfile.YEARSEXPERIENCE !== null ? String(teacherProfile.YEARSEXPERIENCE) : '') : '',
          salary: teacherProfile ? (teacherProfile.SALARY !== null ? String(teacherProfile.SALARY) : '') : '',

          // Parent details
          studentId: parentProfile ? (parentProfile.STUDENTID !== null ? String(parentProfile.STUDENTID) : '') : '',
          relationship: parentProfile ? parentProfile.RELATIONSHIP : ''
        };
      }),
      students: studentsRes.rows.map(s => {
        const parts = (s.GRADE || '').split('-');
        return {
          id: s.ID,
          name: s.NAME,
          rollNo: s.ROLL_NO,
          grade: parts[0] || s.GRADE || '',
          section: parts[1] || 'A',
          attendance: s.ATTENDANCE_RATE || 95,
          status: s.STATUS || 'ACTIVE'
        };
      }),
      subjects: subjectsRes.rows.map(s => ({
        id: s.ID,
        name: s.NAME,
        grade: s.GRADE
      })),
      classes: classesRes.rows.map(c => ({
        id: c.ID,
        name: c.NAME,
        room: c.ROOM || '',
        capacity: c.CAPACITY || 30,
        teacher: c.TEACHER_NAME || 'None',
        teacherId: c.TEACHER_ID || null,
        students: c.STUDENT_COUNT || 0,
        status: 'Active'
      })),
      timetable: timetableRes.rows.map(t => ({
        id: t.ID,
        day: t.DAY_OF_WEEK,
        timeSlot: t.TIME_SLOT,
        className: t.CLASS_NAME,
        subject: t.SUBJECT,
        room: t.ROOM,
        teacher: t.TEACHER_NAME || 'Ms. Sarah Johnson'
      })),
      events: eventsRes.rows.map(e => ({
        id: e.ID,
        title: e.TITLE,
        date: e.EVENT_DATE,
        time: e.EVENT_TIME,
        type: e.EVENT_TYPE,
        color: e.COLOR
      })),
      quizzes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

// ─── GET AUDIT LOGS ──────────────────────────────────────────────────────────

export async function getAuditLogs(req, res) {
  try {
    const result = await executeQuery(
      `SELECT id, user_id, username, action, target_type, target_id, details,
              TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
       FROM AUDIT_LOG
       ORDER BY created_at DESC`
    );
    res.json({
      success: true,
      logs: result.rows.map(r => ({
        id: r.ID,
        userId: r.USER_ID,
        username: r.USERNAME,
        action: r.ACTION,
        targetType: r.TARGET_TYPE,
        targetId: r.TARGET_ID,
        details: r.DETAILS,
        createdAt: r.CREATED_AT
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── GET STUDENTS LIST (for parent dropdown) ──────────────────────────────────

export async function getStudentsList(req, res) {
  try {
    const result = await executeQuery(
      `SELECT s.studentid AS id, s.fullname AS name, s.admissionno, s.classname
       FROM STUDENT s ORDER BY s.fullname`
    );
    res.json({
      success: true,
      students: result.rows.map(r => ({
        id: r.ID,
        name: r.NAME,
        admissionNo: r.ADMISSIONNO,
        className: r.CLASSNAME
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── GET DEPARTMENTS LIST (for teacher dropdown) ──────────────────────────────

export async function getDepartmentsList(req, res) {
  try {
    const result = await executeQuery(
      `SELECT departmentid AS id, departmentname AS name FROM DEPARTMENT ORDER BY departmentname`
    );
    res.json({
      success: true,
      departments: result.rows.map(r => ({ id: r.ID, name: r.NAME }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── ADD USER (with role-specific profile creation) ──────────────────────────

export async function addUser(req, res) {
  const {
    name, username, password, role, email,
    // Student-specific
    className, gender, dob, admissionNo, medicalInfo,
    // Teacher-specific
    departmentId, specialization, qualification, yearsExperience, salary,
    // Parent-specific
    studentId, relationship
  } = req.body;

  try {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarPalettes = ['bg-[#6C63FF]', 'bg-[#FF6584]', 'bg-[#43B89C]', 'bg-[#F59E0B]', 'bg-[#3B82F6]'];
    const avatarClass = avatarPalettes[Math.floor(Math.random() * avatarPalettes.length)];
    const dbRole = role === 'Librarian' ? 'Library' : role;

    // 1. Insert base USERS record via PL/SQL package
    const result = await executeQuery(
      `BEGIN admin_user_pkg.add_user(:p_name, :p_username, :p_password, :p_role, :p_email, :p_avatar_class, :p_initials, :p_out_msg); END;`,
      {
        p_name: name,
        p_username: username,
        p_password: password,
        p_role: dbRole,
        p_email: email,
        p_avatar_class: avatarClass,
        p_initials: initials,
        p_out_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      },
      { autoCommit: true }
    );
    const message = result.outBinds.p_out_msg;
    if (message && message.includes('ORA-')) {
      return res.status(400).json({ success: false, error: message });
    }

    // 2. Get the newly created user's ID
    const newUserRes = await executeQuery(
      `SELECT id FROM USERS WHERE LOWER(username) = LOWER(:username)`,
      { username }
    );
    const newUserId = newUserRes.rows.length > 0 ? newUserRes.rows[0].ID : null;

    // 3. Role-specific profile records
    if (dbRole === 'Student' && newUserId) {
      const nextStudentRes = await executeQuery('SELECT COALESCE(MAX(studentid), 0) + 1 AS next_id FROM STUDENT');
      const nextStudentId = nextStudentRes.rows[0].NEXT_ID;
      const admNo = admissionNo || `ADM${String(nextStudentId).padStart(3, '0')}`;

      await executeQuery(
        `INSERT INTO STUDENT (studentid, userid, admissionno, fullname, gender, dob, medicalinfo, guardianname, classname, academicyear, status)
         VALUES (:studentid, :userid, :admissionno, :fullname, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), :medicalinfo, 'N/A', :classname, :academicyear, 'ACTIVE')`,
        {
          studentid: nextStudentId,
          userid: newUserId,
          admissionno: admNo,
          fullname: name,
          gender: gender || 'Other',
          dob: dob || '2000-01-01',
          medicalinfo: medicalInfo || 'None',
          classname: className || 'Grade 1-A',
          academicyear: new Date().getFullYear()
        }
      );
    }

    if (dbRole === 'Teacher' && newUserId) {
      const nextTeacherRes = await executeQuery('SELECT COALESCE(MAX(teacherid), 0) + 1 AS next_id FROM TEACHER');
      const nextTeacherId = nextTeacherRes.rows[0].NEXT_ID;

      await executeQuery(
        `INSERT INTO TEACHER (teacherid, userid, qualification, specialization, salary, yearsexperience, departmentid)
         VALUES (:teacherid, :userid, :qualification, :specialization, :salary, :yearsexperience, :departmentid)`,
        {
          teacherid: nextTeacherId,
          userid: newUserId,
          qualification: qualification || 'BSc Education',
          specialization: specialization || 'General',
          salary: parseFloat(salary) || 80000,
          yearsexperience: parseInt(yearsExperience) || 1,
          departmentid: parseInt(departmentId) || 1
        }
      );
    }

    if (dbRole === 'Parent' && newUserId && studentId) {
      const nextParentRes = await executeQuery('SELECT COALESCE(MAX(parentid), 0) + 1 AS next_id FROM PARENT');
      const nextParentId = nextParentRes.rows[0].NEXT_ID;

      await executeQuery(
        `INSERT INTO PARENT (parentid, userid, studentid, relationship)
         VALUES (:parentid, :userid, :studentid, :relationship)`,
        {
          parentid: nextParentId,
          userid: newUserId,
          studentid: parseInt(studentId),
          relationship: relationship || 'Parent'
        }
      );
    }

    if (dbRole === 'Library' && newUserId) {
      const nextLibRes = await executeQuery('SELECT COALESCE(MAX(librarianid), 0) + 1 AS next_id FROM LIBRARIAN');
      const nextLibId = nextLibRes.rows[0].NEXT_ID;
      await executeQuery(
        `INSERT INTO LIBRARIAN (librarianid, userid) VALUES (:librarianid, :userid)`,
        { librarianid: nextLibId, userid: newUserId }
      );
    }

    // 4. Audit log
    await auditLog({
      userId: newUserId,
      username: 'admin',
      action: `Created new ${dbRole} account`,
      targetType: 'USER',
      targetId: newUserId,
      details: `New ${dbRole}: ${name} (${username})`
    });

    res.json({ success: true, message: message || 'User added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── UPDATE USER ─────────────────────────────────────────────────────────────

export async function updateUser(req, res) {
  const { id } = req.params;
  const {
    name, username, password, role, email,
    // Student-specific
    className, gender, dob, admissionNo, medicalInfo,
    // Teacher-specific
    departmentId, specialization, qualification, yearsExperience, salary,
    // Parent-specific
    studentId, relationship
  } = req.body;

  try {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const result = await executeQuery(
      `BEGIN admin_user_pkg.update_user(:p_id, :p_name, :p_username, :p_password, :p_role, :p_email, :p_avatar_class, :p_initials, :p_out_msg); END;`,
      {
        p_id: id,
        p_name: name,
        p_username: username,
        p_password: password || null,
        p_role: role,
        p_email: email,
        p_avatar_class: null,
        p_initials: initials,
        p_out_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      },
      { autoCommit: true }
    );
    const message = result.outBinds.p_out_msg;
    if (message && message.includes('ORA-')) {
      return res.status(400).json({ success: false, error: message });
    }

    // Role-specific sync: delete from other profile tables to avoid dual/conflicting roles
    if (role !== 'Student') await executeQuery(`DELETE FROM STUDENT WHERE userid = :id`, { id });
    if (role !== 'Teacher') await executeQuery(`DELETE FROM TEACHER WHERE userid = :id`, { id });
    if (role !== 'Parent')  await executeQuery(`DELETE FROM PARENT WHERE userid = :id`, { id });
    if (role !== 'Library') await executeQuery(`DELETE FROM LIBRARIAN WHERE userid = :id`, { id });

    // Merge/insert details into the appropriate role profile table
    if (role === 'Student') {
      const nextStudentRes = await executeQuery('SELECT COALESCE(MAX(studentid), 0) + 1 AS next_id FROM STUDENT');
      const nextStudentId = nextStudentRes.rows[0].NEXT_ID;
      const admNo = admissionNo || `ADM${String(nextStudentId).padStart(3, '0')}`;
      
      await executeQuery(
        `MERGE INTO STUDENT d
         USING (SELECT :userid AS userid FROM dual) s
         ON (d.userid = s.userid)
         WHEN MATCHED THEN
           UPDATE SET fullname = :fullname, admissionno = :admissionno, classname = :classname, gender = :gender, dob = TO_DATE(:dob, 'YYYY-MM-DD'), medicalinfo = :medicalinfo
         WHEN NOT MATCHED THEN
           INSERT (studentid, userid, admissionno, fullname, gender, dob, medicalinfo, guardianname, classname, academicyear, status)
           VALUES (:studentid, s.userid, :admissionno, :fullname, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), :medicalinfo, 'N/A', :classname, :academicyear, 'ACTIVE')`,
        {
          userid: id,
          fullname: name,
          admissionno: admNo,
          classname: className || 'Grade 1-A',
          gender: gender || 'Other',
          dob: dob || '2000-01-01',
          medicalinfo: medicalInfo || 'None',
          studentid: nextStudentId,
          academicyear: new Date().getFullYear()
        }
      );
    }

    if (role === 'Teacher') {
      const nextTeacherRes = await executeQuery('SELECT COALESCE(MAX(teacherid), 0) + 1 AS next_id FROM TEACHER');
      const nextTeacherId = nextTeacherRes.rows[0].NEXT_ID;

      await executeQuery(
        `MERGE INTO TEACHER d
         USING (SELECT :userid AS userid FROM dual) s
         ON (d.userid = s.userid)
         WHEN MATCHED THEN
           UPDATE SET qualification = :qualification, specialization = :specialization, salary = :salary, yearsexperience = :yearsexperience, departmentid = :departmentid
         WHEN NOT MATCHED THEN
           INSERT (teacherid, userid, qualification, specialization, salary, yearsexperience, departmentid)
           VALUES (:teacherid, s.userid, :qualification, :specialization, :salary, :yearsexperience, :departmentid)`,
        {
          userid: id,
          qualification: qualification || 'BSc Education',
          specialization: specialization || 'General',
          salary: parseFloat(salary) || 80000,
          yearsexperience: parseInt(yearsExperience) || 1,
          departmentid: parseInt(departmentId) || 1,
          teacherid: nextTeacherId
        }
      );
    }

    if (role === 'Parent' && studentId) {
      const nextParentRes = await executeQuery('SELECT COALESCE(MAX(parentid), 0) + 1 AS next_id FROM PARENT');
      const nextParentId = nextParentRes.rows[0].NEXT_ID;

      await executeQuery(
        `MERGE INTO PARENT d
         USING (SELECT :userid AS userid FROM dual) s
         ON (d.userid = s.userid)
         WHEN MATCHED THEN
           UPDATE SET studentid = :studentid, relationship = :relationship
         WHEN NOT MATCHED THEN
           INSERT (parentid, userid, studentid, relationship)
           VALUES (:parentid, s.userid, :studentid, :relationship)`,
        {
          userid: id,
          studentid: parseInt(studentId),
          relationship: relationship || 'Parent',
          parentid: nextParentId
        }
      );
    }

    if (role === 'Library') {
      const nextLibRes = await executeQuery('SELECT COALESCE(MAX(librarianid), 0) + 1 AS next_id FROM LIBRARIAN');
      const nextLibId = nextLibRes.rows[0].NEXT_ID;

      await executeQuery(
        `MERGE INTO LIBRARIAN d
         USING (SELECT :userid AS userid FROM dual) s
         ON (d.userid = s.userid)
         WHEN NOT MATCHED THEN
           INSERT (librarianid, userid) VALUES (:librarianid, s.userid)`,
        {
          userid: id,
          librarianid: nextLibId
        }
      );
    }

    await auditLog({
      username: 'admin',
      action: `Updated user account`,
      targetType: 'USER',
      targetId: id,
      details: `Updated: ${name} (${username}) — Role: ${role}`
    });
    res.json({ success: true, message: message || 'User updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── DELETE USER ─────────────────────────────────────────────────────────────

export async function deleteUser(req, res) {
  const { id } = req.params;
  const currentUserId = req.headers['x-user-id'];

  if (currentUserId && String(id) === String(currentUserId)) {
    return res.status(400).json({ success: false, error: 'Admins cannot delete their own account.' });
  }

  try {
    // Record who we're deleting before removal
    const userRes = await executeQuery(`SELECT name, username, role FROM USERS WHERE id = :id`, { id });
    const userInfo = userRes.rows[0];

    const result = await executeQuery(
      `BEGIN admin_user_pkg.delete_user(:p_id, :p_out_msg); END;`,
      {
        p_id: id,
        p_out_msg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      },
      { autoCommit: true }
    );
    const message = result.outBinds.p_out_msg;
    if (message && message.includes('ORA-')) {
      return res.status(400).json({ success: false, error: message });
    }
    await auditLog({
      username: 'admin',
      action: `Deleted user account`,
      targetType: 'USER',
      targetId: id,
      details: userInfo ? `Deleted: ${userInfo.NAME} (${userInfo.USERNAME}) — Role: ${userInfo.ROLE}` : `User ID: ${id}`
    });
    res.json({ success: true, message: message || 'User deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// ─── SUBJECT MANAGEMENT ──────────────────────────────────────────────────────

export async function addSubject(req, res) {
  const { name, grade } = req.body;
  try {
    const nextIdRes = await executeQuery('SELECT COALESCE(MAX(subjectid), 0) + 1 AS next_id FROM SUBJECT');
    const nextId = nextIdRes.rows[0].NEXT_ID;
    await executeQuery(
      `INSERT INTO SUBJECT (subjectid, subjectcode, subjectname, credithours, teacherid) 
       VALUES (:nextId, :grade, :name, 3, 1)`,
      { nextId, grade, name }
    );
    await auditLog({ username: 'admin', action: 'Added subject', targetType: 'SUBJECT', targetId: nextId, details: `Subject: ${name} (${grade})` });
    res.json({ success: true, message: 'Subject added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addTimetable(req, res) {
  const { day, timeSlot, className, subject, room } = req.body;
  try {
    const nextIdRes = await executeQuery('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM TIMETABLE');
    const nextId = nextIdRes.rows[0].NEXT_ID;
    await executeQuery(
      `INSERT INTO TIMETABLE (id, day_of_week, time_slot, class_name, subject, room) 
       VALUES (:nextId, :day, :timeSlot, :className, :subject, :room)`,
      { nextId, day, timeSlot, className, subject, room }
    );
    await auditLog({ username: 'admin', action: 'Added timetable slot', targetType: 'TIMETABLE', targetId: nextId, details: `${day} ${timeSlot} — ${subject} in ${room}` });
    res.json({ success: true, message: 'Timetable slot added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addClass(req, res) {
  const { name, teacher, room, capacity } = req.body;
  try {
    const nextIdRes = await executeQuery('SELECT COALESCE(MAX(classroomid), 0) + 1 AS next_id FROM CLASSROOM');
    const nextId = nextIdRes.rows[0].NEXT_ID;

    let teacherId = 1; // Default fallback
    if (teacher) {
      const teachRes = await executeQuery(
        `SELECT t.teacherid FROM TEACHER t 
         JOIN USERS u ON t.userid = u.id 
         WHERE LOWER(u.name) = LOWER(:teacher)`,
        { teacher }
      );
      if (teachRes.rows.length > 0) {
        teacherId = teachRes.rows[0].TEACHERID;
      }
    }

    await executeQuery(
      `INSERT INTO CLASSROOM (classroomid, classname, roomno, capacity, classteacherid)
       VALUES (:nextId, :name, :room, :capacity, :teacherId)`,
      { nextId, name, room, capacity: parseInt(capacity) || 30, teacherId }
    );

    await auditLog({ 
      username: 'admin', 
      action: 'Created class', 
      targetType: 'CLASSROOM', 
      targetId: nextId, 
      details: `Class: ${name} in ${room} (Cap: ${capacity})` 
    });

    res.json({ success: true, message: 'Class registered successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateClass(req, res) {
  const { id } = req.params;
  const { name, teacher, room, capacity } = req.body;
  try {
    let teacherId = 1;
    if (teacher) {
      const teachRes = await executeQuery(
        `SELECT t.teacherid FROM TEACHER t 
         JOIN USERS u ON t.userid = u.id 
         WHERE LOWER(u.name) = LOWER(:teacher)`,
        { teacher }
      );
      if (teachRes.rows.length > 0) {
        teacherId = teachRes.rows[0].TEACHERID;
      }
    }

    await executeQuery(
      `UPDATE CLASSROOM 
       SET classname = :name, roomno = :room, capacity = :capacity, classteacherid = :teacherId 
       WHERE classroomid = :id`,
      { name, room, capacity: parseInt(capacity) || 30, teacherId, id }
    );

    await auditLog({ 
      username: 'admin', 
      action: 'Updated class', 
      targetType: 'CLASSROOM', 
      targetId: id, 
      details: `Class ID: ${id} updated to ${name} in ${room}` 
    });

    res.json({ success: true, message: 'Class updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteClass(req, res) {
  const { id } = req.params;
  try {
    const classRes = await executeQuery(`SELECT classname FROM CLASSROOM WHERE classroomid = :id`, { id });
    const className = classRes.rows.length > 0 ? classRes.rows[0].CLASSNAME : '';

    await executeQuery(`DELETE FROM CLASSROOM WHERE classroomid = :id`, { id });

    await auditLog({ 
      username: 'admin', 
      action: 'Deleted class', 
      targetType: 'CLASSROOM', 
      targetId: id, 
      details: `Deleted class: ${className} (ID: ${id})` 
    });

    res.json({ success: true, message: 'Class deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createQuiz(req, res) {
  const { title, subject, mcqs, className, timeLimit } = req.body;
  try {
    const findSubject = await executeQuery('SELECT subjectid FROM SUBJECT WHERE subjectname = :subject', { subject });
    const subjectId = findSubject.rows.length > 0 ? findSubject.rows[0].SUBJECTID : 1;

    const nextQuizIdRes = await executeQuery('SELECT COALESCE(MAX(quizid), 0) + 1 AS next_id FROM QUIZ');
    const quizId = nextQuizIdRes.rows[0].NEXT_ID;

    await executeQuery(
      `INSERT INTO QUIZ (quizid, subjectid, title, totalmarks, createddate, class_name, time_limit) 
       VALUES (:quizId, :subjectId, :title, :totalMarks, SYSDATE, :className, :timeLimit)`,
      { quizId, subjectId, title, totalMarks: mcqs.length * 10, className, timeLimit: parseInt(timeLimit) || 30 }
    );

    const nextQIdRes = await executeQuery('SELECT COALESCE(MAX(questionid), 0) + 1 AS next_id FROM QUIZ_QUESTION');
    let questionId = nextQIdRes.rows[0].NEXT_ID;

    for (const mcq of mcqs) {
      await executeQuery(
        `INSERT INTO QUIZ_QUESTION (questionid, quizid, questiontext, optiona, optionb, optionc, optiond, correctanswer) 
         VALUES (:questionId, :quizId, :question, :option_a, :option_b, :option_c, :option_d, :correctOption)`,
        { questionId: questionId++, quizId, question: mcq.question, option_a: mcq.options[0], option_b: mcq.options[1], option_c: mcq.options[2], option_d: mcq.options[3], correctOption: mcq.correctAnswer }
      );
    }

    await auditLog({ username: 'admin', action: 'Created quiz', targetType: 'QUIZ', targetId: quizId, details: `Quiz: "${title}" for ${className} (${mcqs.length} questions)` });
    res.json({ success: true, message: 'Quiz created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateSubject(req, res) {
  const { id } = req.params;
  const { name, grade } = req.body;
  try {
    await executeQuery(`UPDATE SUBJECT SET subjectname = :name, subjectcode = :grade WHERE subjectid = :id`, { name, grade, id });
    res.json({ success: true, message: 'Subject updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteSubject(req, res) {
  const { id } = req.params;
  try {
    // 1. Delete quiz questions for any quizzes linked to this subject
    await executeQuery(
      `DELETE FROM QUIZ_QUESTION WHERE quizid IN (SELECT quizid FROM QUIZ WHERE subjectid = :id)`,
      { id }
    );
    // 2. Delete quizzes linked to this subject
    await executeQuery(`DELETE FROM QUIZ WHERE subjectid = :id`, { id });
    // 3. Now safe to delete the subject
    await executeQuery(`DELETE FROM SUBJECT WHERE subjectid = :id`, { id });
    res.json({ success: true, message: 'Subject deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateTimetable(req, res) {
  const { id } = req.params;
  const { day, timeSlot, className, subject, room } = req.body;
  try {
    await executeQuery(
      `UPDATE TIMETABLE SET day_of_week = :day, time_slot = :timeSlot, class_name = :className, subject = :subject, room = :room WHERE id = :id`,
      { day, timeSlot, className, subject, room, id }
    );
    res.json({ success: true, message: 'Timetable entry updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteTimetable(req, res) {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM TIMETABLE WHERE id = :id`, { id });
    res.json({ success: true, message: 'Timetable entry deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteQuiz(req, res) {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM QUIZ_QUESTION WHERE quizid = :id`, { id });
    await executeQuery(`DELETE FROM QUIZ WHERE quizid = :id`, { id });
    res.json({ success: true, message: 'Quiz deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
