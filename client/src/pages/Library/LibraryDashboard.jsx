import { useState, useEffect } from "react";
import { api } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import {
  BookOpen,
  Users,
  BookMarked,
  AlertTriangle,
  History,
  Plus,
  Menu,
  Clock
} from "lucide-react";
import ProfilePage from "../ProfilePage";
import { useDialog, Input, Btn } from "../../components/UI";
import MessagesPage from "../MessagesPage";
import Header from "../../components/Header";
import { PageLoader } from "../../components/NotificationSystem";


// ─── STYLING CLASSES ─────────────────────────────────────────────────────────
const fieldBaseClass = "w-full rounded-lg border px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-indigo-600";
const selectBaseClass = "w-full rounded-lg border px-3 py-2 text-[13px] text-gray-800 outline-none bg-white focus:border-indigo-600";

export default function LibraryDashboard({ onRoleChange, currentUser }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { alert, confirm, DialogHost } = useDialog();

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form states
  const [bookForm, setBookForm] = useState({ title: "", author: "", available: 1 });
  const [editingBookId, setEditingBookId] = useState(null);
  const [editBookForm, setEditBookForm] = useState({ title: "", author: "", available: 1 });
  const [issueForm, setIssueForm] = useState({ bookTitle: "", studentName: "" });

  const fetchData = async () => {
    try {
      const data = await api.getLibraryData();
      setBooks(data.books || []);
      setStudents(data.students || []);
      setTransactions(data.transactions || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching library data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Live updates: poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!bookForm.title || !bookForm.author) return;
    try {
      await api.addBook(bookForm);
      setBookForm({ title: "", author: "", available: 1 });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      await alert("Error adding book: " + err.message, "error", "Error");
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!issueForm.bookTitle || !issueForm.studentName) return;
    try {
      await api.issueBook({
        bookTitle: issueForm.bookTitle,
        studentName: issueForm.studentName
      });
      setIssueForm({ bookTitle: "", studentName: "" });
      setShowIssueModal(false);
      fetchData();
    } catch (err) {
      await alert("Error issuing book: " + err.message, "error", "Error");
    }
  };

  const handleReturnBook = async (txId) => {
    try {
      await api.returnBook(txId);
      fetchData();
    } catch (err) {
      await alert("Error returning book: " + err.message, "error", "Error");
    }
  };

  const handleApproveRequest = async (txId, bookTitle, studentName) => {
    const ok = await confirm(
      `Do you want to approve the request for "${bookTitle}" by student "${studentName}"?`,
      "Approve Request?",
      "info",
      "Approve"
    );
    if (!ok) return;
    try {
      await api.approveBorrowRequest(txId);
      await alert("Borrow request approved successfully!", "success", "Success");
      fetchData();
    } catch (err) {
      await alert("Error approving request: " + err.message, "error", "Error");
    }
  };

  const handleRejectRequest = async (txId, bookTitle, studentName) => {
    const ok = await confirm(
      `Do you want to reject the request for "${bookTitle}" by student "${studentName}"?`,
      "Reject Request?",
      "delete",
      "Reject"
    );
    if (!ok) return;
    try {
      await api.rejectBorrowRequest(txId);
      await alert("Borrow request rejected.", "success", "Rejected");
      fetchData();
    } catch (err) {
      await alert("Error rejecting request: " + err.message, "error", "Error");
    }
  };

  const handleEditClick = (book) => {
    setEditingBookId(book.id);
    setEditBookForm({ title: book.title, author: book.author, available: book.totalCopies });
    setShowEditModal(true);
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    if (!editBookForm.title || !editBookForm.author) return;
    try {
      await api.updateBook(editingBookId, editBookForm);
      setShowEditModal(false);
      await alert("Book details updated successfully!", "success", "Success");
      fetchData();
    } catch (err) {
      await alert("Error updating book: " + err.message, "error", "Error");
    }
  };

  const handleDeleteBook = async (id, title) => {
    const ok = await confirm(
      `This will permanently remove the book "${title}" and all its copies from the catalog.`,
      `Delete Book?`, 'delete', 'Delete Book'
    );
    if (!ok) return;
    try {
      await api.deleteBook(id);
      await alert("Book deleted successfully!", "success", "Deleted");
      fetchData();
    } catch (err) {
      await alert("Error deleting book: " + err.message, "error", "Delete Failed");
    }
  };

  // Derive stats
  const totalBooks = books.reduce((sum, b) => sum + b.totalCopies, 0);
  const availableBooks = books.reduce((sum, b) => sum + b.available, 0);
  const issuedBooks = transactions.filter(t => t.status === 'Issued').length;
  const pendingRequests = transactions.filter(t => t.status === 'Requested').length;

  const renderContent = () => {
    if (loading) {
      return <PageLoader message="Fetching book catalog and issue transactions from Oracle database..." />;
    }


    if (activePage === "dashboard") {
      const stats = [
        { title: "Total Cataloged Books", value: totalBooks, icon: <BookOpen className="w-6 h-6" /> },
        { title: "Available In Stock", value: availableBooks, icon: <BookMarked className="w-6 h-6" /> },
        { title: "Active Issued Books", value: issuedBooks, icon: <Users className="w-6 h-6" /> },
        { title: "Pending Borrow Requests", value: pendingRequests, icon: <Clock className="w-6 h-6" /> },
      ];

      return (
        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold">Welcome to Library Management</h2>
            <p className="text-sm mt-1">Manage books, student issues, and return logs efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{s.title}</p>
                  <h2 className="text-3xl font-bold mt-2 text-gray-800">{s.value}</h2>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg">
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> Recent Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100 pb-2">
                      <th className="pb-3 font-semibold">Book Title</th>
                      <th className="pb-3 font-semibold">Issued To</th>
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-3 font-semibold text-gray-800">{t.book}</td>
                        <td className="py-3 text-gray-600">{t.user}</td>
                        <td className="py-3 text-gray-500 text-xs">{t.date}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.status === 'Returned' ? 'bg-green-50 text-green-700' :
                            t.status === 'Issued' ? 'bg-amber-50 text-amber-700' :
                            t.status === 'Requested' ? 'bg-blue-50 text-blue-700' :
                            t.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {t.status === 'Issued' && (
                            <button
                              onClick={() => handleReturnBook(t.id)}
                              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-2 py-1 rounded transition cursor-pointer border-0"
                            >
                              Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-400">No transactions recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-5 rounded-xl shadow border border-gray-100 flex flex-col gap-4">
              <h3 className="font-bold text-gray-800 mb-1">Quick Actions</h3>
              
              <button
                onClick={() => {
                  setBookForm({ title: "", author: "", available: 1 });
                  setShowAddModal(true);
                }}
                className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-1.5 transition font-semibold border-0 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add New Book
              </button>

              <button
                onClick={() => {
                  if (books.length === 0) return alert("No books available in catalog!");
                  const availableBook = books.find(b => b.available > 0);
                  setIssueForm({ bookTitle: availableBook ? availableBook.title : "", studentName: students[0]?.name || "" });
                  setShowIssueModal(true);
                }}
                className="w-full p-3 border border-indigo-200 hover:bg-indigo-50/50 text-indigo-600 rounded-lg transition font-semibold bg-transparent cursor-pointer"
              >
                Issue Book
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activePage === "books") {
      return (
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Book Catalog</h2>
              <p className="text-sm text-gray-500 mt-0.5">List of books available in the system</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-semibold flex items-center gap-1 cursor-pointer border-0"
            >
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 pb-2">
                  <th className="pb-3 font-semibold">Title</th>
                  <th className="pb-3 font-semibold">Author</th>
                  <th className="pb-3 font-semibold">Total Copies</th>
                  <th className="pb-3 font-semibold">Available Copies</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{b.title}</td>
                    <td className="py-3 text-gray-600">{b.author}</td>
                    <td className="py-3 text-gray-600">{b.totalCopies}</td>
                    <td className="py-3 font-medium text-gray-800">{b.available}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.available > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {b.available > 0 ? `In Stock (${b.available}/${b.totalCopies})` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-650 font-semibold px-2.5 py-1 rounded transition cursor-pointer border-0 outline-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-650 font-semibold px-2.5 py-1 rounded transition cursor-pointer border-0 outline-none"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activePage === "requests") {
      const borrowRequests = transactions.filter(t => t.status === 'Requested');

      return (
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Borrow Requests</h2>
            <p className="text-sm text-gray-500 mt-0.5">Approve or reject student book borrow requests</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 pb-2">
                  <th className="pb-3 font-semibold">Book Title</th>
                  <th className="pb-3 font-semibold">Requested By</th>
                  <th className="pb-3 font-semibold">Request Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowRequests.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 font-semibold text-gray-800">{r.book}</td>
                    <td className="py-3 text-gray-600">{r.user}</td>
                    <td className="py-3 text-gray-500 text-xs">{r.date}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => handleApproveRequest(r.id, r.book, r.user)}
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer border-0 outline-none"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(r.id, r.book, r.user)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-650 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer border-0 outline-none"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {borrowRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No pending borrow requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activePage === "transactions") {
      return (
        <div className="bg-white p-5 rounded-xl shadow border border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Transaction History</h2>
            <p className="text-sm text-gray-500 mb-6">List of all issues and returns</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-200 pb-2">
                  <th className="pb-3 font-semibold">Tx ID</th>
                  <th className="pb-3 font-semibold">Book Title</th>
                  <th className="pb-3 font-semibold">Issued To</th>
                  <th className="pb-3 font-semibold">Transaction Date</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 text-gray-500">#{t.id}</td>
                    <td className="py-3 font-semibold text-gray-800">{t.book}</td>
                    <td className="py-3 text-gray-600">{t.user}</td>
                    <td className="py-3 text-gray-500 text-xs">{t.date}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'Returned' ? 'bg-green-50 text-green-700' :
                        t.status === 'Issued' ? 'bg-amber-50 text-amber-700' :
                        t.status === 'Requested' ? 'bg-blue-50 text-blue-700' :
                        t.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {t.status === 'Issued' && (
                        <button
                          onClick={() => handleReturnBook(t.id)}
                          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-2 py-1 rounded transition cursor-pointer border-0"
                        >
                          Return Book
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activePage === "profile") {
      return <ProfilePage currentUser={currentUser} />;
    }

    if (activePage === "messages") {
      return <MessagesPage currentUser={currentUser} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5fb] font-sans text-gray-800 w-full relative">
      <DialogHost />
      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentPage={activePage}
        setCurrentPage={setActivePage}
        onRoleChange={onRoleChange}
        currentUser={currentUser}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          portalTitle="Library Management"
          currentUser={currentUser}
          onNavigateMessages={() => setActivePage("messages")}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
            {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Add Book to Catalog</h3>
            <form onSubmit={handleAddBook} className="space-y-4">
              <Input
                label="Book Title *"
                placeholder="e.g. Clean Code"
                value={bookForm.title}
                onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
              />
              <Input
                label="Author *"
                placeholder="e.g. Robert C. Martin"
                value={bookForm.author}
                onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
              />
              <Input
                label="Copies Count *"
                type="number"
                placeholder="e.g. 5"
                value={bookForm.available}
                onChange={e => setBookForm({ ...bookForm, available: e.target.value })}
              />
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 justify-center"
                >
                  Cancel
                </Btn>
                <Btn
                  type="submit"
                  className="flex-1 justify-center"
                >
                  Add Book
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[420px] rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Edit Book Details</h3>
            <form onSubmit={handleUpdateBook} className="space-y-4">
              <Input
                label="Book Title *"
                placeholder="e.g. Clean Code"
                value={editBookForm.title}
                onChange={e => setEditBookForm({ ...editBookForm, title: e.target.value })}
              />
              <Input
                label="Author *"
                placeholder="e.g. Robert C. Martin"
                value={editBookForm.author}
                onChange={e => setEditBookForm({ ...editBookForm, author: e.target.value })}
              />
              <Input
                label="Copies Count *"
                type="number"
                placeholder="e.g. 5"
                value={editBookForm.available}
                onChange={e => setEditBookForm({ ...editBookForm, available: e.target.value })}
              />
              <div className="flex gap-3 pt-3 border-t border-gray-100">
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 justify-center"
                >
                  Cancel
                </Btn>
                <Btn
                  type="submit"
                  className="flex-1 justify-center"
                >
                  Save Changes
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4">
          <div className="w-[420px] rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Issue Book</h3>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Select Book</label>
                <select
                  value={issueForm.bookTitle}
                  onChange={e => setIssueForm({ ...issueForm, bookTitle: e.target.value })}
                  className={selectBaseClass}
                >
                  <option value="">-- Select a book --</option>
                  {books.filter(b => b.available > 0).map(b => (
                    <option key={b.id} value={b.title}>{b.title} — {b.author} ({b.available} cop{b.available === 1 ? 'y' : 'ies'} available)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Student Name</label>
                <select
                  value={issueForm.studentName}
                  onChange={e => setIssueForm({ ...issueForm, studentName: e.target.value })}
                  className={selectBaseClass}
                >
                  {students.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 p-2 border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-semibold cursor-pointer bg-white text-gray-707"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer border-0"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}