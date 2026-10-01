import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  BadgeCheck,
  CircleAlert,
  Clock,
  FileDown,
  GraduationCap,
  Mail,
  MailWarning,
  Phone,
  RefreshCw,
  Search,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { CopyText, DetailRow, InstituteAvatar, Pill, StatCard } from "../common/ui";
import { downloadCsv, formatDate, fullName, isSensitiveKey } from "../utils/format";

const statusOf = (person) => String(person?.status || "pending").toLowerCase();
const statusTone = { verified: "green", approved: "green", pending: "amber", rejected: "red" };
const statusText = { verified: "Verified", approved: "Verified", pending: "Pending", rejected: "Rejected" };

const selectClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0A80F5]";
const tableHead =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";

// ---------------------------------------------------------------------------
// shared bits
// ---------------------------------------------------------------------------

function Card({ title, subtitle, action, children }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-indigo-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="relative block w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </label>
  );
}

function SortSelect({ value, onChange, options }) {
  return (
    <label className="relative block">
      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Sort"
        className={`${selectClass} pl-9`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// Progress of real sign-ups against what the institute said it expected at registration
function CapacityBar({ label, actual, expected, tone }) {
  const target = Number(expected) || 0;
  const percent = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;

  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xs text-gray-400">
          {target ? `${percent}% of expected` : "No target set"}
        </p>
      </div>
      <p className="mt-1 text-xl font-semibold text-gray-800">
        {actual}
        {target > 0 && <span className="text-sm font-normal text-gray-400"> / {target}</span>}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ListState({ loading, error, onRetry, empty, emptyText, children }) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span className="flex-1">{error}</span>
        <button onClick={onRetry} className="font-semibold underline">
          Retry
        </button>
      </div>
    );
  }

  if (empty) {
    return <p className="py-10 text-center text-sm text-gray-500">{emptyText}</p>;
  }

  return children;
}

function PersonCell({ person }) {
  return (
    <div className="flex items-center gap-3">
      <InstituteAvatar name={fullName(person)} src={person.profilePicUrl} size="sm" />
      <div className="min-w-0">
        <p className="max-w-[180px] truncate font-medium text-gray-800">{fullName(person)}</p>
        <p className="max-w-[180px] truncate text-xs text-gray-500">{person.emailId || "—"}</p>
      </div>
    </div>
  );
}

export function PersonDrawer({ title, person, rows, knownKeys, onClose, onCopy }) {
  const extras = Object.entries(person).filter(
    ([key, value]) =>
      !knownKeys.includes(key) &&
      !isSensitiveKey(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <InstituteAvatar name={fullName(person)} src={person.profilePicUrl} />
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{title}</p>
              <h3 className="break-words text-lg font-semibold text-gray-800">{fullName(person)}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close details"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <dl>
            {rows.map(([label, value, copyable]) => (
              <DetailRow key={label} label={label}>
                {copyable ? (
                  <CopyText label={label} value={value} onCopy={onCopy} />
                ) : (
                  value ?? "—"
                )}
              </DetailRow>
            ))}
          </dl>

          {extras.length > 0 && (
            <details className="rounded-xl bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                All other fields ({extras.length})
              </summary>
              <dl className="mt-2">
                {extras.map(([key, value]) => (
                  <DetailRow key={key} label={key}>
                    <span className="text-xs">
                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                    </span>
                  </DetailRow>
                ))}
              </dl>
            </details>
          )}
        </div>
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------

const teacherSorters = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  name: (a, b) => fullName(a).localeCompare(fullName(b)),
};
const teacherKnown = [
  "teacherId", "firstName", "lastName", "emailId", "phone", "hotspotName",
  "institutionId", "type", "status", "createdAt", "profilePicUrl",
];

export function TeachersPanel({ teachers, expected, loading, error, onRetry, onCopy, institutionName }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const summary = { total: teachers.length, verified: 0, pending: 0, rejected: 0 };
    teachers.forEach((teacher) => {
      const state = statusOf(teacher);
      if (state === "verified" || state === "approved") summary.verified += 1;
      else if (state === "rejected") summary.rejected += 1;
      else summary.pending += 1;
    });
    return summary;
  }, [teachers]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return teachers
      .filter((teacher) => {
        const state = statusOf(teacher);
        const normalized = state === "approved" ? "verified" : state;
        if (status !== "all" && normalized !== status) return false;
        if (!term) return true;
        return [fullName(teacher), teacher.emailId, teacher.phone, teacher.hotspotName]
          .map((value) => value ?? "")
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort(teacherSorters[sortBy]);
  }, [teachers, search, status, sortBy]);

  const exportList = () => {
    downloadCsv(
      `${institutionName || "institute"}-teachers`.replace(/\s+/g, "-").toLowerCase(),
      [
        ["Teacher ID", (t) => t.teacherId],
        ["Name", (t) => fullName(t)],
        ["Email", (t) => t.emailId],
        ["Phone", (t) => t.phone],
        ["Hotspot name", (t) => t.hotspotName],
        ["Status", (t) => statusOf(t)],
        ["Joined", (t) => t.createdAt],
      ],
      visible
    );
    onCopy(`Exported ${visible.length} teachers to CSV`);
  };

  return (
    <Card
      title="Teachers"
      subtitle="Everyone who signed up as a teacher under this institute"
      action={
        <button
          onClick={onRetry}
          disabled={loading}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          aria-label="Refresh teachers"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      }
    >
      <ListState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!teachers.length}
        emptyText="No teachers have joined this institute yet."
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<GraduationCap className="h-5 w-5" />} tone="bg-purple-50 text-purple-600" />
          <StatCard label="Verified" value={stats.verified} icon={<BadgeCheck className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
          <StatCard label="Rejected" value={stats.rejected} icon={<X className="h-5 w-5" />} tone="bg-rose-50 text-rose-600" />
        </div>

        <div className="mb-4">
          <CapacityBar
            label="Verified teachers vs expected"
            actual={stats.verified}
            expected={expected}
            tone="bg-linear-to-r from-[#0BCCEB] to-[#0A80F5]"
          />
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, email, phone…" />
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status" className={selectClass}>
            <option value="all">All statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name", label: "Name A–Z" },
            ]}
          />
          <button
            onClick={exportList}
            disabled={!visible.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:ml-auto"
          >
            <FileDown className="h-4 w-4" /> Export
          </button>
        </div>

        <p className="mb-2 text-xs text-gray-400">
          Showing {visible.length} of {teachers.length}
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/70">
              <tr>
                <th className={tableHead}>Teacher</th>
                <th className={tableHead}>Phone</th>
                <th className={tableHead}>Hotspot</th>
                <th className={tableHead}>Joined</th>
                <th className={tableHead}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((teacher) => {
                const state = statusOf(teacher);
                return (
                  <tr
                    key={teacher.teacherId || teacher.emailId}
                    onClick={() => setSelected(teacher)}
                    className="cursor-pointer hover:bg-blue-50/40"
                  >
                    <td className="px-4 py-3"><PersonCell person={teacher} /></td>
                    <td className="px-4 py-3 text-gray-600">{teacher.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {teacher.hotspotName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Wifi className="h-3.5 w-3.5 text-gray-400" /> {teacher.hotspotName}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(teacher.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Pill tone={statusTone[state] || "gray"}>{statusText[state] || teacher.status}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && (
            <p className="py-8 text-center text-sm text-gray-500">No teachers match your filters.</p>
          )}
        </div>
      </ListState>

      {selected && (
        <PersonDrawer
          title="Teacher"
          person={selected}
          knownKeys={teacherKnown}
          onClose={() => setSelected(null)}
          onCopy={onCopy}
          rows={[
            ["Status", <Pill key="s" tone={statusTone[statusOf(selected)] || "gray"}>{statusText[statusOf(selected)] || selected.status}</Pill>],
            ["Email", selected.emailId, true],
            ["Phone", selected.phone, true],
            ["Hotspot name", selected.hotspotName],
            ["Joined", formatDate(selected.createdAt, true)],
            ["Teacher ID", selected.teacherId, true],
          ]}
        />
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

const studentSorters = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  name: (a, b) => fullName(a).localeCompare(fullName(b)),
  roll: (a, b) => String(a.rollNo || "").localeCompare(String(b.rollNo || ""), undefined, { numeric: true }),
};
const studentKnown = [
  "studentId", "firstName", "lastName", "emailId", "phone", "institutionId", "rollNo",
  "semester", "emailVerified", "emailVerifiedAt", "createdAt", "profilePicUrl", "type",
];

export function StudentsPanel({ students, expected, loading, error, onRetry, onCopy, institutionName }) {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("all");
  const [verification, setVerification] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState(null);

  const semesters = useMemo(
    () =>
      [...new Set(students.map((student) => student.semester).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b), undefined, { numeric: true })
      ),
    [students]
  );

  const stats = useMemo(() => {
    const verified = students.filter((student) => student.emailVerified === true).length;
    return { total: students.length, verified, unverified: students.length - verified };
  }, [students]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return students
      .filter((student) => {
        if (semester !== "all" && String(student.semester) !== semester) return false;
        if (verification === "verified" && student.emailVerified !== true) return false;
        if (verification === "unverified" && student.emailVerified === true) return false;
        if (!term) return true;
        return [fullName(student), student.emailId, student.phone, student.rollNo]
          .map((value) => value ?? "")
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort(studentSorters[sortBy]);
  }, [students, search, semester, verification, sortBy]);

  const exportList = () => {
    downloadCsv(
      `${institutionName || "institute"}-students`.replace(/\s+/g, "-").toLowerCase(),
      [
        ["Student ID", (s) => s.studentId],
        ["Name", (s) => fullName(s)],
        ["Roll no", (s) => s.rollNo],
        ["Semester", (s) => s.semester],
        ["Email", (s) => s.emailId],
        ["Phone", (s) => s.phone],
        ["Email verified", (s) => (s.emailVerified ? "Yes" : "No")],
        ["Joined", (s) => s.createdAt],
      ],
      visible
    );
    onCopy(`Exported ${visible.length} students to CSV`);
  };

  return (
    <Card
      title="Students"
      subtitle="Everyone who signed up as a student under this institute"
      action={
        <button
          onClick={onRetry}
          disabled={loading}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          aria-label="Refresh students"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      }
    >
      <ListState
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!students.length}
        emptyText="No students have joined this institute yet."
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total students" value={stats.total} icon={<Users className="h-5 w-5" />} tone="bg-blue-50 text-[#0A80F5]" />
          <StatCard label="Email verified" value={stats.verified} icon={<Mail className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
          <StatCard label="Not verified" value={stats.unverified} icon={<MailWarning className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
        </div>

        <div className="mb-4">
          <CapacityBar
            label="Students vs expected"
            actual={stats.total}
            expected={expected}
            tone="bg-linear-to-r from-[#0BCCEB] to-[#0A80F5]"
          />
        </div>

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchBox value={search} onChange={setSearch} placeholder="Search name, roll no, email…" />
          <select value={semester} onChange={(event) => setSemester(event.target.value)} aria-label="Filter by semester" className={selectClass}>
            <option value="all">All semesters</option>
            {semesters.map((item) => (
              <option key={item} value={String(item)}>
                {item}
              </option>
            ))}
          </select>
          <select value={verification} onChange={(event) => setVerification(event.target.value)} aria-label="Filter by email verification" className={selectClass}>
            <option value="all">Any email status</option>
            <option value="verified">Email verified</option>
            <option value="unverified">Not verified</option>
          </select>
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name", label: "Name A–Z" },
              { value: "roll", label: "Roll no" },
            ]}
          />
          <button
            onClick={exportList}
            disabled={!visible.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:ml-auto"
          >
            <FileDown className="h-4 w-4" /> Export
          </button>
        </div>

        <p className="mb-2 text-xs text-gray-400">
          Showing {visible.length} of {students.length}
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[660px] text-sm">
            <thead className="border-b border-gray-100 bg-gray-50/70">
              <tr>
                <th className={tableHead}>Student</th>
                <th className={tableHead}>Roll no</th>
                <th className={tableHead}>Semester</th>
                <th className={tableHead}>Phone</th>
                <th className={tableHead}>Joined</th>
                <th className={tableHead}>Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((student) => (
                <tr
                  key={student.studentId || student.emailId}
                  onClick={() => setSelected(student)}
                  className="cursor-pointer hover:bg-blue-50/40"
                >
                  <td className="px-4 py-3"><PersonCell person={student} /></td>
                  <td className="px-4 py-3 text-gray-600">{student.rollNo || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{student.semester || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {student.phone ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400" /> {student.phone}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(student.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Pill tone={student.emailVerified ? "green" : "amber"}>
                      {student.emailVerified ? "Verified" : "Not verified"}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && (
            <p className="py-8 text-center text-sm text-gray-500">No students match your filters.</p>
          )}
        </div>
      </ListState>

      {selected && (
        <PersonDrawer
          title="Student"
          person={selected}
          knownKeys={studentKnown}
          onClose={() => setSelected(null)}
          onCopy={onCopy}
          rows={[
            ["Email", selected.emailId, true],
            [
              "Email status",
              <Pill key="e" tone={selected.emailVerified ? "green" : "amber"}>
                {selected.emailVerified ? "Verified" : "Not verified"}
              </Pill>,
            ],
            ["Verified on", selected.emailVerifiedAt ? formatDate(selected.emailVerifiedAt, true) : "—"],
            ["Phone", selected.phone, true],
            ["Roll no", selected.rollNo],
            ["Semester", selected.semester],
            ["Joined", formatDate(selected.createdAt, true)],
            ["Student ID", selected.studentId, true],
          ]}
        />
      )}
    </Card>
  );
}
