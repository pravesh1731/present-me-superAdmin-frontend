import React from "react";
import { Building2, GraduationCap, Wifi } from "lucide-react";
import PeopleListPage from "../../Components/people/PeopleListPage";
import { InstituteAvatar, Pill } from "../../Components/common/ui";
import { formatDate, fullName } from "../../Components/utils/format";

const tone = { verified: "green", approved: "green", pending: "amber", rejected: "red" };
const label = { verified: "Verified", approved: "Verified", pending: "Pending", rejected: "Rejected" };
const stateOf = (teacher) => String(teacher.status || "pending").toLowerCase();

const InstituteLink = ({ row, openInstitute }) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      openInstitute(row);
    }}
    className="inline-flex max-w-full items-center gap-1.5 truncate text-left md:max-w-[200px] text-gray-600 hover:text-[#0A80F5] hover:underline"
  >
    <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
    <span className="truncate">{row.institutionName || "—"}</span>
  </button>
);

const config = {
  kind: "teachers",
  title: "Teachers",
  subtitle: "Every teacher registered on Present-Me, across all institutes. Institute admins approve teachers; you can browse them here.",
  endpoint: "/sadmin/teachers",
  statusParam: "status",
  personLabel: "Teacher",
  idKey: "teacherId",
  searchPlaceholder: "Search name, email, phone, institute…",
  EmptyIcon: GraduationCap,
  emptyTitle: "No teachers found",
  emptyText: "Teachers appear here once they sign up under an institute.",
  tabs: [
    { value: "all", label: "All", summaryKey: "all" },
    { value: "verified", label: "Verified", summaryKey: "verified" },
    { value: "pending", label: "Pending", summaryKey: "pending" },
    { value: "rejected", label: "Rejected", summaryKey: "rejected" },
  ],
  columns: [
    {
      label: "Teacher",
      render: (teacher) => (
        <div className="flex items-center gap-3">
          <InstituteAvatar name={fullName(teacher)} src={teacher.profilePicUrl} size="sm" />
          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium text-gray-800">{fullName(teacher)}</p>
            <p className="max-w-[200px] truncate text-xs text-gray-500">{teacher.emailId || "—"}</p>
          </div>
        </div>
      ),
    },
    { label: "Institute", render: (teacher, ctx) => <InstituteLink row={teacher} openInstitute={ctx.openInstitute} /> },
    { label: "Phone", render: (teacher) => <span className="text-gray-600">{teacher.phone || "—"}</span> },
    {
      label: "Hotspot",
      render: (teacher) =>
        teacher.hotspotName ? (
          <span className="inline-flex items-center gap-1.5 text-gray-600">
            <Wifi className="h-3.5 w-3.5 text-gray-400" /> {teacher.hotspotName}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    { label: "Joined", render: (teacher) => <span className="whitespace-nowrap text-gray-600">{formatDate(teacher.createdAt)}</span> },
    {
      label: "Status",
      render: (teacher) => <Pill tone={tone[stateOf(teacher)] || "gray"}>{label[stateOf(teacher)] || teacher.status}</Pill>,
    },
  ],
  knownKeys: [
    "teacherId", "firstName", "lastName", "emailId", "phone", "hotspotName", "institutionId",
    "institutionName", "type", "status", "createdAt", "profilePicUrl",
  ],
  drawerRows: (teacher, ctx) => [
    ["Status", <Pill key="s" tone={tone[stateOf(teacher)] || "gray"}>{label[stateOf(teacher)] || teacher.status}</Pill>],
    [
      "Institute",
      <button key="i" onClick={() => ctx.openInstitute(teacher)} className="text-indigo-600 hover:underline">
        {teacher.institutionName}
      </button>,
    ],
    ["Email", teacher.emailId, true],
    ["Phone", teacher.phone, true],
    ["Hotspot name", teacher.hotspotName],
    ["Joined", formatDate(teacher.createdAt, true)],
    ["Teacher ID", teacher.teacherId, true],
  ],
  csvColumns: [
    ["Teacher ID", (t) => t.teacherId],
    ["Name", (t) => fullName(t)],
    ["Email", (t) => t.emailId],
    ["Phone", (t) => t.phone],
    ["Institute", (t) => t.institutionName],
    ["Hotspot name", (t) => t.hotspotName],
    ["Status", (t) => stateOf(t)],
    ["Joined", (t) => t.createdAt],
  ],
};

const Teacher = () => <PeopleListPage config={config} />;

export default Teacher;
