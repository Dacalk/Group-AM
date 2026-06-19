import { useState, useEffect } from 'react'
import { api } from './services/api'
import ParentDashboard from './pages/Parent/ParentDashboard'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import LibraryDashboard from './pages/Library/LibraryDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import StudentDashboard from './pages/Student/StudentDashboard'
import { LoginSplash, ToastContainer } from './components/NotificationSystem'

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await api.login(username.trim(), password.trim());
      if (response.success) {
        onLoginSuccess(response.user);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Server error. Please verify Oracle DB connection is up.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoginSplash userName={username.trim() || 'User'} role="Account" />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/60 p-8 rounded-2xl shadow-2xl z-10 backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-2xl shadow-lg mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            EduManage School Suite
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Log in to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/45 border border-red-500/40 text-red-200 text-xs font-semibold rounded-lg text-center flex items-center justify-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin or john.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer border-0 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-700/50 pt-4 text-center">
          <p className="text-[11px] text-slate-500 leading-normal">
            Demo Credentials:<br />
            <strong>Admin:</strong> admin / admin123 | 
            <strong> Teacher:</strong> teacher1 / password<br />
            <strong>Parent:</strong> parent1 / password | 
            <strong> Student:</strong> student1 / password<br />
            <strong>Library:</strong> librarian / password
          </p>
        </div>
      </div>

      <footer className="mt-12 text-slate-600 text-xs text-center z-10">
        &copy; {new Date().getFullYear()} EduManage LMS. Powered by Node.js, Express, and Oracle DB.
      </footer>
    </div>
  );
}


export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [showSplash, setShowSplash] = useState(false);

  const handleLoginSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setShowSplash(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setShowSplash(false);
  };

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (showSplash) {
    return <LoginSplash userName={currentUser.name} role={currentUser.role} />;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'Admin':
        return <AdminDashboard onRoleChange={handleLogout} currentUser={currentUser} />;
      case 'Teacher':
        return <TeacherDashboard onRoleChange={handleLogout} currentUser={currentUser} />;
      case 'Parent':
        return <ParentDashboard onRoleChange={handleLogout} currentUser={currentUser} />;
      case 'Library':
        return <LibraryDashboard onRoleChange={handleLogout} currentUser={currentUser} />;
      case 'Student':
        return <StudentDashboard onRoleChange={handleLogout} currentUser={currentUser} />;
      default:
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <>
      {renderDashboard()}
      <ToastContainer currentUser={currentUser} />
    </>
  );
}

