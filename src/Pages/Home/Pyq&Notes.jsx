import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadOverview } from "../../Components/utils/overview";
import {
  ArrowUpDown,
  CircleAlert,
  RefreshCw,
  SlidersHorizontal,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
  Upload,
  Wallet,
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
  { label: "Rejected", value: "rejected" },
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

const formatDateTime = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
};
const formatMoney = (value) =>
  value === undefined || value === null || value === ""
    ? "—"
    : `₹${Number(value).toLocaleString("en-IN")}`;
const statusOf = (item) => {
  const value = String(item?.status || "pending").toLowerCase();
  return value === "verified" ? "approved" : value;
};
const roleLabel = (role) =>
  ({ student: "Student", teacher: "Teacher", super_admin: "Super Admin" })[
    role
  ] ||
  role ||
  "—";
const fileExtension = (item) => {
  const name = String(item?.fileName || item?.fileKey || "");
  const ext = name.includes(".") ? name.split(".").pop() : "";
  return ext && ext.length <= 5 ? ext.toUpperCase() : "";
};
const timeOf = (item) =>
  new Date(item?.createdAt || item?.uploadedAt || item?.created_on || 0).getTime();

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "downloads", label: "Most downloads" },
  { value: "reward", label: "Highest reward" },
  { value: "name", label: "Name A–Z" },
];
const sorters = {
  newest: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  downloads: (a, b) => (Number(b.downloads) || 0) - (Number(a.downloads) || 0),
  reward: (a, b) => (Number(b.rewardAmount) || 0) - (Number(a.rewardAmount) || 0),
  name: (a, b) => String(a.fileName || "").localeCompare(String(b.fileName || "")),
};
const semesterOptions = Array.from(
  { length: 8 },
  (_, index) =>
    `${index + 1}${["st", "nd", "rd"][index] || "th"} Semester`,
);

