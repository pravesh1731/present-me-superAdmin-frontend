import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVerifiedInstituteById } from '../../../data/verifiedInstitutesData'

const TabButton = ({active, onClick, children}) => (
  <button
    onClick={onClick}
    className={`px-4 md:px-6 py-2.5 text-sm font-medium rounded-t-lg border-b-2 ${active ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
  >
    {children}
  </button>
)

function VerifiedInstituteDetailsPage(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Details')

  const institute = getVerifiedInstituteById(id)

  if(!institute){
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">Institute not found</p>
          <button onClick={()=>navigate('/verified-institutes')} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Back to list</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Top bar with back + name + actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/verified-institutes')} className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">{institute.name}</h1>
          </div>
          <div className="flex items-center gap-2 ">
            <button 
              onClick={()=>navigate('/chat')} 
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              Chat
            </button>
            <span className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">Verified</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex gap-2 border-b">
            <TabButton active={activeTab==='Details'} onClick={()=>setActiveTab('Details')}>Details</TabButton>
            <TabButton active={activeTab==='Teachers'} onClick={()=>setActiveTab('Teachers')}>Teachers</TabButton>
            <TabButton active={activeTab==='Students'} onClick={()=>setActiveTab('Students')}>Students</TabButton>
            <TabButton active={activeTab==='Activity'} onClick={()=>setActiveTab('Activity')}>Activity</TabButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left summary card */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M4 21V10l8-6 8 6v11"/><path d="M9 21v-8h6v8"/><path d="M12 2v3"/></svg>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{institute.name}</div>
                <div className="text-xs mt-1 text-gray-500">{institute.type}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500">Established</div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{institute.established}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Accreditation</div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{institute.accreditation}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Registered Date</div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{institute.registeredDate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Verified Date</div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{institute.verifiedDate}</div>
            </div>

            {/* Quick Stats */}
            <div className="pt-5 border-t">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span className="text-sm text-gray-600">Students</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{institute.quickStats.students}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span className="text-sm text-gray-600">Teachers</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{institute.quickStats.teachers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <span className="text-sm text-gray-600">Active Classes</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{institute.quickStats.activeClasses}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right main content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Details Tab */}
            {activeTab === 'Details' && (
              <>
                {/* Institute Information */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Institute Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Contact Information</div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Address</div>
                            <div className="text-sm text-gray-800">{institute.address.full}</div>
                            <div className="text-xs text-gray-500 mt-1">{institute.address.city}</div>
                            <div className="text-xs text-gray-500">{institute.address.country} - {institute.address.zip}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Email</div>
                            <div className="text-sm text-gray-800">{institute.email}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Phone</div>
                            <div className="text-sm text-gray-800">{institute.phone}</div>
                            <div className="text-xs text-gray-500 mt-1">{institute.alternatePhone}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Website</div>
                            <a href={institute.website} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:underline">{institute.website.replace('https://','')}</a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Contact Person Details</div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Name & Designation</div>
                            <div className="text-sm text-gray-800">{institute.contactPerson.name}</div>
                            <div className="text-xs text-gray-500">{institute.contactPerson.designation}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Email</div>
                            <div className="text-sm text-gray-800">{institute.contactPerson.email}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
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
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{institute.about}</p>
                </div>

                {/* Departments */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Departments</h3>
                  <div className="flex flex-wrap gap-2">
                    {institute.departments.map((d, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">{d}</span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Teachers Tab */}
            {activeTab === 'Teachers' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Teachers ({institute.teachers?.length || 0})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institute.teachers && institute.teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm text-gray-800">{teacher.name}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{teacher.department}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              teacher.status === 'Verified' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {teacher.status}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">{teacher.students} students</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'Students' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Students ({institute.students?.length || 0})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Roll No.</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Year</th>
                        <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institute.students && institute.students.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm text-gray-800">{student.name}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{student.rollNo}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{student.department}</td>
                          <td className="py-3 px-2 text-sm text-gray-600">{student.year}</td>
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              parseInt(student.attendance) >= 90 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {student.attendance}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'Activity' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {institute.activity && institute.activity.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        item.type === 'teacher' ? 'bg-purple-100' :
                        item.type === 'student' ? 'bg-blue-100' :
                        item.type === 'class' ? 'bg-indigo-100' :
                        'bg-emerald-100'
                      }`}>
                        {item.type === 'teacher' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        )}
                        {item.type === 'student' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        )}
                        {item.type === 'class' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        )}
                        {item.type === 'attendance' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{item.title}</div>
                        <div className="text-sm text-gray-600 mt-0.5">{item.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default VerifiedInstituteDetailsPage
