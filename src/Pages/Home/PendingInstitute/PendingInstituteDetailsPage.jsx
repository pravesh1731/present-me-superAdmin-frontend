import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Clock,
  FileText,
  Info,
  X,
} from "lucide-react";
import { BaseUrl } from "../../../Components/utils/constants";
import {
  setPendingCount,
  setVerifiedCount,
} from "../../../Components/utils/instituteSlice";
import {
  agoLabel,
  daysSince,
  fullName,
  setInstituteStatus,
} from "../../../Components/utils/format";
import useToast from "../../../Components/utils/useToast";
import { loadOverview } from "../../../Components/utils/overview";
import {
  ConfirmDialog,
  InstituteAvatar,
  Pill,
  Toast,
} from "../../../Components/common/ui";
import InstituteDetails from "../../../Components/institute/InstituteDetails";
import DocumentsPanel from "../../../Components/institute/DocumentsPanel";

const tabs = ["Details", "Documents"];

function PendingInstituteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Details");
  const [toast, notify] = useToast();

  const instituteState = useSelector((store) => store.institute.pending);
  const pendingCount = useSelector((store) => store.institute.counts.pending);
  const verifiedCount = useSelector((store) => store.institute.counts.verified);

  // Try to get institute from Redux first
  const instituteFromStore = useMemo(() => {
    if (Array.isArray(instituteState?.data)) {
      return instituteState.data.find(
        (inst) => String(inst.institutionId) === String(id)
      );
    }
    return null;
  }, [instituteState, id]);

  const [institute, setInstitute] = useState(instituteFromStore);
  const [loading, setLoading] = useState(!instituteFromStore);
  const [error, setError] = useState(null);

  const [confirm, setConfirm] = useState(null); // "verified" | "rejected"
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

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

        const res = await axios.get(BaseUrl + "/sadmin/pendingInstitutes", {
          withCredentials: true,
        });

        const list = res.data?.data || [];
        const found = list.find(
          (inst) => String(inst.institutionId) === String(id)
        );

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

  const checklist = useMemo(() => {
    if (!institute) return [];
    return [
      { label: "Aadhaar card uploaded", ok: Boolean(institute.aadharUrl), required: true },
      { label: "Designation ID uploaded", ok: Boolean(institute.designationIDUrl), required: true },
      { label: "Email provided", ok: Boolean(institute.emailId), required: true },
      { label: "Phone provided", ok: Boolean(institute.phone), required: true },
      { label: "Address provided", ok: Boolean(institute.address), required: true },
      { label: "Website provided", ok: Boolean(institute.website), required: false },
    ];
  }, [institute]);

  const requiredPassed = checklist.filter((item) => item.required && item.ok).length;
  const requiredTotal = checklist.filter((item) => item.required).length;
  const allRequiredPassed = requiredPassed === requiredTotal;

  const handleConfirm = async () => {
    try {
      setActing(true);
      setActionError("");
      await setInstituteStatus(id, confirm);

      const approved = confirm === "verified";
      dispatch(setPendingCount(Math.max(0, (pendingCount || 1) - 1)));
      if (approved) dispatch(setVerifiedCount((verifiedCount || 0) + 1));
      loadOverview(dispatch, { force: true });

      navigate(
        approved ? "/superadmin/verified-institutes" : "/superadmin/pending-institutes",
        {
          state: {
            notice: `${institute.InstitutionName} ${approved ? "approved" : "rejected"}`,
          },
        }
      );
    } catch (err) {
      console.error("Error updating institute:", err);
      setActionError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse space-y-6 p-4 md:p-6">
        <div className="h-5 w-28 rounded bg-gray-200" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-96 rounded-3xl bg-white shadow-xl lg:col-span-1" />
          <div className="h-96 rounded-3xl bg-white shadow-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <p className="text-gray-500">
            {error ||
              "Institute not found. It may already have been approved or rejected."}
          </p>
          <button
            onClick={() => navigate("/superadmin/pending-institutes")}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const waiting = daysSince(institute.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/superadmin/pending-institutes")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to List</span>
        </motion.button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Summary + decision */}
          <motion.aside
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="space-y-6 lg:sticky lg:top-20 lg:self-start"
          >
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="flex items-center gap-4">
                <InstituteAvatar
                  name={institute.InstitutionName}
                  src={institute.profilePicUrl}
                  size="lg"
                />
                <div className="min-w-0">
                  <h1 className="break-words text-xl font-bold text-gray-900 tracking-tight">
                    {institute.InstitutionName}
                  </h1>
                  <p className="mt-0.5 text-sm font-medium capitalize text-gray-500">
                    {institute.type || "institute"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill tone="amber">
                  <span className="capitalize">{institute.status || "pending"}</span>
                </Pill>
                <Pill tone={waiting > 7 ? "red" : "gray"}>
                  <Clock className="h-3 w-3" /> Registered {agoLabel(institute.createdAt)}
                </Pill>
              </div>

              <div className="mt-5 border-t pt-5 text-sm">
                <p className="text-xs text-gray-500">Contact person</p>
                <p className="mt-0.5 font-medium text-gray-800">
                  {fullName(institute)}
                  {(institute.Role || institute.role) && (
                    <span className="font-normal text-gray-500">
                      {" "}
                      · {institute.Role || institute.role}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Review checklist */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Review checklist</h2>
                <span
                  className={`text-xs font-semibold ${
                    allRequiredPassed ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {requiredPassed}/{requiredTotal} required
                </span>
              </div>

              <ul className="space-y-2.5">
                {checklist.map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        item.ok
                          ? "bg-emerald-100 text-emerald-600"
                          : item.required
                            ? "bg-rose-100 text-rose-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {item.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                    <span className={item.ok ? "text-gray-700" : "text-gray-500"}>
                      {item.label}
                      {!item.required && <span className="text-xs text-gray-400"> (optional)</span>}
                    </span>
                  </li>
                ))}
              </ul>

              {!allRequiredPassed && (
                <p className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Some required items are missing. You can still decide, but check the
                  Documents tab first.
                </p>
              )}
            </div>

            {/* Decision */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActionError("");
                  setConfirm("verified");
                }}
                className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-400 px-6 py-3.5 font-bold text-white shadow-md transition-all hover:from-emerald-600 hover:to-emerald-500"
              >
                Approve
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setActionError("");
                  setConfirm("rejected");
                }}
                className="flex-1 rounded-xl bg-linear-to-r from-red-400 to-red-500 px-6 py-3.5 font-bold text-white shadow-md transition-all hover:from-red-500 hover:to-red-600"
              >
                Reject
              </motion.button>
            </div>
          </motion.aside>

          {/* Tabs */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="mb-4 flex border-b bg-white rounded-t-2xl shadow-sm">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    activeTab === tab
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                      : "text-gray-500 bg-transparent hover:text-indigo-700"
                  }`}
                >
                  {tab === "Documents" && <FileText className="h-4 w-4" />}
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "Details" ? (
                  <InstituteDetails institute={institute} onCopy={notify} />
                ) : (
                  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <h3 className="mb-4 text-base font-semibold text-gray-800">
                      Uploaded documents
                    </h3>
                    <DocumentsPanel institute={institute} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm === "verified" ? "Approve this institute?" : "Reject this institute?"}
          message={
            confirm === "verified"
              ? `${institute.InstitutionName} will be marked as verified.`
              : `${institute.InstitutionName} will be marked as rejected and removed from the pending list.`
          }
          confirmLabel={confirm === "verified" ? "Approve" : "Reject"}
          tone={confirm === "verified" ? "success" : "danger"}
          loading={acting}
          error={actionError}
          onConfirm={handleConfirm}
          onCancel={() => !acting && setConfirm(null)}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

export default PendingInstituteDetailsPage;