const csvCell = (value) =>
  `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
const exportCsv = (rows, instituteNames, type) => {
  const columns = [
    ["Note ID", (n) => n.noteId],
    ["Type", (n) => n.type],
    ["File name", (n) => n.fileName],
    ["Institute", (n) => instituteNames[n.institutionId] || n.institutionId],
    ["Course", (n) => n.course],
    ["Department", (n) => n.department],
    ["Semester", (n) => n.semester],
    ["Year", (n) => n.year],
    ["Teacher", (n) => n.teacherName],
    ["Uploaded by", (n) => n.uploaderName],
    ["Uploader role", (n) => roleLabel(n.uploaderRole)],
    ["Status", (n) => statusOf(n)],
    ["Downloads", (n) => n.downloads],
    ["Reward", (n) => n.rewardAmount],
    ["Reason / description", (n) => n.description],
    ["Uploaded at", (n) => n.createdAt],
    ["Approved at", (n) => n.approvedAt],
    ["Rejected at", (n) => n.rejectedAt],
    ["File URL", (n) => n.fileUrl],
  ];
  const lines = [
    columns.map(([label]) => csvCell(label)).join(","),
    ...rows.map((row) => columns.map(([, get]) => csvCell(get(row))).join(",")),
  ];
  const blob = new Blob(["\ufeff" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${type.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
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
        ? "Rejected"
        : "Pending";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}

function PyqAndNotes() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  // deep links from the dashboard: /superadmin/pyq-notes?type=Notes&status=pending
  const [type, setType] = useState(
    ["PYQ", "Notes"].includes(searchParams.get("type")) ? searchParams.get("type") : "PYQ"
  );
  const [status, setStatus] = useState(
    ["pending", "approved", "rejected"].includes(searchParams.get("status"))
      ? searchParams.get("status")
      : "all"
  );
  const [filters, setFilters] = useState({
    // deep link from an institute page: /superadmin/pyq-notes?institutionId=...
    institutionId: searchParams.get("institutionId") || "",
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
  const [semesterFilter, setSemesterFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [verifyingItem, setVerifyingItem] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyForm, setVerifyForm] = useState({ amount: "", description: "" });
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectError, setRejectError] = useState("");
  const [rejectDescription, setRejectDescription] = useState("");
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
  const instituteNames = useMemo(() => {
    const map = {};
    institutes.forEach((item) => {
      const id = valueOf(item, ["institutionId", "id"], "");
      if (id)
        map[id] = valueOf(
          item,
          ["InstitutionName", "institutionName", "name"],
          id,
        );
    });
    return map;
  }, [institutes]);
  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filteredItems = items.filter((item) => {
      if (semesterFilter && item?.semester !== semesterFilter) return false;
      if (roleFilter && item?.uploaderRole !== roleFilter) return false;
      if (!term) return true;
      return [
        item?.fileName,
        item?.noteId,
        item?.course,
        item?.department,
        item?.semester,
        item?.year,
        item?.teacherName,
        item?.uploaderName,
        item?.description,
        instituteNames[item?.institutionId],
      ]
        .map((value) => value ?? "")
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    return [...filteredItems].sort(sorters[sortBy]);
  }, [items, search, semesterFilter, roleFilter, sortBy, instituteNames]);

  // Summary of the rows currently loaded (the API is paginated, so this is per page)
  const stats = useMemo(() => {
    const summary = {
      total: items.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      downloads: 0,
      rewards: 0,
    };
    items.forEach((item) => {
      const state = statusOf(item);
      if (summary[state] !== undefined) summary[state] += 1;
      summary.downloads += Number(item.downloads) || 0;
      summary.rewards += Number(item.rewardAmount) || 0;
    });
    return summary;
  }, [items]);

  const notify = (message, tone = "success") => setToast({ message, tone });
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  // "/" jumps to search, like most admin tools
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeChips = [
    filters.institutionId && {
      label: instituteNames[filters.institutionId] || "Institute",
      clear: () => changeFilter("institutionId", ""),
    },
    filters.year && { label: filters.year, clear: () => changeFilter("year", "") },
    filters.course && {
      label: filters.course,
      clear: () => changeFilter("course", ""),
    },
    filters.department && {
      label: filters.department,
      clear: () => changeFilter("department", ""),
    },
    semesterFilter && { label: semesterFilter, clear: () => setSemesterFilter("") },
    roleFilter && {
      label: roleLabel(roleFilter),
      clear: () => setRoleFilter(""),
    },
    search.trim() && { label: `“${search.trim()}”`, clear: () => setSearch("") },
  ].filter(Boolean);
  const clearAllFilters = () => {
    setFilters({ institutionId: "", year: "", course: "", department: "" });
    setSemesterFilter("");
    setRoleFilter("");
    setSearch("");
  };
  const navigateDrawer = (delta) => {
    const index = visibleItems.findIndex((row) => row.noteId === selectedItem?.noteId);
    const next = visibleItems[index + delta];
    if (next) setSelectedItem(next);
  };
  const selectedIndex = selectedItem
    ? visibleItems.findIndex((row) => row.noteId === selectedItem.noteId)
    : -1;

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
    setUploadForm({
      type,
      institutionId: "",
      semester: "",
      year: "",
      course: "",
      department: "",
      teacherName: "",
      file: null,
    });
    setUploadOpen(true);
  };
  const closeUpload = () => {
    if (!uploading) setUploadOpen(false);
  };
  const changeUploadForm = (key, value) =>
    setUploadForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "course" ? { department: "" } : {}),
    }));
  const handleUpload = async (event) => {
    event.preventDefault();
    setUploadError("");
    const data = new FormData();
    [
      "type",
      "institutionId",
      "semester",
      "year",
      "course",
      "department",
      "teacherName",
    ].forEach((key) => {
      if (uploadForm[key]) data.append(key, uploadForm[key]);
    });
    if (uploadForm.file) data.append("file", uploadForm.file);
    setUploading(true);
    try {
      await axios.post(`${BaseUrl}/sadmin/pyq-notes/upload`, data, {
        withCredentials: true,
      });
      setUploadOpen(false);
      notify("File uploaded and approved");
      loadOverview(dispatch, { force: true });
      setStatus("approved");
      setType(uploadForm.type);
      setFilters({ institutionId: "", year: "", course: "", department: "" });
      setCursorHistory([]);
      setPage(1);
      await loadNotes();
    } catch (requestError) {
      setUploadError(
        requestError.response?.data?.message ||
          "Unable to upload the document. Please try again.",
      );
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
      await axios.post(
        `${BaseUrl}/sadmin/pyq-notes/${noteId}/verify`,
        {
          amount: Number(verifyForm.amount),
          description: verifyForm.description.trim(),
        },
        { withCredentials: true },
      );
      setVerifyingItem(null);
      setSelectedItem(null);
      notify(`Verified — ${formatMoney(verifyForm.amount)} credited to the uploader`);
      loadOverview(dispatch, { force: true });
      await loadNotes(cursorHistory.at(-1) || null);
    } catch (requestError) {
      setVerifyError(
        requestError.response?.data?.message ||
          "Unable to verify this document. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const openReject = (item) => {
    setRejectError("");
    setRejectDescription("");
    setRejectingItem(item);
  };

  const closeReject = () => {
    if (!rejecting) {
      setRejectingItem(null);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    const noteId = valueOf(rejectingItem, ["noteId", "id"], "");

    if (!noteId) {
      setRejectError("Note ID is missing.");
      return;
    }

    if (!rejectDescription.trim()) {
      setRejectError("Rejection description is required.");
      return;
    }

    setRejecting(true);
    setRejectError("");

    try {
      await axios.post(
        `${BaseUrl}/sadmin/pyq-notes/${noteId}/reject`,
        {
          description: rejectDescription.trim(),
        },
        {
          withCredentials: true,
        },
      );

      // Close modal
      setRejectingItem(null);
      setSelectedItem(null);
      notify("Document rejected");
      loadOverview(dispatch, { force: true });

      // Refresh current page
      await loadNotes(cursorHistory.at(-1) || null);
    } catch (requestError) {
      console.error("Unable to reject document:", requestError);

      setRejectError(
        requestError.response?.data?.message ||
          "Unable to reject this document. Please try again.",
      );
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="pb-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">PYQ & Notes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Review documents submitted by institutes and students.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              exportCsv(visibleItems, instituteNames, type);
              notify(`Exported ${visibleItems.length} rows to CSV`);
            }}
            disabled={loading || !visibleItems.length}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={openUpload}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0874dd]"
          >
            <Upload className="h-4 w-4" /> Upload file
          </button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          label="On this page"
          value={stats.total}
          icon={<FileText className="h-5 w-5" />}
          tone="bg-blue-50 text-[#0A80F5]"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          tone="bg-amber-50 text-amber-600"
          loading={loading}
        />
        <StatCard
          label="Verified"
          value={stats.approved}
          icon={<CircleCheck className="h-5 w-5" />}
          tone="bg-emerald-50 text-emerald-600"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<CircleX className="h-5 w-5" />}
          tone="bg-rose-50 text-rose-600"
          loading={loading}
        />
        <StatCard
          label="Rewards paid"
          value={formatMoney(stats.rewards)}
          hint={`${stats.downloads.toLocaleString("en-IN")} downloads`}
          icon={<Wallet className="h-5 w-5" />}
          tone="bg-indigo-50 text-indigo-600"
          loading={loading}
          className="col-span-2 lg:col-span-1"
        />
      </div>
      {!loading && stats.pending > 0 && status !== "pending" && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <Clock className="h-4 w-4 shrink-0" />
            <span>
              <strong>{stats.pending}</strong> {type} document
              {stats.pending === 1 ? " is" : "s are"} waiting for your review on this page.
            </span>
          </p>
          <button
            onClick={() => setStatus("pending")}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
          >
            Review now
          </button>
        </div>
      )}
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
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${status === tab.value ? "bg-[#0A80F5] text-white shadow-sm" : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
                  placeholder="Search documents…"
                  aria-label="Search documents"
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400">
                    /
                  </kbd>
                )}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters((value) => !value)}
                  aria-expanded={showFilters}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition sm:flex-none ${showFilters || activeChips.length ? "border-[#0A80F5] bg-blue-50 text-[#0A80F5]" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeChips.length > 0 && (
                    <span className="rounded-full bg-[#0A80F5] px-1.5 text-[11px] font-semibold text-white">
                      {activeChips.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => loadNotes(cursorHistory.at(-1) || null)}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Refresh list"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FilterSelect
                  label="Institute"
                  value={filters.institutionId}
                  onChange={(value) => changeFilter("institutionId", value)}
                >
                  <option value="">All institutes</option>
                  {institutes.map((item) => (
                    <option
                      key={valueOf(item, ["institutionId", "id"])}
                      value={valueOf(item, ["institutionId", "id"])}
                    >
                      {valueOf(item, ["InstitutionName", "institutionName", "name"])}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Year"
                  value={filters.year}
                  onChange={(value) => changeFilter("year", value)}
                >
                  <option value="">All years</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Course"
                  value={filters.course}
                  onChange={(value) => changeFilter("course", value)}
                >
                  <option value="">All courses</option>
                  {Object.keys(courseDepartments).map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Department"
                  value={filters.department}
                  onChange={(value) => changeFilter("department", value)}
                  disabled={!filters.course}
                >
                  <option value="">
                    {filters.course ? "All departments" : "Select course first"}
                  </option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </FilterSelect>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3 sm:grid-cols-3">
                <FilterSelect
                  label="Semester · this page"
                  value={semesterFilter}
                  onChange={setSemesterFilter}
                >
                  <option value="">All semesters</option>
                  {semesterOptions.map((semester) => (
                    <option key={semester} value={semester}>
                      {semester}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Uploaded by · this page"
                  value={roleFilter}
                  onChange={setRoleFilter}
                >
                  <option value="">Everyone</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="super_admin">Super Admin</option>
                </FilterSelect>
                <FilterSelect label="Sort by" value={sortBy} onChange={setSortBy}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </div>
          )}

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-xs font-medium text-[#0A80F5] ring-1 ring-inset ring-blue-100"
                >
                  {chip.label}
                  <button
                    onClick={chip.clear}
                    className="rounded-full p-0.5 hover:bg-blue-100"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <RotateCcw className="h-3 w-3" /> Clear all
              </button>
            </div>
          )}
        </div>
        {error && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:m-6">
            {error}
          </div>
        )}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] text-left">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Document</th>
                <th className="px-4 py-4 font-medium">Institute</th>
                <th className="px-4 py-4 font-medium">Course / Semester</th>
                <th className="px-4 py-4 font-medium">Submitted by</th>
                <th className="px-4 py-4 font-medium">Activity</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="sticky right-0 bg-white px-4 py-4 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-5">
                        <div className="h-4 w-48 rounded bg-gray-100" />
                      </td>
                      {Array.from({ length: 4 }).map((__, cell) => (
                        <td key={cell} className="px-4 py-5">
                          <div className="h-4 w-24 rounded bg-gray-100" />
                        </td>
                      ))}
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
                      instituteName={instituteNames[item.institutionId]}
                      onOpen={setSelectedItem}
                      onVerify={openVerify}
                      onReject={openReject}
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
                  instituteName={instituteNames[item.institutionId]}
                  onOpen={setSelectedItem}
                  onVerify={openVerify}
                  onReject={openReject}
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
              {nextCursor
                ? "Nothing matches on this page, but more pages are available — try Next."
                : "Try a different status or clear the filters."}
            </p>
            {(activeChips.length > 0 || status !== "all") && (
              <button
                onClick={() => {
                  clearAllFilters();
                  setStatus("all");
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset everything
              </button>
            )}
          </div>
        )}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-700">{page}</span> ·
            Showing {visibleItems.length} of {items.length} loaded · up to{" "}
            {PAGE_SIZE} per page
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
      {selectedItem && (
        <DetailsDrawer
          item={selectedItem}
          instituteName={instituteNames[selectedItem.institutionId]}
          onClose={() => setSelectedItem(null)}
          onVerify={openVerify}
          onReject={openReject}
          position={selectedIndex >= 0 ? `${selectedIndex + 1} / ${visibleItems.length}` : ""}
          onPrev={selectedIndex > 0 ? () => navigateDrawer(-1) : null}
          onNext={
            selectedIndex >= 0 && selectedIndex < visibleItems.length - 1
              ? () => navigateDrawer(1)
              : null
          }
        />
      )}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.tone === "error" ? "bg-rose-600" : "bg-gray-900"}`}
        >
          {toast.tone === "error" ? (
            <CircleAlert className="h-4 w-4" />
          ) : (
            <CircleCheck className="h-4 w-4 text-emerald-400" />
          )}
          {toast.message}
        </div>
      )}
      {uploadOpen && (
        <UploadDialog
          form={uploadForm}
          institutes={institutes}
          years={years}
          uploading={uploading}
          error={uploadError}
          onClose={closeUpload}
          onChange={changeUploadForm}
          onSubmit={handleUpload}
        />
      )}
      {verifyingItem && (
        <VerifyDialog
          item={verifyingItem}
          form={verifyForm}
          verifying={verifying}
          error={verifyError}
          onClose={closeVerify}
          onChange={(key, value) =>
            setVerifyForm((current) => ({ ...current, [key]: value }))
          }
          onSubmit={handleVerify}
        />
      )}
      {rejectingItem && (
        <RejectDialog
          item={rejectingItem}
          description={rejectDescription}
          rejecting={rejecting}
          error={rejectError}
          onClose={closeReject}
          onChange={setRejectDescription}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
}

function UploadDialog({
  form,
  institutes,
  years,
  uploading,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  const departments = courseDepartments[form.course] || [];
  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];
  const selectClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-title"
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
          <div>
            <h3
              id="upload-title"
              className="text-lg font-semibold text-gray-800"
            >
              Upload PYQ or Notes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Required fields are marked with an asterisk.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close upload dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">
              Type *
              <select
                required
                value={form.type}
                onChange={(event) => onChange("type", event.target.value)}
                className={selectClass}
              >
                <option value="PYQ">PYQ</option>
                <option value="Notes">Notes</option>
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Institute *
              <select
                required
                value={form.institutionId}
                onChange={(event) =>
                  onChange("institutionId", event.target.value)
                }
                className={selectClass}
              >
                <option value="">Select institute</option>
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
            </label>
            <label className="text-sm font-medium text-gray-700">
              Course *
              <select
                required
                value={form.course}
                onChange={(event) => onChange("course", event.target.value)}
                className={selectClass}
              >
                <option value="">Select course</option>
                {Object.keys(courseDepartments).map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Department *
              <select
                required
                disabled={!form.course}
                value={form.department}
                onChange={(event) => onChange("department", event.target.value)}
                className={`${selectClass} disabled:cursor-not-allowed disabled:bg-gray-100`}
              >
                <option value="">
                  {form.course ? "Select department" : "Select course first"}
                </option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Semester *
              <select
                required
                value={form.semester}
                onChange={(event) => onChange("semester", event.target.value)}
                className={selectClass}
              >
                <option value="">Select semester</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Year *
              <select
                required
                value={form.year}
                onChange={(event) => onChange("year", event.target.value)}
                className={selectClass}
              >
                <option value="">Select year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {form.type === "Notes" && (
            <label className="block text-sm font-medium text-gray-700">
              Teacher name *
              <input
                required
                value={form.teacherName}
                onChange={(event) =>
                  onChange("teacherName", event.target.value)
                }
                className={selectClass}
                placeholder="Enter teacher name"
              />
            </label>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Document file *
            <input
              required
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              onChange={(event) =>
                onChange("file", event.target.files?.[0] || null)
              }
              className="mt-1.5 block w-full rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#0A80F5]"
            />
            <span className="mt-1 block text-xs text-gray-500">
              PDF, DOC, DOCX, or image files accepted by your server.
            </span>
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload & approve"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VerifyDialog({
  item,
  form,
  verifying,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  const fileName = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "this document",
  );
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verify-title"
    >
      <div className="w-full rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3
              id="verify-title"
              className="text-lg font-semibold text-gray-800"
            >
              Verify document
            </h3>
            <p className="mt-1 truncate text-sm text-gray-500">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={verifying}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close verification dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}
          <label className="block text-sm font-medium text-gray-700">
            Reward amount *
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              className={inputClass}
              placeholder="e.g. 25"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Description *
            <textarea
              required
              minLength="1"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Why is this document being verified?"
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={verifying}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifying}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? "Verifying..." : "Verify & credit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RejectDialog({
  item,
  description,
  rejecting,
  error,
  onClose,
  onChange,
  onSubmit,
}) {
  const fileName = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "this document",
  );

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 sm:items-center sm:justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-title"
    >
      <div className="w-full rounded-t-2xl bg-white shadow-xl sm:max-w-md sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div className="min-w-0">
            <h3
              id="reject-title"
              className="text-lg font-semibold text-gray-800"
            >
              Reject document
            </h3>

            <p className="mt-1 truncate text-sm text-gray-500">{fileName}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={rejecting}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close rejection dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">
            Reason for rejection *
            <textarea
              required
              minLength={1}
              value={description}
              onChange={(event) => onChange(event.target.value)}
              disabled={rejecting}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Enter the reason for rejecting this document..."
            />
          </label>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={rejecting}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={rejecting || !description.trim()}
              className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rejecting ? "Rejecting..." : "Reject document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, disabled, children }) {
  return (
    <label className="block text-xs font-medium text-gray-500">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
      >
        {children}
      </select>
    </label>
  );
}

