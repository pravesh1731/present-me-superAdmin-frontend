import React, { useMemo, useState } from 'react'

const initialTeachers = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@mit.edu', institute: 'MIT', subjects: 'Computer Science', status: 'Verified', registered: '2024-10-15' },
  { id: 2, name: 'Prof. Michael Chen', email: 'mchen@stanford.edu', institute: 'Stanford University', subjects: 'Mathematics', status: 'Verified', registered: '2024-10-12' },
  { id: 3, name: 'Dr. Emily Rodriguez', email: 'emily.r@harvard.edu', institute: 'Harvard University', subjects: 'Physics', status: 'Pending', registered: '2024-10-18' },
  { id: 4, name: 'Prof. David Kumar', email: 'dkumar@caltech.edu', institute: 'Caltech', subjects: 'Engineering', status: 'Pending', registered: '2024-10-17' },
  { id: 5, name: 'Dr. Lisa Anderson', email: 'landerson@yale.edu', institute: 'Yale University', subjects: 'Chemistry', status: 'Verified', registered: '2024-10-10' },
  { id: 6, name: 'Prof. James Wilson', email: 'jwilson@princeton.edu', institute: 'Princeton', subjects: 'Biology', status: 'Pending', registered: '2024-10-19' },
  { id: 7, name: 'Dr. Maria Garcia', email: 'mgarcia@columbia.edu', institute: 'Columbia University', subjects: 'Economics', status: 'Verified', registered: '2024-10-08' },
  { id: 8, name: 'Prof. Robert Taylor', email: 'rtaylor@uchicago.edu', institute: 'University of Chicago', subjects: 'Statistics', status: 'Pending', registered: '2024-10-16' },
]

const StatusBadge = ({ status }) => {
  if (status === 'Verified') return <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Verified</span>
  return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
}

const Teacher = () => {
  const [teachers, setTeachers] = useState(initialTeachers)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [viewing, setViewing] = useState(null)

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      if (filter === 'Verified' && t.status !== 'Verified') return false
      if (filter === 'Pending' && t.status !== 'Pending') return false
      if (query && !(`${t.name} ${t.email} ${t.institute} ${t.subjects}`).toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [teachers, filter, query])

  const handleVerify = (id) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'Verified' } : t)))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Teachers Management</h2>
        <p className="text-sm text-gray-500">Manage and verify registered teachers</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">Teachers List</h3>
              <div className="inline-flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1 overflow-x-auto">
                <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-full text-sm ${filter === 'All' ? 'bg-white shadow' : ''}`} aria-pressed={filter === 'All'}>All ({teachers.length})</button>
                <button onClick={() => setFilter('Verified')} className={`px-3 py-1 rounded-full text-sm ${filter === 'Verified' ? 'bg-white shadow' : ''}`} aria-pressed={filter === 'Verified'}>Verified ({teachers.filter(t=>t.status==='Verified').length})</button>
                <button onClick={() => setFilter('Pending')} className={`px-3 py-1 rounded-full text-sm ${filter === 'Pending' ? 'bg-white shadow' : ''}`} aria-pressed={filter === 'Pending'}>Pending ({teachers.filter(t=>t.status==='Pending').length})</button>
              </div>
            </div>

            <div className="w-full sm:w-64">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search teachers..." className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm" aria-label="Search teachers" />
            </div>
          </div>
        </div>

        {/* Desktop / large screens: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Institute</th>
                <th className="py-3 px-4">Subjects</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="text-sm border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{t.name}</td>
                  <td className="py-4 px-4 text-gray-600">{t.email}</td>
                  <td className="py-4 px-4 text-gray-600">{t.institute}</td>
                  <td className="py-4 px-4 text-gray-600">{t.subjects}</td>
                  <td className="py-4 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-4 px-4 text-gray-500">{t.registered}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewing(t)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      {t.status === 'Pending' ? (
                        <button onClick={() => handleVerify(t.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm">Verify</button>
                      ) : (
                        <button className="p-2 rounded-md border border-gray-100 text-gray-600"> 
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 19l-7-7 7-7" />
                            <path d="M19 19l-7-7 7-7" opacity="0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.institute}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.subjects}</div>
                  <div className="text-xs text-gray-500 mt-1">{t.email}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={t.status} />
                  <div className="text-xs text-gray-400">{t.registered}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button onClick={() => setViewing(t)} className="p-2 rounded-md border border-gray-100 hover:bg-gray-100 text-sm">View</button>
                {t.status === 'Pending' ? (
                  <button onClick={() => handleVerify(t.id)} className="bg-emerald-500 text-white px-3 py-1 rounded-md text-sm">Verify</button>
                ) : (
                  <button className="p-2 rounded-md border border-gray-100 text-gray-600 text-sm">Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setViewing(null)} aria-hidden="true"></div>
          <div className="bg-white rounded-t-lg sm:rounded-lg p-4 sm:p-6 z-10 w-full max-w-xl h-full sm:h-auto overflow-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{viewing.name}</h3>
                <p className="text-sm text-gray-500">{viewing.institute} — {viewing.subjects}</p>
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
                <dt className="text-gray-500">Subjects</dt>
                <dd className="text-gray-800">{viewing.subjects}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teacher
