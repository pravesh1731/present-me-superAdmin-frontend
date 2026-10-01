import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  CircleAlert,
  Clock,
  FileDown,
  FileWarning,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import {
  setPendingCount,
  setPendingInstitutes,
  setVerifiedCount,
} from "../../../Components/utils/instituteSlice";
import { BaseUrl } from "../../../Components/utils/constants";
import {
  agoLabel,
  daysSince,
  downloadCsv,
  formatDate,
  fullName,
  setInstituteStatus,
  websiteHref,
} from "../../../Components/utils/format";
import useToast from "../../../Components/utils/useToast";
import { loadOverview } from "../../../Components/utils/overview";
import {
  ConfirmDialog,
  InstituteAvatar,
  Pill,
  StatCard,
  Toast,
} from "../../../Components/common/ui";

const quickFilters = [
  { value: "all", label: "All" },
  { value: "new", label: "New this week" },
  { value: "old", label: "Waiting 7+ days" },
  { value: "missing", label: "Missing documents" },
];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first (longest waiting)" },
  { value: "name", label: "Name A–Z" },
  { value: "students", label: "Most expected students" },
];

const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  name: (a, b) =>
    String(a.InstitutionName || "").localeCompare(String(b.InstitutionName || "")),
  students: (a, b) => (Number(b.expectedStudents) || 0) - (Number(a.expectedStudents) || 0),
};

const missingDocuments = (item) => !item.aadharUrl || !item.designationIDUrl;

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 16 },
  },
  hover: {
    scale: 1.015,
    boxShadow: "0 8px 32px 0 rgba(60, 72, 180, 0.12)",
  },
};

function ShimmerCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden animate-pulse">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-200" />
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-amber-100 rounded" />
              <div className="h-4 w-16 bg-indigo-100 rounded" />
            </div>
          </div>
        </div>
        <div className="h-10 w-32 bg-indigo-100 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="space-y-5">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
        <div className="space-y-5">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function InfoLine({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-indigo-400">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-0.5 break-words text-sm font-medium text-gray-800">
          {children || "—"}
        </div>
      </div>
    </div>
  );
}

