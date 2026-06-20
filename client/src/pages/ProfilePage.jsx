import { useState } from 'react'
import { api } from '../services/api'
import { PageHeader, Input, Btn, Badge } from '../components/UI'

export default function ProfilePage({ currentUser }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in all password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.')
      return
    }

    setLoading(true)
    try {
      const res = await api.updatePassword(currentUser.id, currentPassword, newPassword)
      if (res.success) {
        setSuccess('Password updated successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError(res.message || 'Failed to update password.')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the password.')
    } finally {
      setLoading(false)
    }
  }

  // Define badge color based on role
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'red'
      case 'Teacher': return 'purple'
      case 'Parent': return 'blue'
      case 'Library': return 'green'
      default: return 'gray'
    }
  }

  return (
    <div className="w-full pb-12">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal details and system credentials." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Basic Details Banner */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col items-center p-6 text-center">
            {/* Cover Gradient */}
            <div className="w-full h-24 bg-gradient-to-r from-indigo-500 via-[#5b5fc7] to-purple-600 rounded-xl mb-4" />
            
            {/* Avatar Initials */}
            <div className={`w-24 h-24 rounded-full border-4 border-white -mt-16 flex items-center justify-center text-white text-3xl font-extrabold shadow-md ${currentUser.avatarClass || 'bg-[#5b5fc7]'}`}>
              {currentUser.initials || 'ME'}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mt-4 leading-tight">{currentUser.name}</h2>
            <p className="text-sm text-gray-500 mb-3">@{currentUser.username}</p>
            
            <Badge color={getRoleColor(currentUser.role)}>{currentUser.role}</Badge>
            
            <div className="w-full mt-6 pt-6 border-t border-gray-100 text-left space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email Address</p>
                <p className="text-sm text-gray-700 font-medium truncate mt-0.5">{currentUser.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Last Login Session</p>
                <p className="text-sm text-gray-700 font-medium mt-0.5">{currentUser.lastLogin || 'Just now'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Details & Password Form */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Settings / Personal Info Form (Read Only representation) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-800 border-b pb-2">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">FULL NAME</label>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium">
                  {currentUser.name}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">SYSTEM ROLE</label>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium">
                  {currentUser.role}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">USERNAME</label>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium">
                  {currentUser.username}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">EMAIL ADDRESS</label>
                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-600 font-medium">
                  {currentUser.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 border-b pb-2 mb-4">Security Settings</h3>
            
            {error && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-150 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <Input 
                label="Current Password" 
                type="password" 
                placeholder="Enter current password" 
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="New Password" 
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="pt-2">
                <Btn type="submit" disabled={loading}>
                  {loading ? 'Updating Password...' : 'Change Password'}
                </Btn>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  )
}
