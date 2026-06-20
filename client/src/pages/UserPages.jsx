import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn, useDialog } from '../components/UI'

// ─── ROLE COLOR MAPPING ───────────────────────────────────────────────────────

const roleColors = {
  Admin: 'red', Teacher: 'blue', Parent: 'gray',
  Library: 'yellow', Student: 'indigo'
}

// ─── USER CREDENTIALS LIST ────────────────────────────────────────────────────

export function UserCredentials({ setPage, data, refreshData, setEditingUser }) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const { alert, confirm, DialogHost } = useDialog()

  const users = data?.users || []

  const handleEdit = (u) => {
    setEditingUser(u)
    setPage('addUser')
  }

  const handleDelete = async (id, name) => {
    const ok = await confirm(
      `This will permanently remove "${name}" from the system.`,
      `Delete User?`, 'delete', 'Delete User'
    )
    if (!ok) return
    try {
      await api.deleteUser(id)
      await alert('User deleted successfully!', 'success', 'User Deleted')
      refreshData()
    } catch (err) {
      await alert('Error deleting user: ' + err.message, 'error', 'Delete Failed')
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <DialogHost />
      <PageHeader
        title="User Credentials"
        subtitle="Manage user accounts and access credentials."
        action={<Btn icon="plus" onClick={() => { setEditingUser(null); setPage('addUser'); }}>Add New User</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input
              placeholder="Search by name, username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:border-indigo-400 pl-9 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white focus:border-indigo-400"
          >
            <option>All Roles</option>
            <option>Admin</option>
            <option>Teacher</option>
            <option>Parent</option>
            <option>Library</option>
            <option>Student</option>
          </select>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['User', 'Role', 'Email', 'Username', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="text-left pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.avatarClass || 'bg-indigo-500'}`}>
                        {u.initials || u.name?.slice(0,2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge color={roleColors[u.role] || 'gray'}>
                      {u.role === 'Library' ? 'Librarian' : u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-gray-600">{u.email || '-'}</td>
                  <td className="py-3.5 pr-4 text-sm font-mono text-gray-600">{u.username}</td>
                  <td className="py-3.5 pr-4 text-sm text-gray-500">{u.lastLogin}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-3 text-sm">
                      <button onClick={() => handleEdit(u)} className="text-indigo-500 hover:text-indigo-700 bg-transparent border-0 cursor-pointer font-semibold">Edit</button>
                      <button onClick={() => handleDelete(u.id, u.name)} className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer font-semibold">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    <div className="text-3xl mb-2">👥</div>
                    <p className="text-sm">No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${u.avatarClass || 'bg-indigo-500'}`}>
                  {u.initials || u.name?.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{u.username}</p>
                </div>
                <Badge color={roleColors[u.role] || 'gray'}>
                  {u.role === 'Library' ? 'Librarian' : u.role}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mb-3">{u.email || 'No email'}</p>
              <div className="flex gap-3 border-t border-gray-100 pt-3">
                <button onClick={() => handleEdit(u)} className="flex-1 text-center text-sm text-indigo-600 font-semibold cursor-pointer border-0 bg-transparent">Edit</button>
                <button onClick={() => handleDelete(u.id, u.name)} className="flex-1 text-center text-sm text-red-500 font-semibold cursor-pointer border-0 bg-transparent">Delete</button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <div className="text-3xl mb-2">👥</div>
              <p className="text-sm">No users found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ADD / EDIT USER ──────────────────────────────────────────────────────────

export function AddUser({ setPage, refreshData, editingUser, setEditingUser }) {
  const isEdit = !!editingUser
  const { alert, DialogHost } = useDialog()

  const nameParts = editingUser?.name?.split(' ') || []
  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '')
  const [email, setEmail] = useState(editingUser?.email || '')
  const [role, setRole] = useState(editingUser?.role === 'Library' ? 'Librarian' : (editingUser?.role || ''))
  const [username, setUsername] = useState(editingUser?.username || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Student-specific fields
  const [className, setClassName] = useState('')
  const [gender, setGender] = useState('Male')
  const [dob, setDob] = useState('')
  const [admissionNo, setAdmissionNo] = useState('')
  const [medicalInfo, setMedicalInfo] = useState('')

  // Teacher-specific fields
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [qualification, setQualification] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [salary, setSalary] = useState('')

  // Parent-specific fields
  const [studentsList, setStudentsList] = useState([])
  const [studentId, setStudentId] = useState('')
  const [relationship, setRelationship] = useState('Parent')

  // Load helper data when role changes
  useEffect(() => {
    if (role === 'Parent') {
      api.getStudentsList().then(d => setStudentsList(d.students || [])).catch(() => {})
    }
    if (role === 'Teacher') {
      api.getDepartmentsList().then(d => setDepartments(d.departments || [])).catch(() => {})
    }
  }, [role])

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let pwd = ''
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    setPassword(pwd)
    setConfirmPassword(pwd)
  }

  const copyPassword = () => {
    if (!password) return
    navigator.clipboard.writeText(password)
      .then(() => alert('Password copied!', 'success', 'Copied'))
      .catch(() => alert('Failed to copy.', 'error', 'Error'))
  }

  const handleSave = async () => {
    if (!firstName || !lastName || !role || !username) {
      await alert('Please fill in all required fields.', 'warning', 'Missing Fields')
      return
    }
    if (!isEdit && !password) {
      await alert('Password is required for new users.', 'warning', 'Password Required')
      return
    }
    if (password && password !== confirmPassword) {
      await alert('Passwords do not match!', 'warning', 'Password Mismatch')
      return
    }
    if (role === 'Parent' && !studentId) {
      await alert('Please select a student to link to this parent.', 'warning', 'Student Required')
      return
    }

    const dbRole = role === 'Librarian' ? 'Library' : role
    const payload = {
      name: `${firstName} ${lastName}`,
      username, password, role: dbRole, email,
      // Student
      className, gender, dob, admissionNo, medicalInfo,
      // Teacher
      departmentId, specialization, qualification, yearsExperience, salary,
      // Parent
      studentId, relationship
    }

    try {
      if (isEdit) {
        await api.updateUser(editingUser.id, payload)
        await alert('User updated successfully!', 'success', 'User Updated')
      } else {
        await api.addUser(payload)
        await alert('User created successfully!', 'success', 'User Created')
      }
      setEditingUser(null)
      refreshData()
      setPage('userCredentials')
    } catch (err) {
      await alert('Error saving user: ' + err.message, 'error', 'Save Failed')
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setPage('userCredentials')
  }

  const roleLabel = role === 'Library' ? 'Librarian' : role
  const dbRole = role === 'Librarian' ? 'Library' : role
  const isStudent = roleLabel === 'Student'
  const isTeacher = roleLabel === 'Teacher'
  const isParent = roleLabel === 'Parent'

  return (
    <div className="max-w-3xl mx-auto">
      <DialogHost />
      <PageHeader
        title={isEdit ? 'Edit User Account' : 'Add New User'}
        subtitle={isEdit ? 'Modify user settings and permissions.' : 'Create a new user account with role and credentials.'}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">1</span>
            User Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input label="First Name *" placeholder="e.g. Sarah" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name *" placeholder="e.g. Johnson" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input label="Email Address" placeholder="e.g. sarah@school.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white transition-colors"
              >
                <option value="">Select role...</option>
                <option>Teacher</option>
                <option>Parent</option>
                <option>Student</option>
                <option>Librarian</option>
                <option>Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Role-Specific fields */}
        {isStudent && (
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
            <h3 className="text-sm font-bold text-blue-700 mb-3">📚 Student Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Admission No" placeholder="Auto-generated if blank" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} />
              <Input label="Class / Grade *" placeholder="e.g. Grade 7-A" value={className} onChange={(e) => setClassName(e.target.value)} />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              <div className="sm:col-span-2">
                <Input label="Medical Info" placeholder="e.g. None, Asthma..." value={medicalInfo} onChange={(e) => setMedicalInfo(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {isTeacher && (
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-700 mb-3">🎓 Teacher Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Department</label>
                <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white">
                  <option value="">Select department...</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <Input label="Specialization" placeholder="e.g. Biology, Algebra..." value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
              <Input label="Qualification" placeholder="e.g. BSc Education, MEd..." value={qualification} onChange={(e) => setQualification(e.target.value)} />
              <Input label="Years of Experience" type="number" placeholder="e.g. 5" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} />
              <div className="sm:col-span-2">
                <Input label="Monthly Salary (LKR)" type="number" placeholder="e.g. 120000" value={salary} onChange={(e) => setSalary(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {isParent && (
          <div className="p-4 bg-violet-50/60 border border-violet-100 rounded-xl">
            <h3 className="text-sm font-bold text-violet-700 mb-3">👨‍👩‍👧 Parent Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Assigned Student *</label>
                <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white">
                  <option value="">Select student...</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.className} (Adm: {s.admissionNo})
                    </option>
                  ))}
                </select>
                {studentsList.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠️ No students registered yet. Register a student first.</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Relationship</label>
                <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white">
                  <option>Parent</option><option>Father</option><option>Mother</option>
                  <option>Guardian</option><option>Sibling</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Credentials */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 border-t pt-5">
            <span className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">2</span>
            Login Credentials
          </h2>
          <div className="mb-4">
            <Input label="Username *" placeholder="e.g. sarah.johnson" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'} placeholder={isEdit ? 'Leave blank to keep current' : 'Set initial password'} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input label="Confirm Password" placeholder="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-3 mb-2">
            <Btn onClick={generatePassword}>Generate Password</Btn>
            <Btn variant="outline" onClick={copyPassword} disabled={!password}>Copy Password</Btn>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Btn icon="userPlus" onClick={handleSave}>{isEdit ? 'Save Changes' : 'Create User'}</Btn>
          <Btn variant="outline" onClick={handleCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}

