import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function VerifiedInstitute() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const institutes = [
    {
      id: 1,
      name: 'MIT',
      fullName: 'Massachusetts Institute of Technology',
      location: 'Cambridge, MA, USA',
      status: 'Verified',
      students: 542,
      teachers: 18,
      activeClasses: 45,
      verifiedDate: '2024-09-15'
    },
    {
      id: 2,
      name: 'Stanford University',
      fullName: 'Stanford University',
      location: 'Stanford, CA, USA',
      status: 'Verified',
      students: 478,
      teachers: 15,
      activeClasses: 38,
      verifiedDate: '2024-09-20'
    },
    {
      id: 3,
      name: 'Harvard University',
      fullName: 'Harvard University',
      location: 'Cambridge, MA, USA',
      status: 'Verified',
      students: 625,
      teachers: 22,
      activeClasses: 52,
      verifiedDate: '2024-09-10'
    },
    {
      id: 4,
      name: 'Caltech',
      fullName: 'California Institute of Technology',
      location: 'Pasadena, CA, USA',
      status: 'Verified',
      students: 298,
      teachers: 12,
      activeClasses: 28,
      verifiedDate: '2024-09-25'
    },
    {
      id: 5,
      name: 'Yale University',
      fullName: 'Yale University',
      location: 'New Haven, CT, USA',
      status: 'Verified',
      students: 412,
      teachers: 16,
      activeClasses: 35,
      verifiedDate: '2024-09-18'
    },
    {
      id: 6,
      name: 'Princeton',
      fullName: 'Princeton University',
      location: 'Princeton, NJ, USA',
      status: 'Verified',
      students: 385,
      teachers: 14,
      activeClasses: 32,
      verifiedDate: '2024-09-22'
    }
  ]

  const filteredInstitutes = institutes.filter(institute =>
    institute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institute.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institute.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Verified Institutes</h2>
        <p className="text-sm text-gray-500">All verified and active institutes</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search institutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Institutes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutes.map((institute) => (
          <div key={institute.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Institute Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M4 21V10l8-6 8 6v11" />
                  <path d="M9 21v-8h6v8" />
                  <path d="M12 2v3" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{institute.name}</h3>
                <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  {institute.status}
                </span>
              </div>
            </div>

            {/* Institute Details */}
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-700">{institute.fullName}</div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {institute.location}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-blue-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Students</div>
                  <div className="text-sm font-semibold text-gray-800">{institute.students}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-purple-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <div>
                  <div className="text-xs text-gray-500">Teachers</div>
                  <div className="text-sm font-semibold text-gray-800">{institute.teachers}</div>
                </div>
              </div>
            </div>

            {/* Active Classes */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Active Classes</span>
              <span className="text-lg font-semibold text-gray-800">{institute.activeClasses}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={()=>navigate(`/verified-institutes/${institute.id}`)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View
              </button>
              <button onClick={()=>navigate('/chat')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                Chat
              </button>
            </div>

            {/* Verified Date */}
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Verified on {institute.verifiedDate}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInstitutes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-gray-500">No institutes found matching your search.</p>
        </div>
      )}
    </div>
  )
}

export default VerifiedInstitute
