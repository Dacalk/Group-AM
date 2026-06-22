import { useState } from 'react'
import { api } from '../services/api'
import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn, useDialog } from '../components/UI'

export function SubjectManagement({ setPage, data, refreshData, setEditingSubject }) {
  const [search, setSearch] = useState('')
  const { alert, confirm, DialogHost } = useDialog()

  const subjects = data?.subjects || []

  const handleEdit = (s) => {
    setEditingSubject(s)
    setPage('addSubject')
  }

  const handleDelete = async (id, name) => {
    const ok = await confirm(
      `This will permanently remove "${name}" from the system.`,
      'Delete Subject?',
      'delete',
      'Delete Subject'
    )
    if (!ok) return
    try {
      await api.deleteSubject(id)
      await alert('Subject deleted successfully!', 'success', 'Subject Deleted')
      refreshData()
    } catch (err) {
      await alert('Error deleting subject: ' + err.message, 'error', 'Delete Failed')
    }
  }

  const getSubjectCode = (name, id) => {
    const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4)
    return `${clean}-${100 + id}`
  }

  const filteredSubjects = subjects.filter((s) => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.grade && s.grade.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <DialogHost />
      <PageHeader
        title="Subject Management"
        subtitle="Manage all subjects and course assignments."
        action={<Btn icon="plus" onClick={() => { setEditingSubject(null); setPage('addSubject'); }}>Add Subject</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input 
              placeholder="Search subjects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" 
            />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
              {['Code', 'Subject Name', 'Grade Level', 'Type', 'Credits', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left pb-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((s) => {
              const code = getSubjectCode(s.name, s.id)
              return (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 text-xs font-mono font-semibold text-indigo-600">{code}</td>
                  <td className="py-3 text-sm font-medium text-gray-800">{s.name}</td>
                  <td className="py-3 text-sm text-gray-600">{s.grade || 'All Grades'}</td>
                  <td className="py-3"><Badge color="blue">Core</Badge></td>
                  <td className="py-3 text-sm text-gray-700 font-medium">3</td>
                  <td className="py-3"><Badge color="green">Active</Badge></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(s)}
                        className="text-indigo-500 hover:text-indigo-700 bg-transparent border-0 cursor-pointer text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(s.id, s.name)}
                        className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredSubjects.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No subjects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function AddSubject({ setPage, refreshData, editingSubject, setEditingSubject }) {
  const isEdit = !!editingSubject
  const { alert, DialogHost } = useDialog()

  const [subjectName, setSubjectName] = useState(editingSubject?.name || '')
  const [gradeLevel, setGradeLevel] = useState(editingSubject?.grade || 'Grade 7-A')

  const handleSave = async () => {
    if (!subjectName.trim()) {
      await alert('Subject Name is required.', 'warning', 'Missing Field')
      return
    }

    const payload = { name: subjectName, grade: gradeLevel }

    try {
      if (isEdit) {
        await api.updateSubject(editingSubject.id, payload)
        await alert('Subject updated successfully!', 'success', 'Subject Updated')
      } else {
        await api.addSubject(payload)
        await alert('Subject added successfully!', 'success', 'Subject Added')
      }
      setEditingSubject(null)
      refreshData()
      setPage('subjectManagement')
    } catch (err) {
      await alert('Error saving subject: ' + err.message, 'error', 'Save Failed')
    }
  }

  const handleCancel = () => {
    setEditingSubject(null)
    setPage('subjectManagement')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <DialogHost />
      <PageHeader 
        title={isEdit ? "Edit Subject" : "Add New Subject"} 
        subtitle={isEdit ? "Modify subject settings and grade assignment." : "Create a new subject and assign to a grade level."} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <Input 
          label="Subject Name" 
          placeholder="e.g. Advanced Mathematics" 
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Grade Level</label>
          <select 
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            {['Grade 6-A', 'Grade 7-A', 'Grade 7-B', 'Grade 8-B', 'Grade 9-C', 'All Grades'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Btn icon="book" onClick={handleSave}>{isEdit ? "Save Changes" : "Save Subject"}</Btn>
          <Btn variant="outline" onClick={handleCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
