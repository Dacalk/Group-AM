import { useState } from 'react'
import { Icon, icons } from '../components/Icons'
import { Badge, PageHeader, Input, Select, Btn, useDialog } from '../components/UI'
import { api } from '../services/api'

export function ClassManagementPage({ setPage, data, refreshData, setEditingClass }) {
  const [search, setSearch] = useState('')
  const { alert, confirm, DialogHost } = useDialog()

  const classes = data?.classes || []

  const handleEdit = (cls) => {
    setEditingClass(cls)
    setPage('addClass')
  }

  const handleDelete = async (id, name) => {
    const ok = await confirm(
      `This will permanently remove the class "${name}".`,
      'Delete Class?',
      'delete',
      'Delete Class'
    )
    if (!ok) return
    try {
      await api.deleteClass(id)
      await alert('Class deleted successfully!', 'success', 'Class Deleted')
      refreshData()
    } catch (err) {
      await alert('Error deleting class: ' + err.message, 'error', 'Delete Failed')
    }
  }

  const filteredClasses = classes.filter((c) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.teacher.toLowerCase().includes(search.toLowerCase()) || 
    c.room.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <DialogHost />
      <PageHeader
        title="Class Management"
        subtitle="Manage school classes, sections, and homeroom teachers."
        action={<Btn icon="plus" onClick={() => { setEditingClass(null); setPage('addClass'); }}>Add Class</Btn>}
      />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input 
              placeholder="Search classes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none pl-9" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                {['Class Name', 'Section', 'Homeroom Teacher', 'Capacity', 'Room', 'Academic Year', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left pb-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((c, i) => {
                const sec = c.name.includes('-') ? c.name.split('-')[1] : 'A'
                const year = 2026
                return (
                  <tr key={c.id || i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 text-sm font-bold text-gray-800">{c.name}</td>
                    <td className="py-3 text-sm text-gray-600">{sec}</td>
                    <td className="py-3 text-sm text-gray-600">{c.teacher}</td>
                    <td className="py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Icon path={icons.users} size={13} color="#9ca3af" /> {c.capacity}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{c.room}</td>
                    <td className="py-3 text-sm text-gray-600">{year}</td>
                    <td className="py-3"><Badge color={c.status === 'Active' ? 'green' : 'gray'}>{c.status}</Badge></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(c)}
                          className="text-indigo-400 hover:text-indigo-600 bg-transparent border-0 cursor-pointer"
                        >
                          <Icon path={icons.edit} size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id, c.name)}
                          className="text-red-400 hover:text-red-600 bg-transparent border-0 cursor-pointer"
                        >
                          <Icon path={icons.trash} size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredClasses.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">No classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AddClass({ setPage, refreshData, editingClass, setEditingClass, data }) {
  const isEdit = !!(editingClass && editingClass.id)
  const { alert, DialogHost } = useDialog()

  let initialGrade = 'Grade 7'
  let initialSec = 'A'
  if (editingClass && editingClass.name) {
    const parts = editingClass.name.split('-')
    initialGrade = parts[0] || 'Grade 7'
    initialSec = parts[1] || 'A'
  }

  const [grade, setGrade] = useState(editingClass ? initialGrade : 'Grade 7')
  const [section, setSection] = useState(editingClass ? initialSec : 'A')
  const [className, setClassName] = useState(editingClass?.name || '')
  const [teacher, setTeacher] = useState(editingClass?.teacher || 'Ms. Sarah Johnson')
  const [room, setRoom] = useState(editingClass?.room || 'Room 103')
  const [capacity, setCapacity] = useState(editingClass?.capacity?.toString() || '35')
  const [year, setYear] = useState('2026')
  const [status, setStatus] = useState('Active')

  // Auto-fill class name suggestion
  const suggestedClassName = className || `${grade}-${section}`

  const teachersList = data?.users?.filter(u => u.role === 'Teacher' || u.role === 'TEACHER').map(u => u.name) || [
    'Ms. Sarah Johnson', 'Mr. David Lee', 'Ms. Emily White', 'Mr. James Brown'
  ]
  const uniqueTeachers = Array.from(new Set([...teachersList, teacher])).filter(Boolean)

  const handleSave = async () => {
    if (!suggestedClassName) {
      await alert('Class Name is required.', 'warning', 'Missing Fields')
      return
    }

    const payload = {
      name: suggestedClassName,
      grade,
      section,
      teacher,
      room,
      capacity: parseInt(capacity) || 30,
      year,
      status
    }

    try {
      if (isEdit) {
        await api.updateClass(editingClass.id, payload)
        await alert('Class successfully updated!', 'success', 'Class Updated')
      } else {
        await api.addClass(payload)
        await alert('Class successfully configured and created!', 'success', 'Class Created')
      }
      setEditingClass(null)
      refreshData()
      setPage('classMgmt')
    } catch (e) {
      await alert('Error saving class: ' + e.message, 'error', 'Error')
    }
  }

  const handleCancel = () => {
    setEditingClass(null)
    setPage('classMgmt')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <DialogHost />
      <PageHeader 
        title={isEdit ? "Edit Class" : "Add New Class"} 
        subtitle={isEdit ? "Modify class configuration settings." : "Create a new class or section for the school."} 
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Grade Level</label>
            <select 
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
            >
              {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Section</label>
            <select 
              value={section}
              onChange={e => setSection(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
            >
              {['A', 'B', 'C', 'D'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <Input 
          label="Class Name" 
          placeholder={`e.g. ${suggestedClassName}`} 
          value={className}
          onChange={e => setClassName(e.target.value)}
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Homeroom Teacher</label>
          <select 
            value={teacher}
            onChange={e => setTeacher(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            {uniqueTeachers.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Classroom / Room No</label>
          <select 
            value={room}
            onChange={e => setRoom(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            {['Room 101', 'Room 103', 'Room 105', 'Room 201', 'Room 203', 'Room 301'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Capacity" placeholder="e.g. 35" value={capacity} onChange={e => setCapacity(e.target.value)} />
          <Input label="Academic Year" placeholder="e.g. 2026" value={year} onChange={e => setYear(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Status</label>
          <select 
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 bg-white"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Btn icon="building" onClick={handleSave}>{isEdit ? "Save Changes" : "Create Class"}</Btn>
          <Btn variant="outline" onClick={handleCancel}>Cancel</Btn>
        </div>
      </div>
    </div>
  )
}
