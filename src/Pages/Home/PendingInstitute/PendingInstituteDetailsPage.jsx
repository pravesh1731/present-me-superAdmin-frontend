import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInstituteById } from '../../../data/institutesData'

function PendingInstituteDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Details')

  const institute = getInstituteById(parseInt(id))

  if (!institute) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-500">Institute not found</p>
          <button 
            onClick={() => navigate('/pending-institutes')}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
          >
            Back to List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/pending-institutes')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to List</span>
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M4 21V10l8-6 8 6v11" />
                <path d="M9 21v-8h6v8" />
                <path d="M12 2v3" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">{institute.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{institute.type}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
            <div>
              <div className="text-xs text-gray-500">Established</div>
              <div className="text-sm font-medium text-gray-800 mt-1">{institute.established}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Accreditation</div>
              <div className="text-sm font-medium text-gray-800 mt-1">{institute.accreditation}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('Details')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'Details' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('Documents')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'Documents' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'Details' && (
            <div className="p-6 space-y-6">
              {/* Institute Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Institute Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-3 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Address</div>
                          <div className="text-sm text-gray-800">{institute.address.full}</div>
                          <div className="text-xs text-gray-500 mt-1">{institute.address.city}</div>
                          <div className="text-xs text-gray-500">{institute.address.zip}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="M3 7l9 6 9-6" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Email</div>
                          <div className="text-sm text-gray-800">{institute.email}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Phone</div>
                          <div className="text-sm text-gray-800">{institute.phone}</div>
                          <div className="text-sm text-gray-800">{institute.alternatePhone}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Website</div>
                          <a href={institute.website} className="text-sm text-indigo-600 hover:underline">{institute.website}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Person Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Person Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Name & Designation</div>
                          <div className="text-sm font-medium text-gray-800">{institute.contactPerson.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{institute.contactPerson.designation}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="M3 7l9 6 9-6" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Email</div>
                          <div className="text-sm text-gray-800">{institute.contactPerson.email}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Phone</div>
                          <div className="text-sm text-gray-800">{institute.contactPerson.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{institute.about}</p>
              </div>

              {/* Departments */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Departments</h4>
                <div className="flex flex-wrap gap-2">
                  {institute.departments.map((dept, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expected Capacity */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Expected Capacity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Expected Students</div>
                    <div className="text-2xl font-semibold text-gray-800">{institute.expectedCapacity.students}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Expected Teachers</div>
                    <div className="text-2xl font-semibold text-gray-800">{institute.expectedCapacity.teachers}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
              <div className="space-y-3">
                {/* Aadhar Card */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">Aadhar Card</div>
                      <div className="text-xs text-gray-500">Identity verification document</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </button>
                </div>

                {/* Designation ID */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="7" y1="8" x2="17" y2="8" />
                        <line x1="7" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="16" x2="13" y2="16" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">Designation ID</div>
                      <div className="text-xs text-gray-500">Official designation document</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium">
            Approve Institute
          </button>
          <button className="flex-1 border bg-red-400 border-gray-300 text-white hover:bg-red-500 px-6 py-3 rounded-lg font-medium">
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

export default PendingInstituteDetailsPage
