import React from 'react'
import { useNavigate } from 'react-router-dom'
import { institutesData } from '../../../data/institutesData'

function PendingInstitute() {
  const navigate = useNavigate()

  const handleViewDetails = (institute) => {
    navigate(`/pending-institutes/${institute.id}`)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Pending Institutes</h2>
        <p className="text-sm text-gray-500">Review and verify institute registration requests</p>
      </div>

      <div className="space-y-6">
        {institutesData.map((institute) => (
          <div key={institute.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M4 21V10l8-6 8 6v11" />
                    <path d="M9 21v-8h6v8" />
                    <path d="M12 2v3" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{institute.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{institute.status}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{institute.type}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleViewDetails(institute)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.address.short}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Phone</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.phone}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Contact Person</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.contactPerson.name}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Registered Date</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.registeredDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Expected Students</div>
                    <div className="text-sm text-gray-800 mt-0.5">{institute.expectedCapacity.students} students</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <p className="text-sm text-gray-700">{institute.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingInstitute
