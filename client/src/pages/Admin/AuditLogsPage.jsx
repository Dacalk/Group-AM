import { useState, useEffect } from 'react'
import { api } from '../../services/api'
import { Icon, icons } from '../../components/Icons'
import { Badge, PageHeader, Btn } from '../../components/UI'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Actions')
  const [error, setError] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAuditLogs()
      if (res.success) {
        setLogs(res.logs || [])
      } else {
        setError(res.error || 'Failed to fetch audit logs')
      }
    } catch (err) {
      setError(err.message || 'Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Categories extraction
  const getActionCategory = (action) => {
    const act = (action || '').toLowerCase()
    if (act.includes('create') || act.includes('add')) return 'Create'
    if (act.includes('update') || act.includes('edit')) return 'Update'
    if (act.includes('delete') || act.includes('remove')) return 'Delete'
    if (act.includes('login') || act.includes('auth')) return 'Auth'
    return 'Other'
  }

  const getBadgeColor = (action) => {
    const category = getActionCategory(action)
    switch (category) {
      case 'Create': return 'green'
      case 'Update': return 'yellow'
      case 'Delete': return 'red'
      case 'Auth': return 'blue'
      default: return 'gray'
    }
  }

  const filteredLogs = logs.filter(log => {
    const text = `${log.username} ${log.action} ${log.targetType} ${log.targetId} ${log.details}`.toLowerCase()
    const matchesSearch = text.includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All Actions' || getActionCategory(log.action) === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit Logs"
        subtitle="Track administrator actions, database mutations, and system changes."
        action={
          <Btn 
            onClick={fetchLogs} 
            disabled={loading}
            icon={<Icon path={icons.refresh} size={14} className={loading ? 'animate-spin' : ''} />} 
            className="flex items-center gap-1.5"
          >
            {loading ? 'Refreshing...' : 'Refresh Logs'}
          </Btn>
        }
      />

      {/* Main Table & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-2.5 pointer-events-none">
              <Icon path={icons.search} size={16} color="#9ca3af" />
            </div>
            <input
              placeholder="Search by admin user, action, target, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl py-2.5 text-sm focus:outline-none focus:border-indigo-400 pl-9 transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 focus:outline-none bg-white focus:border-indigo-400"
          >
            <option>All Actions</option>
            <option>Create</option>
            <option>Update</option>
            <option>Delete</option>
            <option>Auth</option>
            <option>Other</option>
          </select>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-4 text-sm font-medium">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading activity records from Oracle database...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left pb-3 pr-4">Timestamp</th>
                    <th className="text-left pb-3 pr-4">Actor</th>
                    <th className="text-left pb-3 pr-4">Action</th>
                    <th className="text-left pb-3 pr-4">Target Type</th>
                    <th className="text-left pb-3 pr-4">Target ID</th>
                    <th className="text-left pb-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 pr-4 text-xs font-mono text-gray-500 whitespace-nowrap">{log.createdAt}</td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold">
                            {log.username?.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{log.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <Badge color={getBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500 whitespace-nowrap">{log.targetType || '-'}</td>
                      <td className="py-3.5 pr-4 text-xs font-mono text-gray-500">{log.targetId || '-'}</td>
                      <td className="py-3.5 text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <p className="text-sm font-medium">No audit logs found matching criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-gray-400">{log.createdAt}</span>
                    <Badge color={getBadgeColor(log.action)}>{log.action}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-800">{log.username}</span>
                    {log.targetType && (
                      <span className="text-xs text-gray-500 ml-1.5">
                        on <strong className="font-medium">{log.targetType}</strong> (ID: {log.targetId})
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-gray-600 bg-white border border-gray-100 rounded-lg p-2 font-medium">
                      {log.details}
                    </p>
                  )}
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm font-medium">No audit logs found matching criteria.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
