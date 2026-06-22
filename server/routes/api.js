import express from 'express';
import { login, getUsers, updatePassword } from '../controllers/authController.js';
import {
  getAdminData,
  addUser,
  addSubject,
  addTimetable,
  addClass,
  updateClass,
  deleteClass,
  createQuiz,
  updateUser,
  deleteUser,
  updateSubject,
  deleteSubject,
  updateTimetable,
  deleteTimetable,
  deleteQuiz,
  getAuditLogs,
  getStudentsList,
  getDepartmentsList
} from '../controllers/adminController.js';

import {
  getTeacherData,
  saveAttendance,
  getAttendanceByDate,
  getExams,
  createExam,
  saveGrades
} from '../controllers/teacherController.js';
import {
  getParentData,
  addChild,
  payInvoice,
  getStudentGrades
} from '../controllers/parentController.js';
import {
  getLibraryData,
  addBook,
  issueBook,
  returnBook,
  borrowBook
} from '../controllers/libraryController.js';
import {
  getEvents,
  addEvent,
  deleteEvent
} from '../controllers/eventController.js';
import {
  getMessages,
  getRecipients,
  sendMessage,
  markAsRead,
  deleteMessage,
  deleteConversation
} from '../controllers/messageController.js';
import { getStudentData } from '../controllers/studentController.js';

const router = express.Router();

// Auth Routes
router.post('/auth/login', login);
router.get('/auth/users', getUsers);
router.post('/auth/update-password', updatePassword);


// Admin Routes
router.get('/admin/data', getAdminData);
router.post('/admin/users', addUser);
router.put('/admin/users/:id', updateUser);
router.delete('/admin/users/:id', deleteUser);

router.post('/admin/subjects', addSubject);
router.put('/admin/subjects/:id', updateSubject);
router.delete('/admin/subjects/:id', deleteSubject);

router.post('/admin/timetable', addTimetable);
router.put('/admin/timetable/:id', updateTimetable);
router.delete('/admin/timetable/:id', deleteTimetable);

router.post('/admin/classes', addClass);
router.put('/admin/classes/:id', updateClass);
router.delete('/admin/classes/:id', deleteClass);
router.post('/admin/quizzes', createQuiz);
router.delete('/admin/quizzes/:id', deleteQuiz);

// Audit Logs
router.get('/admin/audit-logs', getAuditLogs);

// Helper lists for user registration forms
router.get('/admin/students-list', getStudentsList);
router.get('/admin/departments-list', getDepartmentsList);

// Event Calendar Routes
router.get('/admin/events', getEvents);
router.post('/admin/events', addEvent);
router.delete('/admin/events/:id', deleteEvent);

// Message System Routes
router.get('/messages', getMessages);
router.get('/messages/recipients', getRecipients);
router.post('/messages', sendMessage);
router.post('/messages/read', markAsRead);
router.delete('/messages/:id', deleteMessage);
router.post('/messages/delete-conv', deleteConversation);

// Teacher Routes
router.get('/teacher/data', getTeacherData);
router.get('/teacher/attendance', getAttendanceByDate);
router.post('/teacher/attendance', saveAttendance);
router.get('/teacher/exams', getExams);
router.post('/teacher/exams', createExam);
router.post('/teacher/grades', saveGrades);

// Parent Routes
router.get('/parent/data', getParentData);
router.post('/parent/children', addChild);
router.post('/parent/pay-invoice', payInvoice);
router.get('/parent/grades', getStudentGrades);

// Library Routes
router.get('/library/data', getLibraryData);
router.post('/library/books', addBook);
router.post('/library/issue', issueBook);
router.post('/library/return', returnBook);

// Student Routes
router.get('/student/data', getStudentData);
router.post('/student/borrow', borrowBook);

export default router;
