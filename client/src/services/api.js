const API_BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export const api = {
    // Auth
    login: (username, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        }),
    getUsersList: () => request('/auth/users'),
    updatePassword: (userId, currentPassword, newPassword) =>
        request('/auth/update-password', {
            method: 'POST',
            body: JSON.stringify({ userId, currentPassword, newPassword })
        }),

    // Admin
    getAdminData: () => request('/admin/data'),
    addUser: (userData) =>
        request('/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
    updateUser: (id, userData) =>
        request('/admin/users/' + id, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),
    deleteUser: (id) =>
        request('/admin/users/' + id, {
            method: 'DELETE'
        }),
    addSubject: (subjectData) =>
        request('/admin/subjects', {
            method: 'POST',
            body: JSON.stringify(subjectData)
        }),
    updateSubject: (id, subjectData) =>
        request('/admin/subjects/' + id, {
            method: 'PUT',
            body: JSON.stringify(subjectData)
        }),
    deleteSubject: (id) =>
        request('/admin/subjects/' + id, {
            method: 'DELETE'
        }),
    addTimetable: (timetableData) =>
        request('/admin/timetable', {
            method: 'POST',
            body: JSON.stringify(timetableData)
        }),
    updateTimetable: (id, timetableData) =>
        request('/admin/timetable/' + id, {
            method: 'PUT',
            body: JSON.stringify(timetableData)
        }),
    deleteTimetable: (id) =>
        request('/admin/timetable/' + id, {
            method: 'DELETE'
        }),
    addClass: (classData) =>
        request('/admin/classes', {
            method: 'POST',
            body: JSON.stringify(classData)
        }),
    updateClass: (id, classData) =>
        request('/admin/classes/' + id, {
            method: 'PUT',
            body: JSON.stringify(classData)
        }),
    deleteClass: (id) =>
        request('/admin/classes/' + id, {
            method: 'DELETE'
        }),
    createQuiz: (quizData) =>
        request('/admin/quizzes', {
            method: 'POST',
            body: JSON.stringify(quizData)
        }),
    deleteQuiz: (id) =>
        request('/admin/quizzes/' + id, {
            method: 'DELETE'
        }),
    getAuditLogs: () => request('/admin/audit-logs'),
    getStudentsList: () => request('/admin/students-list'),
    getDepartmentsList: () => request('/admin/departments-list'),


    // Teacher
    getTeacherData: () => request('/teacher/data'),
    getAttendance: (date) => request(`/teacher/attendance?date=${date}`),
    saveAttendance: (attendanceData) =>
        request('/teacher/attendance', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        }),
    getExams: (subjectId, className, term) =>
        request(`/teacher/exams?subjectId=${subjectId}&className=${encodeURIComponent(className)}&term=${encodeURIComponent(term)}`),
    createExam: (examData) =>
        request('/teacher/exams', {
            method: 'POST',
            body: JSON.stringify(examData)
        }),
    saveGrades: (gradesData) =>
        request('/teacher/grades', {
            method: 'POST',
            body: JSON.stringify(gradesData)
        }),

    // Parent
    getParentData: (parentId) => request(`/parent/data?parentId=${parentId || 1}`),
    getStudentGrades: (studentId) => request(`/parent/grades?studentId=${studentId}`),
    addChild: (childData) =>
        request('/parent/children', {
            method: 'POST',
            body: JSON.stringify(childData)
        }),
    payInvoice: (invoiceId) =>
        request('/parent/pay-invoice', {
            method: 'POST',
            body: JSON.stringify({ id: invoiceId })
        }),

    // Student
    getStudentData: (userId) => request(`/student/data?userId=${userId}`),
    borrowBook: (bookTitle, studentId) =>
        request('/student/borrow', {
            method: 'POST',
            body: JSON.stringify({ bookTitle, studentId })
        }),

    // Library
    getLibraryData: () => request('/library/data'),
    addBook: (bookData) =>
        request('/library/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        }),
    issueBook: (issueData) =>
        request('/library/issue', {
            method: 'POST',
            body: JSON.stringify(issueData)
        }),
    returnBook: (transactionId) =>
        request('/library/return', {
            method: 'POST',
            body: JSON.stringify({ transactionId })
        }),

    // Events
    getEvents: () => request('/admin/events'),
    addSchoolEvent: (eventData) =>
        request('/admin/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        }),
    deleteSchoolEvent: (id) =>
        request('/admin/events/' + id, {
            method: 'DELETE'
        }),

    // Messages
    getMessages: () => request('/messages'),
    getRecipients: () => request('/messages/recipients'),
    sendMessage: (messageData) =>
        request('/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        }),
    markMessagesRead: (convKey, myId) =>
        request('/messages/read', {
            method: 'POST',
            body: JSON.stringify({ convKey, myId })
        }),
    deleteMessage: (id) =>
        request('/messages/' + id, {
            method: 'DELETE'
        }),
    deleteConversation: (convKey) =>
        request('/messages/delete-conv', {
            method: 'POST',
            body: JSON.stringify({ convKey })
        }),
};
