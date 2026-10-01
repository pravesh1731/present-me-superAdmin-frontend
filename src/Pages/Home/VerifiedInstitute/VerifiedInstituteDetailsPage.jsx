import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";
import { BaseUrl } from "../../../Components/utils/constants";
import { formatDate, fullName } from "../../../Components/utils/format";
import useToast from "../../../Components/utils/useToast";
import { InstituteAvatar, Pill, Toast } from "../../../Components/common/ui";
import InstituteDetails from "../../../Components/institute/InstituteDetails";
import DocumentsPanel from "../../../Components/institute/DocumentsPanel";
import {
  StudentsPanel,
  TeachersPanel,
} from "../../../Components/institute/PeoplePanels";

const tabNames = ["Details", "Teachers", "Students", "Documents"];

function TabButton({ active, onClick, count, children }) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap px-4 md:px-6 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-200 ${
        active
          ? "text-indigo-600 border-indigo-600 bg-white shadow"
          : "text-gray-500 border-transparent hover:text-indigo-700 hover:bg-gray-50"
      }`}
      whileTap={{ scale: 0.97 }}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            active ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

function QuickStat({ icon, label, value, tone }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={tone}>{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-lg font-semibold text-gray-800">{value}</span>
    </div>
  );
}

const missingEndpointMessage = (what, id, err) =>
  err.response?.status === 404
    ? `The server doesn't provide a ${what} list for super admins yet (GET /sadmin/institutes/${id}/${what}).`
    : err.response?.data?.message || `Unable to load ${what}. Please try again.`;

function VerifiedInstituteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, notify] = useToast();

  const requestedTab = searchParams.get("tab");
  const activeTab = tabNames.includes(requestedTab) ? requestedTab : "Details";
  const setActiveTab = (tab) => setSearchParams(tab === "Details" ? {} : { tab }, { replace: true });

  const verified = useSelector((store) => store.institute.verified);

  // Try to get institute from Redux first
  const instituteFromStore = useMemo(() => {
    if (Array.isArray(verified?.data)) {
      return verified.data.find((inst) => String(inst.institutionId) === String(id));
    }
    return null;
  }, [verified, id]);

  const [institute, setInstitute] = useState(instituteFromStore);
  const [loading, setLoading] = useState(!instituteFromStore);
  const [error, setError] = useState(null);

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [peopleLoading, setPeopleLoading] = useState(true);
  const [teachersError, setTeachersError] = useState("");
  const [studentsError, setStudentsError] = useState("");

  // If not in Redux (e.g. on refresh), fetch from backend
  useEffect(() => {
    window.scrollTo(0, 0);
    // if already have from store, no need to fetch
    if (instituteFromStore) {
      setInstitute(instituteFromStore);
      setLoading(false);
      return;
    }

    const fetchInstitute = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(BaseUrl + "/sadmin/verifiedInstitutes", {
          withCredentials: true,
        });

        const list = res.data?.data || [];
        const found = list.find((inst) => String(inst.institutionId) === String(id));

        setInstitute(found || null);
      } catch (err) {
        console.error("Error fetching institute:", err);
        setError("Failed to load institute details");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitute();
  }, [id, instituteFromStore]);

  // Teachers and students load independently so one failing doesn't hide the other
  const loadPeople = useCallback(async () => {
    setPeopleLoading(true);
    setTeachersError("");
    setStudentsError("");

    const get = (what) =>
      axios.get(`${BaseUrl}/sadmin/institutes/${id}/${what}`, { withCredentials: true });
    const [teacherResult, studentResult] = await Promise.allSettled([
      get("teachers"),
      get("students"),
    ]);

    if (teacherResult.status === "fulfilled") {
      setTeachers(Array.isArray(teacherResult.value.data?.data) ? teacherResult.value.data.data : []);
    } else {
      console.error("Error loading teachers:", teacherResult.reason);
      setTeachers([]);
      setTeachersError(missingEndpointMessage("teachers", id, teacherResult.reason));
    }

    if (studentResult.status === "fulfilled") {
      setStudents(Array.isArray(studentResult.value.data?.data) ? studentResult.value.data.data : []);
    } else {
      console.error("Error loading students:", studentResult.reason);
      setStudents([]);
      setStudentsError(missingEndpointMessage("students", id, studentResult.reason));
    }

    setPeopleLoading(false);
  }, [id]);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const verifiedTeachers = useMemo(
    () =>
      teachers.filter((teacher) => ["verified", "approved"].includes(String(teacher.status).toLowerCase()))
        .length,
    [teachers]
  );
  const pendingTeachers = useMemo(
    () =>
      teachers.filter((teacher) => String(teacher.status || "pending").toLowerCase() === "pending").length,
    [teachers]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-6 p-4 md:p-6">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-3xl bg-white shadow-xl" />
          <div className="h-96 rounded-3xl bg-white shadow-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <motion.div className="p-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white rounded-xl p-8 text-center shadow-xl">
          <p className="text-gray-500 text-lg">{error || "Institute not found"}</p>
          <button
            onClick={() => navigate("/superadmin/verified-institutes")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Back to list
          </button>
        </div>
      </motion.div>
    );
  }

  const teacherCount = peopleLoading || teachersError ? undefined : teachers.length;
  const studentCount = peopleLoading || studentsError ? undefined : students.length;
  const shown = (value, failed) => (peopleLoading ? "…" : failed ? "—" : value);

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Top bar */}
        <motion.div
          className="flex flex-wrap items-center justify-between gap-3 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/superadmin/verified-institutes")}
              className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 shadow transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>
            <h1 className="text-xl md:text-2xl font-bold text-indigo-800 drop-shadow-sm">
              {institute.InstitutionName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadPeople}
              disabled={peopleLoading}
              className="rounded-lg border bg-white p-2 text-gray-600 shadow transition hover:bg-gray-50 disabled:opacity-50"
              aria-label="Refresh teachers and students"
              title="Refresh teachers and students"
            >
              <RefreshCw className={`h-4 w-4 ${peopleLoading ? "animate-spin" : ""}`} />
            </button>
            <Pill tone="green">
              <BadgeCheck className="h-3.5 w-3.5" /> Verified
            </Pill>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white rounded-xl shadow-xl p-3 md:p-4 mb-4 md:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-2 overflow-x-auto border-b">
            {tabNames.map((tab) => (
              <TabButton
                key={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                count={tab === "Teachers" ? teacherCount : tab === "Students" ? studentCount : undefined}
              >
                {tab}
              </TabButton>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left summary card */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 space-y-6 relative overflow-hidden lg:sticky lg:top-20 lg:self-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-indigo-100 opacity-30 blur-2xl z-0"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 16, ease: "linear" }}
            />

            <div className="flex items-start gap-4 relative z-10">
              <InstituteAvatar name={institute.InstitutionName} src={institute.profilePicUrl} />
              <div className="min-w-0">
                <div className="break-words text-lg font-semibold text-gray-800">
                  {institute.InstitutionName}
                </div>
                <div className="text-xs mt-1 capitalize text-gray-500">
                  {institute.type || "institute"}
                </div>
              </div>
            </div>

            <div className="relative z-10 text-sm">
              <div className="text-xs text-gray-500">Contact person</div>
              <div className="mt-0.5 font-medium text-gray-800">{fullName(institute)}</div>
              <div className="mt-3 text-xs text-gray-500">Registered on</div>
              <div className="mt-0.5 font-medium text-gray-800">
                {formatDate(institute.createdAt, true)}
              </div>
            </div>

            <div className="pt-5 border-t relative z-10">
              <h4 className="text-sm font-semibold text-gray-800 mb-4">Quick stats</h4>
              <div className="space-y-3">
                <QuickStat
                  icon={<GraduationCap className="h-4 w-4" />}
                  tone="text-purple-500"
                  label="Verified teachers"
                  value={shown(`${verifiedTeachers} / ${institute.expectedTeachers ?? "—"}`, teachersError)}
                />
                <QuickStat
                  icon={<GraduationCap className="h-4 w-4" />}
                  tone="text-amber-500"
                  label="Teachers pending"
                  value={shown(pendingTeachers, teachersError)}
                />
                <QuickStat
                  icon={<Users className="h-4 w-4" />}
                  tone="text-blue-500"
                  label="Students joined"
                  value={shown(`${students.length} / ${institute.expectedStudents ?? "—"}`, studentsError)}
                />
              </div>
            </div>
          </motion.div>

          {/* Right main content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {activeTab === "Details" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <InstituteDetails institute={institute} onCopy={notify} />
              </motion.div>
            )}

            {activeTab === "Teachers" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <TeachersPanel
                  teachers={teachers}
                  expected={institute.expectedTeachers}
                  loading={peopleLoading}
                  error={teachersError}
                  onRetry={loadPeople}
                  onCopy={notify}
                  institutionName={institute.InstitutionName}
                />
              </motion.div>
            )}

            {activeTab === "Students" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <StudentsPanel
                  students={students}
                  expected={institute.expectedStudents}
                  loading={peopleLoading}
                  error={studentsError}
                  onRetry={loadPeople}
                  onCopy={notify}
                  institutionName={institute.InstitutionName}
                />
              </motion.div>
            )}

            {activeTab === "Documents" && (
              <motion.div
                className="rounded-3xl bg-white p-6 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="mb-4 text-lg font-semibold text-indigo-800">Registration documents</h3>
                <DocumentsPanel institute={institute} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}

export default VerifiedInstituteDetailsPage;