function PendingInstitute() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const pending = useSelector((state) => state.institute.pending);
  const verifiedCount = useSelector((state) => state.institute.counts.verified);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [quick, setQuick] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [action, setAction] = useState(null); // { institute, status }
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, notify] = useToast();

  const list = useMemo(
    () => (Array.isArray(pending?.data) ? pending.data : []),
    [pending]
  );

  const getInstituteDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(BaseUrl + "/sadmin/pendingInstitutes", {
        withCredentials: true,
      });
      dispatch(setPendingInstitutes(response.data));
      dispatch(setPendingCount(response.data?.data?.length || 0));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to load pending institutes. Please try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    getInstituteDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Message handed over by the details page after approve / reject
  useEffect(() => {
    if (location.state?.notice) {
      notify(location.state.notice);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, notify]);

  const stats = useMemo(
    () => ({
      total: list.length,
      fresh: list.filter((item) => (daysSince(item.createdAt) ?? 99) <= 7).length,
      old: list.filter((item) => (daysSince(item.createdAt) ?? 0) > 7).length,
      missing: list.filter(missingDocuments).length,
      students: list.reduce((sum, item) => sum + (Number(item.expectedStudents) || 0), 0),
    }),
    [list]
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return list
      .filter((item) => {
        if (quick === "new" && (daysSince(item.createdAt) ?? 99) > 7) return false;
        if (quick === "old" && (daysSince(item.createdAt) ?? 0) <= 7) return false;
        if (quick === "missing" && !missingDocuments(item)) return false;
        if (!term) return true;

        return [
          item.InstitutionName,
          fullName(item),
          item.emailId,
          item.phone,
          item.address,
          item.type,
        ]
          .map((value) => value ?? "")
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort(sorters[sortBy]);
  }, [list, search, quick, sortBy]);

  const confirmAction = async () => {
    if (!action) return;
    setActing(true);
    setActionError("");
    try {
      await setInstituteStatus(action.institute.institutionId, action.status);
      const approved = action.status === "verified";
      const name = action.institute.InstitutionName;

      if (approved) dispatch(setVerifiedCount((verifiedCount || 0) + 1));
      setAction(null);
      notify(approved ? `${name} approved` : `${name} rejected`);
      loadOverview(dispatch, { force: true });
      await getInstituteDetails();
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setActing(false);
    }
  };

  const exportList = () => {
    downloadCsv(
      "pending-institutes",
      [
        ["Institution ID", (i) => i.institutionId],
        ["Name", (i) => i.InstitutionName],
        ["Type", (i) => i.type],
        ["Contact person", (i) => fullName(i)],
        ["Designation", (i) => i.Role],
        ["Email", (i) => i.emailId],
        ["Phone", (i) => i.phone],
        ["Address", (i) => i.address],
        ["Website", (i) => i.website],
        ["Expected students", (i) => i.expectedStudents],
        ["Expected teachers", (i) => i.expectedTeachers],
        ["Aadhaar uploaded", (i) => (i.aadharUrl ? "Yes" : "No")],
        ["Designation ID uploaded", (i) => (i.designationIDUrl ? "Yes" : "No")],
        ["Registered at", (i) => i.createdAt],
      ],
      visible
    );
    notify(`Exported ${visible.length} institutes to CSV`);
  };

  const filtersActive = search || quick !== "all";

  return (
    <div className="min-h-screen py-8 px-2 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="ml-0 md:ml-6">
          <h2 className="text-3xl font-bold text-indigo-800 tracking-tight drop-shadow-sm">
            Pending Institutes
          </h2>
          <p className="text-base text-gray-500 mt-1">
            Review and verify institute registration requests
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportList}
            disabled={loading || !visible.length}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={getInstituteDetails}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh list"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Awaiting review"
            value={stats.total}
            icon={<Clock className="h-5 w-5" />}
            tone="bg-amber-50 text-amber-600"
            loading={loading}
          />
          <StatCard
            label="New this week"
            value={stats.fresh}
            hint={`${stats.old} waiting longer`}
            icon={<RefreshCw className="h-5 w-5" />}
            tone="bg-blue-50 text-[#0A80F5]"
            loading={loading}
          />
          <StatCard
            label="Missing documents"
            value={stats.missing}
            hint="Aadhaar or designation ID"
            icon={<FileWarning className="h-5 w-5" />}
            tone="bg-rose-50 text-rose-600"
            loading={loading}
          />
          <StatCard
            label="Expected students"
            value={stats.students.toLocaleString("en-IN")}
            hint="Across pending institutes"
            icon={<Users className="h-5 w-5" />}
            tone="bg-indigo-50 text-indigo-600"
            loading={loading}
          />
        </div>

        {/* Toolbar */}
        <div className="mb-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Quick filters">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setQuick(filter.value)}
                  role="tab"
                  aria-selected={quick === filter.value}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    quick === filter.value
                      ? "bg-[#0A80F5] text-white shadow-sm"
                      : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative block w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, contact, email…"
                  aria-label="Search pending institutes"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>

              <label className="relative block">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  aria-label="Sort institutes"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#0A80F5]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {!loading && (
            <p className="text-xs text-gray-400">
              Showing {visible.length} of {list.length} pending institutes
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={getInstituteDetails} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* List */}
        <div className="space-y-8">
          <AnimatePresence>
            {loading ? (
              <>
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </>
            ) : visible.length > 0 ? (
              visible.map((item, idx) => {
                const waiting = daysSince(item.createdAt);

                return (
                  <motion.div
                    key={item.institutionId}
                    className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 relative overflow-hidden group transition-all"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    exit="hidden"
                    transition={{ delay: Math.min(idx, 8) * 0.05 }}
                    style={{ boxShadow: "0 4px 24px 0 rgba(60, 72, 180, 0.08)" }}
                  >
                    {/* floating accent */}
                    <motion.div
                      className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-100 opacity-40 blur-2xl z-0"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                    />

                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6 relative z-10">
                      <div className="flex items-start gap-5">
                        <InstituteAvatar name={item.InstitutionName} src={item.profilePicUrl} />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.InstitutionName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Pill tone="amber">
                              <span className="capitalize">{item.status || "pending"}</span>
                            </Pill>
                            {item.type && (
                              <Pill tone="indigo">
                                <span className="capitalize">{item.type}</span>
                              </Pill>
                            )}
                            <Pill tone={waiting > 7 ? "red" : "gray"}>
                              <Clock className="h-3 w-3" /> {agoLabel(item.createdAt)}
                            </Pill>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          navigate(`/superadmin/pending-institutes/${item.institutionId}`)
                        }
                        className="inline-flex items-center gap-2 px-5 py-2.5 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700 bg-white shadow transition-all hover:bg-indigo-50 hover:text-indigo-900 hover:shadow-lg active:scale-95"
                      >
                        View details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
                      <div className="space-y-5">
                        <InfoLine icon={<MapPin className="h-5 w-5" />} label="Address">
                          {item.address}
                        </InfoLine>
                        <InfoLine icon={<Mail className="h-5 w-5" />} label="Email">
                          {item.emailId}
                        </InfoLine>
                        <InfoLine icon={<Phone className="h-5 w-5" />} label="Phone">
                          {item.phone}
                        </InfoLine>
                        {item.website && (
                          <InfoLine icon={<Globe className="h-5 w-5" />} label="Website">
                            <a
                              href={websiteHref(item.website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              {String(item.website).replace(/^https?:\/\//i, "")}
                            </a>
                          </InfoLine>
                        )}
                      </div>

                      <div className="space-y-5">
                        <InfoLine icon={<User className="h-5 w-5" />} label="Contact person">
                          {fullName(item)}
                          {(item.Role || item.role) && (
                            <span className="ml-1 font-normal text-gray-500">
                              ({item.Role || item.role})
                            </span>
                          )}
                        </InfoLine>
                        <InfoLine icon={<Clock className="h-5 w-5" />} label="Registered">
                          {formatDate(item.createdAt, true)}
                        </InfoLine>
                        <InfoLine icon={<Users className="h-5 w-5" />} label="Expected students">
                          {item.expectedStudents} students
                        </InfoLine>
                        <InfoLine icon={<GraduationCap className="h-5 w-5" />} label="Expected teachers">
                          {item.expectedTeachers} teachers
                        </InfoLine>
                      </div>
                    </div>

                    {item.bio && (
                      <div className="border-t pt-4 relative z-10">
                        <div className="text-xs text-gray-500 mb-1">Description</div>
                        <p className="line-clamp-2 text-sm text-gray-700 font-medium">
                          {item.bio}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
                      <div className="flex flex-wrap gap-2">
                        <Pill tone={item.aadharUrl ? "green" : "red"}>
                          {item.aadharUrl ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Aadhaar
                        </Pill>
                        <Pill tone={item.designationIDUrl ? "green" : "red"}>
                          {item.designationIDUrl ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          Designation ID
                        </Pill>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setActionError("");
                            setAction({ institute: item, status: "rejected" });
                          }}
                          className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setActionError("");
                            setAction({ institute: item, status: "verified" });
                          }}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              !error && (
                <motion.div
                  className="rounded-3xl bg-white p-16 text-center text-gray-500 shadow-xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-lg">
                    {filtersActive
                      ? "No pending institutes match your filters."
                      : "No pending institutes — you're all caught up."}
                  </p>
                  {filtersActive && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setQuick("all");
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <RotateCcw className="h-4 w-4" /> Reset filters
                    </button>
                  )}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>

      {action && (
        <ConfirmDialog
          title={
            action.status === "verified"
              ? "Approve this institute?"
              : "Reject this institute?"
          }
          message={
            action.status === "verified"
              ? `${action.institute.InstitutionName} will be marked as verified and move to Verified Institutes.`
              : `${action.institute.InstitutionName} will be marked as rejected and removed from this list.`
          }
          confirmLabel={action.status === "verified" ? "Approve" : "Reject"}
          tone={action.status === "verified" ? "success" : "danger"}
          loading={acting}
          error={actionError}
          onConfirm={confirmAction}
          onCancel={() => !acting && setAction(null)}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default PendingInstitute;
