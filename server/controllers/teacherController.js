import oracledb from 'oracledb';
import { executeQuery } from '../config/db.js';

export async function getTeacherData(req, res) {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Execute PL/SQL stored procedure
        const procedureResult = await connection.execute(
            `BEGIN GET_TEACHER_DASHBOARD_DATA(:students, :timetable); END;`,
            {
                students: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                timetable: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Consume students cursor
        const studentsCursor = procedureResult.outBinds.students;
        const studentsRows = [];
        let row;
        while ((row = await studentsCursor.getRow())) {
            studentsRows.push(row);
        }
        await studentsCursor.close();

        // Consume timetable cursor
        const timetableCursor = procedureResult.outBinds.timetable;
        const timetableRows = [];
        while ((row = await timetableCursor.getRow())) {
            timetableRows.push(row);
        }
        await timetableCursor.close();

        // Format schedule map to match ScheduleTable expectations
        const schedule = {};
        timetableRows.forEach(t => {
            const timeSlot = t.TIME_SLOT;
            const day = t.DAY_OF_WEEK;

            if (!schedule[timeSlot]) {
                schedule[timeSlot] = {};
            }

            schedule[timeSlot][day] = {
                className: t.CLASS_NAME,
                subject: t.SUBJECT,
                room: t.ROOM,
                hasClass: true,
                color: getColorForSubject(t.SUBJECT)
            };
        });

        // Fetch quizzes and map questions
        const quizzesRes = await executeQuery(
            `SELECT q.quizid AS id, q.title, q.class_name, q.time_limit, s.subjectname AS subject 
       FROM QUIZ q 
       LEFT JOIN SUBJECT s ON q.subjectid = s.subjectid`
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

        // Derive generic teacher dashboard stats
        const totalStudents = studentsRows.length;
        // Today's classes count
        const todayClasses = 5;
        const avgAttendance = Math.round(
            studentsRows.reduce((sum, s) => sum + s.ATTENDANCE_RATE, 0) / (totalStudents || 1)
        );

        res.json({
            stats: {
                greeting: "Good morning, Teacher One!",
                totalStudents,
                todayClasses,
                avgAttendance,
                pendingMarks: 3
            },
            students: studentsRows.map(s => {
                const parts = (s.GRADE || '').split('-');
                return {
                    id: s.ID,
                    rollNo: s.ROLL_NO,
                    name: s.NAME,
                    grade: parts[0] || s.GRADE || '',
                    section: parts[1] || 'A',
                    gpa: 3.8, // Mock GPA since STUDENT table does not have a GPA column
                    attendanceRate: s.ATTENDANCE_RATE,
                    status: s.STATUS || 'ACTIVE'
                };
            }),
            weeklySchedule: {
                timeSlots: [
                    "8:30 AM - 9:15 AM",
                    "9:15 AM - 10:00 AM",
                    "10:00 AM - 10:45 AM",
                    "10:45 AM - 11:00 AM",
                    "11:00 AM - 11:45 AM",
                    "11:45 AM - 12:15 PM",
                    "12:15 PM - 12:45 PM",
                    "12:45 PM - 1:30 PM",
                    "1:30 PM - 2:15 PM"
                ],
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                schedule: schedule
            },
            quizzes
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing database connection:', err);
            }
        }
    }
}

export async function saveAttendance(req, res) {
    const { students, date, className, subject } = req.body;
    try {
        for (const s of students) {
            // Check if attendance already logged for this student and date
            const checkResult = await executeQuery(
                `SELECT id FROM ATTENDANCE WHERE student_id = :studentId AND attendance_date = :attendanceDate`,
                { studentId: s.id, attendanceDate: date }
            );

            if (checkResult.rows.length > 0) {
                // Update
                await executeQuery(
                    `UPDATE ATTENDANCE SET status = :status WHERE id = :id`,
                    { status: s.status, id: checkResult.rows[0].ID }
                );
            } else {
                // Insert
                const nextIdRes = await executeQuery('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM ATTENDANCE');
                const nextId = nextIdRes.rows[0].NEXT_ID;

                await executeQuery(
                    `INSERT INTO ATTENDANCE (id, student_id, attendance_date, status) VALUES (:nextId, :studentId, :attendanceDate, :status)`,
                    { nextId, studentId: s.id, attendanceDate: date, status: s.status }
                );
            }
        }

        res.json({ success: true, message: 'Attendance records updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getAttendanceByDate(req, res) {
    const { date } = req.query;
    try {
        const result = await executeQuery(
            `SELECT student_id AS studentId, status FROM ATTENDANCE WHERE attendance_date = :attendanceDate`,
            { attendanceDate: date }
        );
        res.json({ success: true, attendance: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getExams(req, res) {
    const { subjectId, className, term } = req.query;
    try {
        const examsRes = await executeQuery(
            `SELECT examid AS id, subjectid AS subject_id, examname AS exam_name, 
              TO_CHAR(examdate, 'YYYY-MM-DD') AS exam_date, totalmarks AS total_marks,
              term, class_name
       FROM EXAM 
       WHERE subjectid = :subjectId AND class_name = :className AND term = :term`,
            { subjectId, className, term }
        );

        const examsList = [];
        for (const exam of examsRes.rows) {
            const gradesRes = await executeQuery(
                `SELECT gradeid AS id, studentid AS student_id, marks, grade, remarks 
         FROM GRADE 
         WHERE examid = :examId`,
                { examId: exam.ID }
            );

            const gradesMap = {};
            gradesRes.rows.forEach(g => {
                gradesMap[g.STUDENT_ID] = {
                    gradeId: g.ID,
                    marks: g.MARKS,
                    grade: g.GRADE,
                    remarks: g.REMARKS
                };
            });

            examsList.push({
                id: exam.ID,
                subjectId: exam.SUBJECT_ID,
                examName: exam.EXAM_NAME,
                examDate: exam.EXAM_DATE,
                totalMarks: exam.TOTAL_MARKS,
                term: exam.TERM,
                className: exam.CLASS_NAME,
                studentGrades: gradesMap
            });
        }

        res.json({ success: true, exams: examsList });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function createExam(req, res) {
    const { subjectId, examName, examDate, totalMarks, term, className } = req.body;
    try {
        const nextIdRes = await executeQuery('SELECT COALESCE(MAX(examid), 0) + 1 AS next_id FROM EXAM');
        const examId = nextIdRes.rows[0].NEXT_ID;

        await executeQuery(
            `INSERT INTO EXAM (examid, subjectid, examname, examdate, totalmarks, term, class_name)
       VALUES (:examId, :subjectId, :examName, TO_DATE(:examDate, 'YYYY-MM-DD'), :totalMarks, :term, :className)`,
            { examId, subjectId, examName, examDate, totalMarks, term, className }
        );

        res.json({ success: true, examId, message: 'Exam created successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function saveGrades(req, res) {
    const { examId, gradesList } = req.body;
    try {
        for (const g of gradesList) {
            const checkRes = await executeQuery(
                `SELECT gradeid FROM GRADE WHERE examid = :examId AND studentid = :studentId`,
                { examId, studentId: g.studentId }
            );

            if (checkRes.rows.length > 0) {
                await executeQuery(
                    `UPDATE GRADE SET marks = :marks, grade = :grade, remarks = :remarks 
           WHERE gradeid = :gradeId`,
                    { marks: g.marks, grade: g.grade, remarks: g.remarks, gradeId: checkRes.rows[0].GRADEID }
                );
            } else {
                const nextIdRes = await executeQuery('SELECT COALESCE(MAX(gradeid), 0) + 1 AS next_id FROM GRADE');
                const gradeId = nextIdRes.rows[0].NEXT_ID;

                await executeQuery(
                    `INSERT INTO GRADE (gradeid, examid, studentid, marks, grade, remarks)
           VALUES (:gradeId, :examId, :studentId, :marks, :grade, :remarks)`,
                    { gradeId, examId, studentId: g.studentId, marks: g.marks, grade: g.grade, remarks: g.remarks }
                );
            }
        }
        res.json({ success: true, message: 'Grades saved successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

function getColorForSubject(subject) {
    switch (subject?.toLowerCase()) {
        case 'mathematics':
        case 'math': return 'bg-blue-100 border-blue-200';
        case 'science': return 'bg-green-100 border-green-200';
        case 'english': return 'bg-purple-100 border-purple-200';
        default: return 'bg-pink-100 border-pink-200';
    }
}
