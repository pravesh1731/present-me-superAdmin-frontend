import React, { useMemo, useState } from 'react'

const initialStudents = [
  { id: 1, name: 'John Smith', email: 'john.smith@mit.edu', institute: 'MIT', course: 'Computer Science', status: 'Enrolled', registered: '2024-09-10' },
  { id: 2, name: 'Aisha Khan', email: 'a.khan@stanford.edu', institute: 'Stanford University', course: 'Mathematics', status: 'Enrolled', registered: '2024-09-12' },
  { id: 3, name: 'Carlos Mendez', email: 'c.mendez@harvard.edu', institute: 'Harvard University', course: 'Physics', status: 'Pending', registered: '2024-10-02' },
  { id: 4, name: 'Mei Ling', email: 'm.ling@caltech.edu', institute: 'Caltech', course: 'Engineering', status: 'Enrolled', registered: '2024-08-21' },
  { id: 5, name: 'Priya Patel', email: 'p.patel@yale.edu', institute: 'Yale University', course: 'Chemistry', status: 'Pending', registered: '2024-10-05' },
]

const StatusBadge = ({ status }) => {
  if (status === 'Enrolled') return <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Enrolled</span>
  return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
}

const Student = () => {
  const [students, setStudents] = useState(initialStudents)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState(null)

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (filter === 'Enrolled' && s.status !== 'Enrolled') return false
      if (filter === 'Pending' && s.status !== 'Pending') return false
      if (query && !(`${s.name} ${s.email} ${s.institute} ${s.course}`).toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [students, filter, query])

  const handleEnroll = (id) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: 'Enrolled' } : s)))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Students</h2>
        <p className="text-sm text-gray-500">View and manage student registrations</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Students List</h3>
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1 overflow-x-auto">
                <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-full text-sm ${filter === 'All' ? 'bg-white shadow' : ''}`}>All ({students.length})</button>
                <button onClick={() => setFilter('Enrolled')} className={`px-3 py-1 rounded-full text-sm ${filter === 'Enrolled' ? 'bg-white shadow' : ''}`}>Enrolled ({students.filter(s=>s.status==='Enrolled').length})</button>
                <button onClick={() => setFilter('Pending')} className={`px-3 py-1 rounded-full text-sm ${filter === 'Pending' ? 'bg-white shadow' : ''}`}>Pending ({students.filter(s=>s.status==='Pending').length})</button>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students..." className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Institute</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="text-sm border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{s.name}</td>
                  <td className="py-4 px-4 text-gray-600">{s.email}</td>
                  <td className="py-4 px-4 text-gray-600">{s.institute}</td>
                  <td className="py-4 px-4 text-gray-600">{s.course}</td>
                  <td className="py-4 px-4"><StatusBadge status={s.status} /></td>
                  <td className="py-4 px-4 text-gray-500">{s.registered}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewing(s)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-100">View</button>
                      {s.status === 'Pending' ? (
                        <button onClick={() => handleEnroll(s.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm">Enroll</button>
                      ) : (
                        <button className="p-2 rounded-md border border-gray-100 text-gray-600">Details</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.institute}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.course}</div>
                  <div className="text-xs text-gray-500 mt-1">{s.email}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={s.status} />
                  <div className="text-xs text-gray-400">{s.registered}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button onClick={() => setViewing(s)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-100 text-sm">View</button>
                {s.status === 'Pending' ? (
                  <button onClick={() => handleEnroll(s.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm">Enroll</button>
                ) : (
                  <button className="p-2 rounded-md border border-gray-100 text-gray-600 text-sm">Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setViewing(null)} aria-hidden="true"></div>
          <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 z-10 w-full max-w-lg h-full sm:h-auto overflow-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{viewing.name}</h3>
                <p className="text-sm text-gray-500">{viewing.institute} — {viewing.course}</p>
              </div>
              <button onClick={() => setViewing(null)} className="text-gray-500" aria-label="Close details">Close</button>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-800">{viewing.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-800"><StatusBadge status={viewing.status} /></dd>
              </div>
              <div>
                <dt className="text-gray-500">Registered</dt>
                <dd className="text-gray-800">{viewing.registered}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Course</dt>
                <dd className="text-gray-800">{viewing.course}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

export default Student
