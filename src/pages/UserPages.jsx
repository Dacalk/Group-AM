import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn } from '../components/UI'

export function UserCredentials({ setPage }) {
  const users = [
    { name: 'Ms. Sarah Johnson', role: 'Teacher', roleColor: 'blue', email: 's.johnson@school.edu', username: 'sarah.j', login: 'Jun 9, 2026', status: 'Active' },
    { name: 'Mr. David Lee', role: 'Teacher', roleColor: 'blue', email: 'd.lee@school.edu', username: 'david.l', login: 'Jun 8, 2026', status: 'Active' },
    { name: 'John Doe', role: 'Parent', roleColor: 'gray', email: 'john.doe@email.com', username: 'john.doe', login: 'Jun 9, 2026', status: 'Active' },
    { name: 'Jane Smith', role: 'Parent', roleColor: 'gray', email: 'jane.smith@email.com', username: 'jane.smith', login: 'Jun 7, 2026', status: 'Inactive' },
    { name: 'Librarian Mike', role: 'Librarian', roleColor: 'yellow', email: 'm.chen@school.edu', username: 'mike.chen', login: 'Jun 9, 2026', status: 'Active' },
    { name: 'Admin User', role: 'Admin', roleColor: 'red', email: 'admin@school.edu', username: 'admin', login: 'Jun 9, 2026', status: 'Active' },
  ]

  return (
    <div>
      <PageHeader
        title="User Credentials"
        subtitle="Manage user accounts and access credentials."
        action={<Btn icon="plus" onClick={() => setPage('addUser')}>Add New User</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input
              placeholder="Search users..."
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9"
            />
          </div>
          <select className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white">
            <option>All Roles</option>
            <option>Teacher</option>
            <option>Parent</option>
            <option>Admin</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {['Name', 'Role', 'Email', 'Username', 'Last Login', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-3.5 text-sm font-medium text-gray-800">{u.name}</td>
                <td className="py-3.5"><Badge color={u.roleColor}>{u.role}</Badge></td>
                <td className="py-3.5 text-sm text-gray-600">{u.email}</td>
                <td className="py-3.5 text-sm font-mono text-gray-600">{u.username}</td>
                <td className="py-3.5 text-sm text-gray-600">{u.login}</td>
                <td className="py-3.5"><Badge color={u.status === 'Active' ? 'green' : 'gray'}>{u.status}</Badge></td>
                <td className="py-3.5">
                  <div className="flex items-center gap-3 text-sm">
                    <button className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
                      <Icon path={icons.key} size={13} /> Reset
                    </button>
                    <button className="text-indigo-500 hover:text-indigo-700">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AddUser({ setPage }) {
  return (
    <div>
      <PageHeader title="Add New User" subtitle="Create a new user account with role and credentials." />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-3xl">
        <h2 className="text-base font-bold text-gray-800 mb-5">User Information</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="First Name" placeholder="e.g. Sarah" />
          <Input label="Last Name" placeholder="e.g. Johnson" />
        </div>
        <div className="mb-4"><Input label="Email Address" placeholder="e.g. sarah@school.edu" type="email" /></div>
        <div className="mb-4"><Input label="Phone Number" placeholder="e.g. +1 555 0123" /></div>
        <div className="mb-6">
          <Select label="Role" placeholder="Select role" options={['Teacher', 'Parent', 'Librarian', 'Admin']} />
        </div>

        <h2 className="text-base font-bold text-gray-800 mb-5">Login Credentials</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Username" placeholder="e.g. sarah.johnson" />
          <Input label="Employee/Roll ID" placeholder="e.g. EMP-2024-042" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input label="Password" placeholder="Set initial password" type="password" />
          <Input label="Confirm Password" placeholder="Confirm password" type="password" />
        </div>

        <div className="flex gap-3">
          <Btn icon="userPlus">Create User</Btn>
          <Btn variant="outline" onClick={() => setPage('userCredentials')}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
