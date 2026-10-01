import React from "react";
import { Building2, Users } from "lucide-react";
import PeopleListPage from "../../Components/people/PeopleListPage";
import { InstituteAvatar, Pill } from "../../Components/common/ui";
import { formatDate, fullName } from "../../Components/utils/format";

const config = {
  kind: "students",
  title: "Students",
  subtitle: "Every student registered on Present-Me, across all institutes.",
  endpoint: "/sadmin/students",
  statusParam: "verified",
  personLabel: "Student",
  idKey: "studentId",
  searchPlaceholder: "Search name, roll no, email, institute…",
  EmptyIcon: Users,
  emptyTitle: "No students found",
  emptyText: "Students appear here once they sign up under an institute.",
  tabs: [
    { value: "all", label: "All", summaryKey: "all" },
    { value: "verified", label: "Email verified", summaryKey: "verified" },
    { value: "unverified", label: "Not verified", summaryKey: "unverified" },
  ],
  columns: [
    {
      label: "Student",
      render: (student) => (
        <div className="flex items-center gap-3">
          <InstituteAvatar name={fullName(student)} src={student.profilePicUrl} size="sm" />
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium text-gray-800">{fullName(student)}</p>
            <p className="max-w-[200px] truncate text-xs text-gray-500">{student.emailId || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Institute",
      render: (student, ctx) => (
        <button
          onClick={(event) => {
            event.stopPropagation();
            ctx.openInstitute(student);
          }}
          className="inline-flex max-w-full items-center gap-1.5 truncate text-left md:max-w-[200px] text-gray-600 hover:text-[#0A80F5] hover:underline"
        >
          <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="truncate">{student.institutionName || "—"}</span>
        </button>
      ),
    },
    { label: "Roll no", render: (student) => <span className="text-gray-600">{student.rollNo || "—"}</span> },
    { label: "Semester", render: (student) => <span className="text-gray-600">{student.semester || "—"}</span> },
    { label: "Phone", render: (student) => <span className="text-gray-600">{student.phone || "—"}</span> },
    { label: "Joined", render: (student) => <span className="whitespace-nowrap text-gray-600">{formatDate(student.createdAt)}</span> },
    {
      label: "Email",
      render: (student) => (
        <Pill tone={student.emailVerified ? "green" : "amber"}>{student.emailVerified ? "Verified" : "Not verified"}</Pill>
      ),
    },
  ],
  knownKeys: [
    "studentId", "firstName", "lastName", "emailId", "phone", "institutionId", "institutionName",
    "rollNo", "semester", "emailVerified", "emailVerifiedAt", "createdAt", "profilePicUrl", "type",
  ],
  drawerRows: (student, ctx) => [
    [
      "Institute",
      <button key="i" onClick={() => ctx.openInstitute(student)} className="text-indigo-600 hover:underline">
        {student.institutionName}
      </button>,
    ],
    ["Email", student.emailId, true],
    [
      "Email status",
      <Pill key="e" tone={student.emailVerified ? "green" : "amber"}>
        {student.emailVerified ? "Verified" : "Not verified"}
      </Pill>,
    ],
    ["Verified on", student.emailVerifiedAt ? formatDate(student.emailVerifiedAt, true) : "—"],
    ["Phone", student.phone, true],
    ["Roll no", student.rollNo],
    ["Semester", student.semester],
    ["Joined", formatDate(student.createdAt, true)],
    ["Student ID", student.studentId, true],
  ],
  csvColumns: [
    ["Student ID", (s) => s.studentId],
    ["Name", (s) => fullName(s)],
    ["Roll no", (s) => s.rollNo],
    ["Semester", (s) => s.semester],
    ["Email", (s) => s.emailId],
    ["Phone", (s) => s.phone],
    ["Institute", (s) => s.institutionName],
    ["Email verified", (s) => (s.emailVerified ? "Yes" : "No")],
    ["Joined", (s) => s.createdAt],
  ],
};

const Student = () => <PeopleListPage config={config} />;

export default Student;
