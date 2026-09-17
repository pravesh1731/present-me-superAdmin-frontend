import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";
import { BaseUrl } from "../../Components/utils/constants";

const PAGE_SIZE = 50;
const typeTabs = [
  { label: "PYQ", value: "PYQ" },
  { label: "Notes", value: "Notes" },
];
const statusTabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "approved" },
  { label: "Cancelled", value: "cancelled" },
];
const courseDepartments = {
  "B.Tech": [
    "Artificial Intelligence",
    "Computer Science",
    "Information Technology",
    "Electronics & Communication",
    "Electrical",
    "Mechanical",
    "Industrial",
    "Civil",
    "Chemical",
    "VRX & Animation",
  ],
  Science: [
    "Biotechnology",
    "Botany",
    "Chemistry",
    "Zoology",
    "B.Pharma",
    "M.Pharma",
  ],
  Arts: [
    "B.Com",
    "BA in English",
    "Hindi",
    "Politics",
    "History",
    "Journalism & Mass Communication",
    "Economics",
    "Sociology",
  ],
  Other: ["BA LLB", "B.Com LLB", "B.Ed", "M.Ed"],
};

const valueOf = (item, keys, fallback = "—") =>
  keys
    .map((key) => item?.[key])
    .find((value) => value !== undefined && value !== null && value !== "") ??
  fallback;
const formatDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
};

function StatusBadge({ status }) {
  const value = String(status || "pending").toLowerCase();
  const style =
    value === "approved" || value === "verified"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : value === "cancelled" || value === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-600/20"
        : "bg-amber-50 text-amber-700 ring-amber-600/20";
  const label =
    value === "approved" || value === "verified"
      ? "Verified"
      : value === "rejected"
        ? "Cancelled"
        : status || "Pending";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}

