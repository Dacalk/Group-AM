import { executeQuery } from '../config/db.js';

export async function getParentData(req, res) {
  const { parentId } = req.query;
  const pId = parentId || 1; // Default to Parent One (ID 1) if not logged in
  try {
    // 1. Fetch children profiles linked through the PARENT bridge table
    const childrenRes = await executeQuery(
      `SELECT s.studentid AS id, s.fullname AS name, s.admissionno AS roll_no, s.classname AS grade, 
              s.dob, s.gender, s.status, u.email, u.username, u.last_login,
              COALESCE(
                (SELECT ROUND(COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) * 100 / NULLIF(COUNT(*), 0))
                 FROM ATTENDANCE a WHERE a.student_id = s.studentid),
                95
              ) AS attendance_rate
       FROM STUDENT s
       JOIN PARENT p ON s.studentid = p.studentid
       LEFT JOIN USERS u ON s.userid = u.id
       WHERE p.userid = :pId`,
      { pId }
    );

    const children = childrenRes.rows.map(c => {
      const parts = (c.GRADE || '').split('-');
      return {
        id: c.ID,
        name: c.NAME,
        initials: c.NAME.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        grade: parts[0] || c.GRADE || '',
        section: parts[1] || 'A',
        rollNo: c.ROLL_NO,
        dob: c.DOB,
        gender: c.GENDER,
        attendance: c.ATTENDANCE_RATE,
        status: c.STATUS || 'ACTIVE',
        username: c.USERNAME || c.NAME.toLowerCase().replace(' ', '.'),
        email: c.EMAIL || `${c.NAME.toLowerCase().replace(' ', '.')}@school.edu`,
        lastLogin: c.LAST_LOGIN || '-'
      };
    });

    // 2. Fees section bypassed (removed for Sri Lankan government school base system)
    const fees = [];

    // 3. Fetch attendance calendar data
    const attendanceMap = {};
    if (children.length > 0) {
      const studentIds = children.map(c => c.id);
      const placeHolders = studentIds.map((_, i) => `:id${i}`).join(', ');
      const binds = {};
      studentIds.forEach((id, i) => { binds[`id${i}`] = id; });

      const attRes = await executeQuery(
        `SELECT a.attendance_date, a.status, s.fullname as child_name 
         FROM ATTENDANCE a JOIN STUDENT s ON a.student_id = s.studentid 
         WHERE a.student_id IN (${placeHolders})`,
        binds
      );

      children.forEach(c => {
        attendanceMap[c.name] = { June: {}, May: {} }; // defaults
      });

      attRes.rows.forEach(a => {
        const childName = a.CHILD_NAME;
        const dateStr = a.ATTENDANCE_DATE; // e.g. "2026-06-03"
        const status = a.STATUS.toLowerCase(); // present, absent, leave
        
        if (!attendanceMap[childName]) {
          attendanceMap[childName] = { June: {}, May: {} };
        }

        // Parse date for calendar month formatting
        const dateObj = new Date(dateStr);
        if (!isNaN(dateObj.getTime())) {
          const month = dateObj.toLocaleString('en-US', { month: 'long' }); // e.g. "June"
          const day = dateObj.getDate();
          
          if (!attendanceMap[childName][month]) {
            attendanceMap[childName][month] = {};
          }
          attendanceMap[childName][month][day] = status;
        }
      });
    }

    res.json({
      children,
      fees,
      attendanceData: attendanceMap
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addChild(req, res) {
  const { name, grade, section, rollNo, dob, gender, parentId } = req.body;
  const pId = parentId || 1; // default John Doe
  try {
    const username = name.toLowerCase().replace(' ', '.');
    const email = `${username}@school.edu`;

    // 1. Insert User account for the student
    const nextUserIdRes = await executeQuery('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM USERS');
    const userId = nextUserIdRes.rows[0].NEXT_ID;
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    await executeQuery(
      `INSERT INTO USERS (id, name, username, password, role, email, last_login, avatar_class, initials) 
       VALUES (:userId, :name, :username, 'password', 'Parent', :email, '-', 'bg-[#3B82F6]', :initials)`,
      { userId, name, username, email, initials }
    );

    // 2. Insert Student profile
    const nextStudentIdRes = await executeQuery('SELECT COALESCE(MAX(studentid), 0) + 1 AS next_id FROM STUDENT');
    const studentId = nextStudentIdRes.rows[0].NEXT_ID;
    const classname = `${grade}-${section}`;

    // Get parent name for guardianname
    const parentRes = await executeQuery('SELECT name FROM USERS WHERE id = :pId', { pId });
    const guardianname = parentRes.rows.length > 0 ? parentRes.rows[0].NAME : 'Guardian';

    await executeQuery(
      `INSERT INTO STUDENT (studentid, userid, admissionno, fullname, gender, dob, medicalinfo, guardianname, classname, academicyear, status)
       VALUES (:studentId, :userId, :rollNo, :name, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), 'None', :guardianname, :classname, 2026, 'ACTIVE')`,
      { studentId, userId, rollNo, name, gender, dob, guardianname, classname }
    );

    // 3. Insert Parent bridge record
    const nextParentIdRes = await executeQuery('SELECT COALESCE(MAX(parentid), 0) + 1 AS next_id FROM PARENT');
    const parentLinkId = nextParentIdRes.rows[0].NEXT_ID;

    await executeQuery(
      `INSERT INTO PARENT (parentid, userid, studentid, relationship) 
       VALUES (:parentLinkId, :pId, :studentId, 'Parent')`,
      { parentLinkId, pId, studentId }
    );

    res.json({ success: true, message: 'Child added successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function payInvoice(req, res) {
  const { id } = req.body;
  try {
    await executeQuery(
      `UPDATE FEES SET status = 'Paid' WHERE id = :id`,
      { id }
    );
    res.json({ success: true, message: 'Invoice marked as Paid successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getStudentGrades(req, res) {
  const { studentId } = req.query;
  try {
    const gradesRes = await executeQuery(
      `SELECT g.gradeid AS id, g.marks, g.grade, g.remarks, 
              e.examname AS exam_name, TO_CHAR(e.examdate, 'YYYY-MM-DD') AS exam_date, e.totalmarks AS total_marks, e.term,
              s.subjectname AS subject
       FROM GRADE g
       JOIN EXAM e ON g.examid = e.examid
       LEFT JOIN SUBJECT s ON e.subjectid = s.subjectid
       WHERE g.studentid = :studentId`,
      { studentId }
    );

    const gradesList = gradesRes.rows.map(g => ({
      id: g.ID,
      marks: g.MARKS,
      grade: g.GRADE,
      remarks: g.REMARKS,
      examName: g.EXAM_NAME,
      examDate: g.EXAM_DATE,
      totalMarks: g.TOTAL_MARKS,
      term: g.TERM,
      subject: g.SUBJECT || 'General'
    }));

    res.json({ success: true, grades: gradesList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
