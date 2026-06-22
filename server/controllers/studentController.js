import { executeQuery } from '../config/db.js';

/**
 * GET /api/student/data?userId=<userId>
 * Returns the student's own profile, attendance, timetable, grades overview.
 */
export async function getStudentData(req, res) {
    // ⚠️ userId from query string is always a string — must cast to Number for Oracle NUMBER columns
    const userId = parseInt(req.query.userId, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ success: false, error: 'Invalid userId parameter.' });
    }

    try {
        // 1. Fetch student profile (no subquery to avoid parallel execution issues)
        const profileRes = await executeQuery(
            `SELECT s.studentid AS id, s.fullname AS name, s.admissionno AS roll_no,
              s.classname AS class_name, s.gender, s.status, s.guardianname,
              u.email, u.username, u.avatar_class, u.initials, u.last_login
       FROM STUDENT s
       JOIN USERS u ON s.userid = u.id
       WHERE s.userid = :userId`,
            { userId }
        );

        if (profileRes.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Student profile not found.' });
        }

        const p = profileRes.rows[0];
        const studentId = Number(p.ID);
        const className = p.CLASS_NAME || '';

        // 2. Calculate attendance rate separately — use NO_PARALLEL hint to avoid ORA-12801
        const attRateRes = await executeQuery(
            `SELECT /*+ NO_PARALLEL */ ROUND(COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END) * 100 / NULLIF(COUNT(*), 0)) AS rate
       FROM ATTENDANCE WHERE student_id = :studentId`,
            { studentId }
        );
        const attendanceRate = Number(attRateRes.rows[0]?.RATE) || 0;

        // 3. Fetch attendance records — attendance_date is VARCHAR2, select raw (no TO_CHAR)
        const attRes = await executeQuery(
            `SELECT /*+ NO_PARALLEL */ attendance_date AS att_date, status
       FROM ATTENDANCE
       WHERE student_id = :studentId`,
            { studentId }
        );

        // Build calendar map { month: { day: status } }
        const attendanceMap = {};
        attRes.rows.forEach(a => {
            // attendance_date is stored as 'YYYY-MM-DD' string
            const raw = a.ATT_DATE;
            const dateStr = raw instanceof Date
                ? raw.toISOString().slice(0, 10)
                : String(raw).slice(0, 10);
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                const month = dateObj.toLocaleString('en-US', { month: 'long' });
                const day = dateObj.getDate();
                if (!attendanceMap[month]) attendanceMap[month] = {};
                attendanceMap[month][day] = (a.STATUS || '').toLowerCase();
            }
        });

        // 4. Fetch timetable for student's class — strip "Grade " prefix for matching
        const classKey = className.replace('Grade ', '').trim();
        let ttRows = [];
        if (classKey) {
            const ttRes = await executeQuery(
                `SELECT id, day_of_week, time_slot, class_name, subject, room
         FROM TIMETABLE
         WHERE LOWER(class_name) LIKE '%' || LOWER(:classKey) || '%'
         ORDER BY id`,
                { classKey }
            );
            ttRows = ttRes.rows;
        } else {
            // If no class info, fetch all timetable entries
            const ttRes = await executeQuery(
                `SELECT id, day_of_week, time_slot, class_name, subject, room FROM TIMETABLE ORDER BY id`
            );
            ttRows = ttRes.rows;
        }

        // 5. Fetch grades — use NO_PARALLEL to avoid ORA-12801 on parallel workers
        const gradesRes = await executeQuery(
            `SELECT /*+ NO_PARALLEL */ g.gradeid AS id, g.marks, g.grade, g.remarks,
              e.examname AS exam_name, e.examdate AS exam_date,
              e.totalmarks AS total_marks, e.term,
              s.subjectname AS subject
       FROM GRADE g
       JOIN EXAM e ON g.examid = e.examid
       LEFT JOIN SUBJECT s ON e.subjectid = s.subjectid
       WHERE g.studentid = :studentId`,
            { studentId }
        );

        // 6. Fetch school events (event_date may be VARCHAR2 — no ORDER BY date conversion)
        const eventsRes = await executeQuery(
            `SELECT id, title, event_date, event_time, event_type, color FROM SCHOOL_EVENT`
        );

        // 7. Fetch library books (grouped by title+author so copies are counted, not listed individually)
        const booksRes = await executeQuery(
            `SELECT MIN(bookid) AS id, title, author,
              COUNT(*) AS total_copies,
              SUM(CASE WHEN availabilitystatus = 'Available' THEN 1 ELSE 0 END) AS available_copies
       FROM BOOK
       GROUP BY title, author
       ORDER BY MIN(bookid)`
        );

        // 8. Fetch student's own library transactions
        const myTxRes = await executeQuery(
            `SELECT /*+ NO_PARALLEL */ t.transactionid AS id, b.title AS book_title, b.author,
              t.issuedate AS issue_date,
              t.duedate AS due_date,
              t.transactionstatus AS status
       FROM LIBRARY_TRANSACTION t
       JOIN BOOK b ON t.bookid = b.bookid
       WHERE t.studentid = :studentId
       ORDER BY t.transactionid DESC`,
            { studentId }
        );

        // 9. Fetch quizzes for student's class
        let quizRows = [];
        if (classKey) {
            const quizzesRes = await executeQuery(
                `SELECT q.quizid AS id, q.title, q.class_name, q.time_limit,
                s.subjectname AS subject
         FROM QUIZ q
         LEFT JOIN SUBJECT s ON q.subjectid = s.subjectid
         WHERE LOWER(q.class_name) LIKE '%' || LOWER(:classKey) || '%'
            OR q.class_name IS NULL
         ORDER BY q.quizid DESC`,
                { classKey }
            );
            quizRows = quizzesRes.rows;
        } else {
            const quizzesRes = await executeQuery(
                `SELECT q.quizid AS id, q.title, q.class_name, q.time_limit,
                s.subjectname AS subject
         FROM QUIZ q
         LEFT JOIN SUBJECT s ON q.subjectid = s.subjectid
         ORDER BY q.quizid DESC`
            );
            quizRows = quizzesRes.rows;
        }

        // 10. Fetch quiz questions
        const qQuestRes = await executeQuery(
            `SELECT questionid AS id, quizid AS quiz_id, questiontext AS question,
              optiona AS option_a, optionb AS option_b, optionc AS option_c, optiond AS option_d,
              correctanswer AS correct_option
       FROM QUIZ_QUESTION`
        );

        // ── Map results ───────────────────────────────────────────────────────────

        const quizzes = quizRows.map(q => {
            const mcqs = qQuestRes.rows
                .filter(m => m.QUIZ_ID === q.ID)
                .map(m => ({
                    id: m.ID,
                    question: m.QUESTION,
                    options: [m.OPTION_A, m.OPTION_B, m.OPTION_C, m.OPTION_D],
                    correctAnswer: m.CORRECT_OPTION
                }));
            return {
                id: q.ID,
                title: q.TITLE,
                subject: q.SUBJECT || 'General',
                className: q.CLASS_NAME || 'All',
                timeLimit: q.TIME_LIMIT || 30,
                mcqs
            };
        });

        const formatDate = (val) => {
            if (!val) return null;
            if (val instanceof Date) return val.toISOString().slice(0, 10);
            return String(val).slice(0, 10);
        };

        const grades = gradesRes.rows.map(g => ({
            id: g.ID,
            marks: g.MARKS,
            grade: g.GRADE,
            remarks: g.REMARKS,
            examName: g.EXAM_NAME,
            examDate: formatDate(g.EXAM_DATE),
            totalMarks: g.TOTAL_MARKS,
            term: g.TERM,
            subject: g.SUBJECT || 'General'
        }));

        res.json({
            success: true,
            student: {
                id: studentId,
                name: p.NAME,
                rollNo: p.ROLL_NO,
                className: p.CLASS_NAME,
                gender: p.GENDER,
                status: p.STATUS,
                guardianName: p.GUARDIANNAME,
                email: p.EMAIL,
                username: p.USERNAME,
                avatarClass: p.AVATAR_CLASS,
                initials: p.INITIALS,
                lastLogin: p.LAST_LOGIN,
                attendanceRate
            },
            grades,
            attendanceMap,
            timetable: ttRows.map(t => ({
                id: t.ID,
                day: t.DAY_OF_WEEK,
                timeSlot: t.TIME_SLOT,
                className: t.CLASS_NAME,
                subject: t.SUBJECT,
                room: t.ROOM
            })),
            events: eventsRes.rows.map(e => ({
                id: e.ID,
                title: e.TITLE,
                date: e.EVENT_DATE,
                time: e.EVENT_TIME,
                type: e.EVENT_TYPE,
                color: e.COLOR
            })),
            books: booksRes.rows.map(b => ({
                id: Number(b.ID),
                title: b.TITLE,
                author: b.AUTHOR,
                totalCopies: Number(b.TOTAL_COPIES),
                available: Number(b.AVAILABLE_COPIES)
            })),
            myTransactions: myTxRes.rows.map(t => ({
                id: t.ID,
                bookTitle: t.BOOK_TITLE,
                author: t.AUTHOR,
                issueDate: formatDate(t.ISSUE_DATE),
                dueDate: formatDate(t.DUE_DATE),
                status: t.STATUS
            })),
            quizzes
        });

    } catch (err) {
        console.error('getStudentData error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
}