function Avatar({ name }) {
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] text-[11px] font-semibold text-white">
      {initials || "?"}
    </span>
  );
}

function StatCard({ label, value, hint, icon, tone, loading, className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 ${className}`}
    >
      <span className={`rounded-xl p-2.5 ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-5 w-12 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="truncate text-lg font-semibold text-gray-800">{value}</p>
        )}
        {hint && !loading && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const style =
    role === "teacher"
      ? "bg-indigo-50 text-indigo-700"
      : role === "student"
        ? "bg-sky-50 text-sky-700"
        : "bg-gray-100 text-gray-600";
  return (
    <span
      className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${style}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-semibold text-[#0A80F5]">
      {type || "—"}
    </span>
  );
}

function DocumentActions({ item, onVerify, onReject, size = "sm" }) {
  const url = valueOf(item, ["fileUrl", "url", "documentUrl", "pdfUrl"], "");
  const compact = size === "sm";
  const base = compact
    ? "inline-flex h-8 w-8 items-center justify-center rounded-lg"
    : "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold";
  return (
    <>
      {statusOf(item) === "pending" && (
        <>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onVerify(item);
            }}
            title="Verify & credit"
            aria-label="Verify document"
            className={`${base} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            <Check className="h-4 w-4" />
            {!compact && "Verify"}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onReject(item);
            }}
            title="Reject"
            aria-label="Reject document"
            className={`${base} bg-rose-600 text-white hover:bg-rose-700`}
          >
            <X className="h-4 w-4" />
            {!compact && "Reject"}
          </button>
        </>
      )}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open file"
          aria-label="Open file"
          onClick={(event) => event.stopPropagation()}
          className={`${base} border border-gray-200 text-gray-700 hover:border-blue-200 hover:bg-blue-50 hover:text-[#0A80F5]`}
        >
          <ExternalLink className="h-4 w-4" />
          {!compact && "View"}
        </a>
      ) : (
        <span className="text-xs text-gray-400">No file</span>
      )}
    </>
  );
}

function DocumentRow({ item, instituteName, onOpen, onVerify, onReject }) {
  const title = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "Untitled document",
  );
  const ext = fileExtension(item);
  return (
    <tr
      onClick={() => onOpen(item)}
      className={`cursor-pointer text-sm transition-colors hover:bg-blue-50/40 ${statusOf(item) === "pending" ? "bg-amber-50/30 shadow-[inset_3px_0_0_#f59e0b]" : ""}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 p-2 text-[#0A80F5]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="max-w-[220px] truncate font-medium text-gray-800">
              {title}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 whitespace-nowrap text-xs text-gray-500">
              <TypeBadge type={item.type} />
              {ext && <span>{ext}</span>}
              <span>· {formatDate(item.createdAt)}</span>
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        <p className="max-w-[180px] truncate">
          {instituteName || item.institutionId || "—"}
        </p>
      </td>
      <td className="px-4 py-4 text-gray-600">
        <div>{valueOf(item, ["course"])}</div>
        <div className="mt-0.5 max-w-[200px] truncate text-xs text-gray-500">
          {valueOf(item, ["department", "departmentName"])} ·{" "}
          {valueOf(item, ["semester"])} · {valueOf(item, ["year", "academicYear"])}
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        <div className="flex items-center gap-2">
          <Avatar name={item.uploaderName} />
          <div className="min-w-0">
            <p className="max-w-[140px] truncate font-medium text-gray-700">
              {valueOf(item, ["uploaderName", "uploadedByName", "createdBy"])}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <RoleBadge role={item.uploaderRole} />
              {item.teacherName && (
                <span className="max-w-[110px] truncate text-xs text-gray-500">
                  {item.teacherName}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-600">
        <span className="inline-flex items-center gap-1">
          <Download className="h-3.5 w-3.5 text-gray-400" />
          {Number(item.downloads) || 0}
        </span>
        {item.rewardAmount !== undefined && (
          <div className="mt-0.5 text-xs font-medium text-emerald-600">
            {formatMoney(item.rewardAmount)} reward
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={valueOf(item, ["status"], "pending")} />
      </td>
      <td className="sticky right-0 bg-white px-4 py-4 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]">
        <div className="flex justify-end gap-2">
          <DocumentActions item={item} onVerify={onVerify} onReject={onReject} />
        </div>
      </td>
    </tr>
  );
}

function DocumentCard({ item, instituteName, onOpen, onVerify, onReject }) {
  const title = valueOf(
    item,
    ["fileName", "title", "noteTitle", "name"],
    "Untitled document",
  );
  return (
    <article
      onClick={() => onOpen(item)}
      className="cursor-pointer rounded-xl border border-gray-100 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <span className="h-fit rounded-lg bg-blue-50 p-2 text-[#0A80F5]">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-800">
              {title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
              <TypeBadge type={item.type} />
              {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={valueOf(item, ["status"], "pending")} />
      </div>
      <p className="mt-3 truncate text-xs text-gray-600">
        {instituteName || item.institutionId || "—"}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        {valueOf(item, ["course"])} · {valueOf(item, ["department"])} ·{" "}
        {valueOf(item, ["semester"])} · {valueOf(item, ["year"])}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          {valueOf(item, ["uploaderName"])} <RoleBadge role={item.uploaderRole} />
        </span>
        <span className="inline-flex items-center gap-1">
          <Download className="h-3 w-3" /> {Number(item.downloads) || 0}
        </span>
        {item.rewardAmount !== undefined && (
          <span>Reward {formatMoney(item.rewardAmount)}</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <DocumentActions
          item={item}
          onVerify={onVerify}
          onReject={onReject}
          size="md"
        />
      </div>
    </article>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-gray-800">
        {children}
      </dd>
    </div>
  );
}

// Fields already shown in the structured sections; everything else is listed under "All fields"
const knownFields = [
  "noteId",
  "status",
  "type",
  "fileName",
  "fileUrl",
  "fileKey",
  "institutionId",
  "course",
  "department",
  "semester",
  "year",
  "teacherName",
  "uploadedBy",
  "uploaderName",
  "uploaderRole",
  "downloads",
  "rewardAmount",
  "description",
  "createdAt",
  "approvedAt",
  "rejectedAt",
];

function DetailsDrawer({
  item,
  instituteName,
  onClose,
  onVerify,
  onReject,
  position,
  onPrev,
  onNext,
}) {
  const [copied, setCopied] = useState("");
  const state = statusOf(item);
  const url = valueOf(item, ["fileUrl", "url", "documentUrl", "pdfUrl"], "");
  const extraFields = Object.entries(item).filter(
    ([key, value]) =>
      !knownFields.includes(key) && value !== null && value !== undefined,
  );

  const copy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.target?.closest?.("[role=dialog] form")) return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && onPrev) onPrev();
      if (event.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-title"
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status || "pending"} />
            </div>
            <h3
              id="details-title"
              className="break-words text-lg font-semibold text-gray-800"
            >
              {valueOf(item, ["fileName", "title", "noteTitle"], "Untitled document")}
            </h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label="Previous document"
              title="Previous (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-xs tabular-nums text-gray-400">{position}</span>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label="Next document"
              title="Next (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close details"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {state === "rejected" && item.description && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Rejection reason</p>
              <p className="mt-1 whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          <section>
            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <GraduationCap className="h-4 w-4 text-[#0A80F5]" /> Academic details
            </h4>
            <dl>
              <DetailRow label="Institute">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-gray-400" />
                  {instituteName || item.institutionId || "—"}
                </span>
              </DetailRow>
              <DetailRow label="Course">{valueOf(item, ["course"])}</DetailRow>
              <DetailRow label="Department">
                {valueOf(item, ["department", "departmentName"])}
              </DetailRow>
              <DetailRow label="Semester">{valueOf(item, ["semester"])}</DetailRow>
              <DetailRow label="Year">
                {valueOf(item, ["year", "academicYear"])}
              </DetailRow>
              {item.type === "Notes" && (
                <DetailRow label="Teacher">{valueOf(item, ["teacherName"])}</DetailRow>
              )}
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">
              Submission &amp; review
            </h4>
            <dl>
              <DetailRow label="Uploaded by">
                <span className="inline-flex items-center gap-1.5">
                  {valueOf(item, ["uploaderName"])}
                  <RoleBadge role={item.uploaderRole} />
                </span>
              </DetailRow>
              <DetailRow label="Uploaded on">{formatDateTime(item.createdAt)}</DetailRow>
              {item.approvedAt && (
                <DetailRow label="Verified on">
                  {formatDateTime(item.approvedAt)}
                </DetailRow>
              )}
              {item.rejectedAt && (
                <DetailRow label="Rejected on">
                  {formatDateTime(item.rejectedAt)}
                </DetailRow>
              )}
              <DetailRow label="Reward credited">
                {formatMoney(item.rewardAmount)}
              </DetailRow>
              <DetailRow label="Downloads">{Number(item.downloads) || 0}</DetailRow>
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">Identifiers</h4>
            <dl>
              <DetailRow label="Note ID">
                <button
                  onClick={() => copy("noteId", item.noteId)}
                  className="inline-flex items-center gap-1.5 text-xs hover:text-[#0A80F5]"
                >
                  <span className="break-all">{valueOf(item, ["noteId", "id"])}</span>
                  {copied === "noteId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </DetailRow>
              <DetailRow label="Uploader ID">
                <span className="break-all text-xs">{valueOf(item, ["uploadedBy"])}</span>
              </DetailRow>
              <DetailRow label="Institute ID">
                <span className="break-all text-xs">
                  {valueOf(item, ["institutionId"])}
                </span>
              </DetailRow>
              <DetailRow label="Storage key">
                <span className="break-all text-xs">{valueOf(item, ["fileKey"])}</span>
              </DetailRow>
            </dl>
          </section>

          {extraFields.length > 0 && (
            <details className="rounded-xl bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                All other fields ({extraFields.length})
              </summary>
              <dl className="mt-2">
                {extraFields.map(([key, value]) => (
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

        <div className="flex flex-wrap gap-2 border-t border-gray-100 p-4">
          {url && (
            <button
              onClick={() => copy("link", url)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {copied === "link" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copy link
            </button>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <DocumentActions
              item={item}
              onVerify={onVerify}
              onReject={onReject}
              size="md"
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

export default PyqAndNotes;