function PyqAndNotes() {
  const [type, setType] = useState("PYQ");
  const [status, setStatus] = useState("all");
  const [filters, setFilters] = useState({
    institutionId: "",
    year: "",
    course: "",
    department: "",
  });
  const [items, setItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyForm, setVerifyForm] = useState({ amount: "", description: "" });
  const [uploadForm, setUploadForm] = useState({
    type: "PYQ",
    institutionId: "",
    semester: "",
    year: "",
    course: "",
    department: "",
    teacherName: "",
    file: null,
  });

  const departments = useMemo(
    () => courseDepartments[filters.course] || [],
    [filters.course],
  );
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return !term
      ? items
      : items.filter((item) =>
          [
            "fileName",
            "title",
            "noteTitle",
            "name",
            "institutionName",
            "InstitutionName",
            "instituteName",
            "department",
            "departmentName",
            "uploadedByName",
            "uploadedBy",
            "uploaderName",
          ]
            .map((key) => item?.[key] || "")
            .join(" ")
            .toLowerCase()
            .includes(term),
        );
  }, [items, search]);

  const loadNotes = async (cursor = null) => {
    setLoading(true);
    setError("");
    try {
      const params = { type, status, pageSize: PAGE_SIZE };
      if (filters.institutionId) params.institutionId = filters.institutionId;
      if (filters.year) params.year = filters.year;
      if (filters.course) params.course = filters.course;
      if (filters.department) params.department = filters.department;
      if (cursor) params.cursor = cursor;
      const response = await axios.get(`${BaseUrl}/sadmin/pyq-notes`, {
        params,
        withCredentials: true,
      });
      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
      setNextCursor(response.data?.nextCursor || null);
    } catch (requestError) {
      console.error("Unable to load notes and PYQs:", requestError);
      setItems([]);
      setNextCursor(null);
      setError(
        requestError.response?.data?.message ||
          "Unable to load documents. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${BaseUrl}/sadmin/verifiedInstitutes`, { withCredentials: true })
      .then((response) =>
        setInstitutes(
          Array.isArray(response.data?.data) ? response.data.data : [],
        ),
      )
      .catch((requestError) =>
        console.error("Unable to load institutes:", requestError),
      );
  }, []);
  useEffect(() => {
    setCursorHistory([]);
    setPage(1);
    loadNotes();
    // Filter changes must restart DynamoDB cursor pagination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    type,
    status,
    filters.institutionId,
    filters.year,
    filters.course,
    filters.department,
  ]);

  const changeFilter = (key, value) =>
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(["institutionId", "course"].includes(key) ? { department: "" } : {}),
    }));
  const goNext = () => {
    if (!nextCursor || loading) return;
    setCursorHistory((history) => [...history, nextCursor]);
    setPage((number) => number + 1);
    loadNotes(nextCursor);
  };
  const goPrevious = () => {
    if (!cursorHistory.length || loading) return;
    const history = cursorHistory.slice(0, -1);
    setCursorHistory(history);
    setPage((number) => number - 1);
    loadNotes(history.at(-1) || null);
  };
  const years = Array.from({ length: 12 }, (_, index) =>
    String(new Date().getFullYear() - index),
  );
  const openUpload = () => {
    setUploadError("");
    setUploadForm({ type, institutionId: "", semester: "", year: "", course: "", department: "", teacherName: "", file: null });
    setUploadOpen(true);
  };
  const closeUpload = () => {
    if (!uploading) setUploadOpen(false);
  };
  const changeUploadForm = (key, value) => setUploadForm((current) => ({
    ...current,
    [key]: value,
    ...(key === "course" ? { department: "" } : {}),
  }));
  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadError("");
    const data = new FormData();
    ["type", "institutionId", "semester", "year", "course", "department", "teacherName"].forEach((key) => {
      if (uploadForm[key]) data.append(key, uploadForm[key]);
    });
    if (uploadForm.file) data.append("file", uploadForm.file);
    setUploading(true);
    try {
      await axios.post(`${BaseUrl}/sadmin/pyq-notes/upload`, data, { withCredentials: true });
      setUploadOpen(false);
      setStatus("approved");
      setType(uploadForm.type);
      setFilters({ institutionId: "", year: "", course: "", department: "" });
      setCursorHistory([]);
      setPage(1);
      await loadNotes();
    } catch (requestError) {
      setUploadError(requestError.response?.data?.message || "Unable to upload the document. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  const openVerify = (item) => {
    setVerifyError("");
    setVerifyForm({ amount: "", description: "" });
    setVerifyingItem(item);
  };
  const closeVerify = () => {
    if (!verifying) setVerifyingItem(null);
  };
  const handleVerify = async (event) => {
    event.preventDefault();
    const noteId = valueOf(verifyingItem, ["noteId", "id"], "");
    if (!noteId) return;
    setVerifying(true);
    setVerifyError("");
    try {
      await axios.post(`${BaseUrl}/sadmin/pyq-notes/${noteId}/verify`, { amount: Number(verifyForm.amount), description: verifyForm.description.trim() }, { withCredentials: true });
      setVerifyingItem(null);
      await loadNotes(cursorHistory.at(-1) || null);
    } catch (requestError) {
      setVerifyError(requestError.response?.data?.message || "Unable to verify this document. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="pb-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">PYQ & Notes</h2>
          <p className="mt-1 text-sm text-gray-500">Review documents submitted by institutes and students.</p>
        </div>
        <button onClick={openUpload} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0874dd]">
          <Upload className="h-4 w-4" /> Upload file
        </button>
      </div>
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="border-b border-gray-200 px-4 pt-4 sm:px-6">
          <div className="flex gap-6" role="tablist" aria-label="Document type">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                role="tab"
                aria-selected={type === tab.value}
                className={`border-b-2 px-1 pb-3 text-sm font-semibold ${type === tab.value ? "border-[#0A80F5] text-[#0A80F5]" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Document status"
            >
              {statusTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatus(tab.value)}
                  role="tab"
                  aria-selected={status === tab.value}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${status === tab.value ? "bg-[#0A80F5] text-white shadow-sm" : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <label className="relative block w-full xl:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
                placeholder="Search this page..."
              />
            </label>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="h-4 w-4 text-[#0A80F5]" /> Filters
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              value={filters.institutionId}
              onChange={(event) =>
                changeFilter("institutionId", event.target.value)
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5]"
            >
              <option value="">All institutes</option>
              {institutes.map((item) => (
                <option
                  key={valueOf(item, ["institutionId", "id"])}
                  value={valueOf(item, ["institutionId", "id"])}
                >
                  {valueOf(item, [
                    "InstitutionName",
                    "institutionName",
                    "name",
                  ])}
                </option>
              ))}
            </select>
            <select
              value={filters.year}
              onChange={(event) => changeFilter("year", event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5]"
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <select
              value={filters.course}
              onChange={(event) => changeFilter("course", event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5]"
            >
              <option value="">All courses</option>
              {Object.keys(courseDepartments).map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
            <select
              value={filters.department}
              onChange={(event) =>
                changeFilter("department", event.target.value)
              }
              disabled={!filters.course}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">
                {filters.course ? "All departments" : "Select course first"}
              </option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setFilters({
                  institutionId: "",
                  year: "",
                  course: "",
                  department: "",
                })
              }
              disabled={
                !filters.institutionId &&
                !filters.year &&
                !filters.course &&
                !filters.department
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Clear filters
            </button>
          </div>
        </div>
        {error && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:m-6">
            {error}
          </div>
        )}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[750px] text-left">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-4 py-4 font-medium">Year / Department</th>
                <th className="px-4 py-4 font-medium">Submitted by</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="h-4 w-48 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-4 w-24 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-4 w-24 rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="h-6 w-20 rounded-full bg-gray-100" />
                      </td>
                      <td />
                    </tr>
                  ))
                : visibleItems.map((item, index) => (
                    <DocumentRow
                      key={valueOf(item, ["noteId", "id", "documentId"], index)}
                      item={item}
                      onVerify={openVerify}
                    />
                  ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-4 md:hidden">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-gray-100 p-4"
                >
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))
            : visibleItems.map((item, index) => (
                <DocumentCard
                  key={valueOf(item, ["noteId", "id", "documentId"], index)}
                  item={item}
                  onVerify={openVerify}
                />
              ))}
        </div>
        {!loading && !visibleItems.length && (
          <div className="px-6 py-16 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-3 font-medium text-gray-800">
              No documents found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try a different status or clear the filters.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-700">{page}</span> · Up
            to {PAGE_SIZE} documents per page
          </p>
          <div className="flex gap-2">
            <button
              onClick={goPrevious}
              disabled={!cursorHistory.length || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <button
              onClick={goNext}
              disabled={!nextCursor || loading}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0A80F5] px-3 py-2 text-sm font-medium text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      {uploadOpen && <UploadDialog form={uploadForm} institutes={institutes} years={years} uploading={uploading} error={uploadError} onClose={closeUpload} onChange={changeUploadForm} onSubmit={handleUpload} />}
      {verifyingItem && <VerifyDialog item={verifyingItem} form={verifyForm} verifying={verifying} error={verifyError} onClose={closeVerify} onChange={(key, value) => setVerifyForm((current) => ({ ...current, [key]: value }))} onSubmit={handleVerify} />}
    </div>
  );
}

function UploadDialog({ form, institutes, years, uploading, error, onClose, onChange, onSubmit }) {
  const departments = courseDepartments[form.course] || [];
  const semesters = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"];
  const selectClass = "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";
  return <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="upload-title">
    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl">
      <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6"><div><h3 id="upload-title" className="text-lg font-semibold text-gray-800">Upload PYQ or Notes</h3><p className="mt-1 text-sm text-gray-500">Required fields are marked with an asterisk.</p></div><button onClick={onClose} disabled={uploading} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50" aria-label="Close upload dialog"><X className="h-5 w-5" /></button></div>
      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Type *<select required value={form.type} onChange={(event) => onChange("type", event.target.value)} className={selectClass}><option value="PYQ">PYQ</option><option value="Notes">Notes</option></select></label>
          <label className="text-sm font-medium text-gray-700">Institute *<select required value={form.institutionId} onChange={(event) => onChange("institutionId", event.target.value)} className={selectClass}><option value="">Select institute</option>{institutes.map((item) => <option key={valueOf(item, ["institutionId", "id"])} value={valueOf(item, ["institutionId", "id"])}>{valueOf(item, ["InstitutionName", "institutionName", "name"])}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Course *<select required value={form.course} onChange={(event) => onChange("course", event.target.value)} className={selectClass}><option value="">Select course</option>{Object.keys(courseDepartments).map((course) => <option key={course} value={course}>{course}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Department *<select required disabled={!form.course} value={form.department} onChange={(event) => onChange("department", event.target.value)} className={`${selectClass} disabled:cursor-not-allowed disabled:bg-gray-100`}><option value="">{form.course ? "Select department" : "Select course first"}</option>{departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Semester *<select required value={form.semester} onChange={(event) => onChange("semester", event.target.value)} className={selectClass}><option value="">Select semester</option>{semesters.map((semester) => <option key={semester} value={semester}>{semester}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Year *<select required value={form.year} onChange={(event) => onChange("year", event.target.value)} className={selectClass}><option value="">Select year</option>{years.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
        </div>
        {form.type === "Notes" && <label className="block text-sm font-medium text-gray-700">Teacher name *<input required value={form.teacherName} onChange={(event) => onChange("teacherName", event.target.value)} className={selectClass} placeholder="Enter teacher name" /></label>}
        <label className="block text-sm font-medium text-gray-700">Document file *<input required type="file" accept=".pdf,.doc,.docx,image/*" onChange={(event) => onChange("file", event.target.files?.[0] || null)} className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#0A80F5]" /><span className="mt-1 block text-xs text-gray-500">PDF, DOC, DOCX, or image files accepted by your server.</span></label>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={uploading} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-60"><Upload className="h-4 w-4" />{uploading ? "Uploading..." : "Upload & approve"}</button></div>
      </form>
    </div>
  </div>;
}

function VerifyDialog({ item, form, verifying, error, onClose, onChange, onSubmit }) {
  const fileName = valueOf(item, ["fileName", "title", "noteTitle", "name"], "this document");
  const inputClass = "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";
  return <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="verify-title">
    <div className="w-full rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
      <div className="flex items-start justify-between border-b border-gray-100 p-5"><div><h3 id="verify-title" className="text-lg font-semibold text-gray-800">Verify document</h3><p className="mt-1 truncate text-sm text-gray-500">{fileName}</p></div><button onClick={onClose} disabled={verifying} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50" aria-label="Close verification dialog"><X className="h-5 w-5" /></button></div>
      <form onSubmit={onSubmit} className="space-y-4 p-5">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">{error}</div>}
        <label className="block text-sm font-medium text-gray-700">Reward amount *<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => onChange("amount", event.target.value)} className={inputClass} placeholder="e.g. 25" /></label>
        <label className="block text-sm font-medium text-gray-700">Description *<textarea required minLength="1" value={form.description} onChange={(event) => onChange("description", event.target.value)} className={`${inputClass} min-h-24 resize-y`} placeholder="Why is this document being verified?" /></label>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={verifying} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">Cancel</button><button type="submit" disabled={verifying} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{verifying ? "Verifying..." : "Verify & credit"}</button></div>
      </form>
    </div>
  </div>;
}

function DocumentRow({ item, onVerify }) {
  const title = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "Untitled document",
  );
  const url = valueOf(item, ["fileUrl", "url", "documentUrl", "pdfUrl"], "");
  return (
    <tr className="text-sm hover:bg-gray-50/80">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-[#0A80F5]">
            <FileText className="h-4 w-4" />
          </span>
          <div>
            <p className="max-w-[220px] truncate font-medium text-gray-800">
              {title}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {formatDate(
                valueOf(item, ["createdAt", "uploadedAt", "created_on"], ""),
              )}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        <div>{valueOf(item, ["year", "academicYear"])}</div>
        <div className="mt-0.5 text-xs text-gray-500">
          {valueOf(item, ["department", "departmentName"])}
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        {valueOf(item, [
          "uploaderName",
          "teacherName",
          "uploadedByName",
          "uploadedBy",
          "createdBy",
        ])}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={valueOf(item, ["status"], "pending")} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
        {String(valueOf(item, ["status"], "")).toLowerCase() === "pending" && <button onClick={() => onVerify(item)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Verify</button>}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0A80F5]"
          >
            View <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs text-gray-400">No file link</span>
        )}
        </div>
      </td>
    </tr>
  );
}

function DocumentCard({ item, onVerify }) {
  const title = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "Untitled document",
  );
  const url = valueOf(item, ["fileUrl", "url", "documentUrl", "pdfUrl"], "");
  return (
    <article className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-[#0A80F5]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-800">
              {title}
            </h3>
          </div>
        </div>
        <StatusBadge status={valueOf(item, ["status"], "pending")} />
      </div>
      <p className="mt-3 text-xs text-gray-500">
        {valueOf(item, ["year", "academicYear"])} ·{" "}
        {valueOf(item, ["department", "departmentName"])}
      </p>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#0A80F5]"
        >
          View document <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
      {String(valueOf(item, ["status"], "")).toLowerCase() === "pending" && <button onClick={() => onVerify(item)} className="mt-3 block rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Verify</button>}
    </article>
  );
}

export default PyqAndNotes;
