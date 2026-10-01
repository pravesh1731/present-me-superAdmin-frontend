import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  setVerifiedCount,
  setVerifiedInstitutes,
} from "../../../Components/utils/instituteSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpDown,
  BadgeCheck,
  CircleAlert,
  Eye,
  FileDown,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { BaseUrl } from "../../../Components/utils/constants";
import {
  daysSince,
  downloadCsv,
  formatDate,
  fullName,
  websiteHref,
} from "../../../Components/utils/format";
import useToast from "../../../Components/utils/useToast";
import { InstituteAvatar, Pill, StatCard, Toast } from "../../../Components/common/ui";

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "students", label: "Most expected students" },
  { value: "teachers", label: "Most expected teachers" },
];

const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  name: (a, b) =>
    String(a.InstitutionName || "").localeCompare(String(b.InstitutionName || "")),
  students: (a, b) => (Number(b.expectedStudents) || 0) - (Number(a.expectedStudents) || 0),
  teachers: (a, b) => (Number(b.expectedTeachers) || 0) - (Number(a.expectedTeachers) || 0),
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 16 },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 32px 0 rgba(60, 72, 180, 0.14)",
  },
};

function ShimmerCard() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden animate-pulse">
      <div className="flex items-start gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-indigo-200" />
        <div className="flex-1">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-16 bg-emerald-100 rounded" />
        </div>
      </div>
      <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
      <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-10 w-24 bg-indigo-100 rounded-xl" />
        <div className="h-10 w-24 bg-indigo-200 rounded-xl" />
      </div>
    </div>
  );
}

function VerifiedInstitute() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const verified = useSelector((state) => state.institute.verified);
  const [toast, notify] = useToast();

  const list = useMemo(
    () => (Array.isArray(verified?.data) ? verified.data : []),
    [verified]
  );

  const getInstituteDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(BaseUrl + "/sadmin/verifiedInstitutes", {
        withCredentials: true,
      });
      dispatch(setVerifiedInstitutes(response.data));
      dispatch(setVerifiedCount(response.data?.data?.length || 0));
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Unable to load verified institutes. Please try again."
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    getInstituteDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Message handed over by the pending pages after an approval
  useEffect(() => {
    if (location.state?.notice) {
      notify(location.state.notice);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate, notify]);

  const handleViewDetails = (institute) => {
    navigate(`/superadmin/verified-institutes/${institute.institutionId}`);
  };

  const filteredInstitutes = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    return list
      .filter(
        (item) =>
          !term ||
          [
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
            .includes(term)
      )
      .sort(sorters[sortBy]);
  }, [list, searchQuery, sortBy]);

  const stats = useMemo(
    () => ({
      total: list.length,
      students: list.reduce((sum, item) => sum + (Number(item.expectedStudents) || 0), 0),
      teachers: list.reduce((sum, item) => sum + (Number(item.expectedTeachers) || 0), 0),
      recent: list.filter((item) => (daysSince(item.createdAt) ?? 99) <= 30).length,
    }),
    [list]
  );

  const exportList = () => {
    downloadCsv(
      "verified-institutes",
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
        ["Registered at", (i) => i.createdAt],
      ],
      filteredInstitutes
    );
    notify(`Exported ${filteredInstitutes.length} institutes to CSV`);
  };

  return (
    <div className="min-h-screen py-8 px-2 md:px-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-indigo-800 tracking-tight drop-shadow-sm">
            Verified Institutes
          </h2>
          <p className="text-base text-gray-500 mt-1">
            All verified and active institutes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportList}
            disabled={loading || !filteredInstitutes.length}
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

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Verified institutes"
          value={stats.total}
          icon={<BadgeCheck className="h-5 w-5" />}
          tone="bg-emerald-50 text-emerald-600"
          loading={loading}
        />
        <StatCard
          label="Joined last 30 days"
          value={stats.recent}
          icon={<RefreshCw className="h-5 w-5" />}
          tone="bg-blue-50 text-[#0A80F5]"
          loading={loading}
        />
        <StatCard
          label="Expected students"
          value={stats.students.toLocaleString("en-IN")}
          icon={<Users className="h-5 w-5" />}
          tone="bg-indigo-50 text-indigo-600"
          loading={loading}
        />
        <StatCard
          label="Expected teachers"
          value={stats.teachers.toLocaleString("en-IN")}
          icon={<GraduationCap className="h-5 w-5" />}
          tone="bg-purple-50 text-purple-600"
          loading={loading}
        />
      </div>

      {/* Search + sort */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-md">
          <input
            type="text"
            placeholder="Search name, contact, email, address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search verified institutes"
            className="w-full px-4 py-3 pl-12 pr-10 border border-gray-200 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="relative block">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort institutes"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-3 text-sm text-gray-700 shadow outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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

      {/* Institutes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {loading ? (
            <>
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
            </>
          ) : (
            filteredInstitutes.map((institute, idx) => (
              <motion.div
                key={institute.institutionId}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden group transition-all flex flex-col"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                exit="hidden"
                transition={{ delay: Math.min(idx, 8) * 0.05 }}
                style={{ boxShadow: "0 4px 24px 0 rgba(60, 72, 180, 0.10)" }}
              >
                {/* floating accent */}
                <motion.div
                  className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-100 opacity-30 blur-2xl z-0"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
                />

                {/* Institute Header */}
                <div className="flex items-start gap-4 mb-5 relative z-10">
                  <InstituteAvatar name={institute.InstitutionName} src={institute.profilePicUrl} />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-semibold text-gray-900">
                      {institute.InstitutionName}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Pill tone="green">
                        <BadgeCheck className="h-3 w-3" />
                        <span className="capitalize">{institute.status || "verified"}</span>
                      </Pill>
                      {institute.type && (
                        <Pill tone="indigo">
                          <span className="capitalize">{institute.type}</span>
                        </Pill>
                      )}
                    </div>
                  </div>
                </div>

                {/* Institute Details */}
                <div className="space-y-2 mb-5 relative z-10 text-sm text-gray-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{institute.address || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{institute.emailId || "—"}</span>
                  </div>
                  {institute.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 shrink-0" />
                      <a
                        href={websiteHref(institute.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-indigo-600 hover:underline"
                      >
                        {String(institute.website).replace(/^https?:\/\//i, "")}
                      </a>
                    </div>
                  )}
                  <p className="pt-1 text-xs text-gray-400">
                    {fullName(institute)} · Registered {formatDate(institute.createdAt)}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6 mb-5 pb-5 border-b border-gray-100 relative z-10">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500">Students</div>
                      <div className="text-base font-semibold text-gray-800">
                        {institute.expectedStudents ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500">Teachers</div>
                      <div className="text-base font-semibold text-gray-800">
                        {institute.expectedTeachers ?? "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-3 relative z-10">
                  <motion.button
                    onClick={() => handleViewDetails(institute)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white shadow transition-all hover:bg-indigo-50 hover:text-indigo-900 hover:shadow-lg active:scale-95"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </motion.button>
                  <motion.button
                    onClick={() =>
                      navigate(
                        `/superadmin/verified-institutes/${institute.institutionId}?tab=Teachers`
                      )
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow transition-all active:scale-95"
                    whileTap={{ scale: 0.97 }}
                  >
                    <Users className="w-4 h-4" />
                    Teachers
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {!loading && !error && filteredInstitutes.length === 0 && (
        <motion.div
          className="bg-white rounded-3xl p-16 text-center shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-500 text-lg">
            {searchQuery
              ? "No institutes found matching your search."
              : "No verified institutes yet."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" /> Clear search
            </button>
          )}
        </motion.div>
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default VerifiedInstitute;
