export const institutesData = [
  {
    id: 1,
    name: 'University of California, Berkeley',
    shortName: 'UC Berkeley',
    type: 'Public University',
    status: 'Pending Verification',
    established: '1868',
    accreditation: 'WASC Senior College and University Commission',
    address: {
      full: '200 California Hall, Berkeley, CA 94720, USA',
      city: 'Berkeley, California',
      zip: 'USA - 94720',
      short: 'Berkeley, CA 94720, USA'
    },
    email: 'admin@berkeley.edu',
    phone: '+1 (510) 642-6000',
    alternatePhone: '+1 (510) 642-5000',
    website: 'https://www.berkeley.edu',
    contactPerson: {
      name: 'Dr. Robert Thompson',
      designation: 'Dean of Administration',
      email: 'r.thompson@berkeley.edu',
      phone: '+1 (510) 642-7000'
    },
    registeredDate: '2024-10-19',
    expectedCapacity: {
      students: 350,
      teachers: 15
    },
    description: 'Premier research university with focus on engineering and sciences. We aim to implement modern attendance tracking for better student engagement.',
    departments: ['Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry'],
  },
  {
    id: 2,
    name: 'Cornell University',
    shortName: 'Cornell University',
    type: 'Private University',
    status: 'Pending Verification',
    established: '1865',
    accreditation: 'Middle States Commission on Higher Education',
    address: {
      full: 'Day Hall, Ithaca, NY 14850, USA',
      city: 'Ithaca, New York',
      zip: 'USA - 14850',
      short: 'Ithaca, NY 14850, USA'
    },
    email: 'info@cornell.edu',
    phone: '+1 (607) 254-4636',
    alternatePhone: '+1 (607) 254-2000',
    website: 'https://www.cornell.edu',
    contactPerson: {
      name: 'Prof. Amanda Stevens',
      designation: 'Vice President for Student Affairs',
      email: 'a.stevens@cornell.edu',
      phone: '+1 (607) 254-5000'
    },
    registeredDate: '2024-10-18',
    expectedCapacity: {
      students: 280,
      teachers: 12
    },
    description: 'Ivy League research university with diverse academic programs',
    departments: ['Arts and Sciences', 'Engineering', 'Business', 'Law', 'Medicine'],
  },
]

export const getInstituteById = (id) => {
  return institutesData.find(institute => institute.id === parseInt(id))
}
