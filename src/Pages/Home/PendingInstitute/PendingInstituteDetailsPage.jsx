import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { BaseUrl } from "../../../Components/utils/constants";

function PendingInstituteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Details");

  const instituteState = useSelector((store) => store.institute.pending) || {};

  // Try to get institute from Redux first
  const instituteFromStore = useMemo(() => {
    if (Array.isArray(instituteState.data)) {
      return instituteState.data.find(
        (inst) => String(inst.institutionId) === String(id)
      );
    }
    return null;
  }, [instituteState, id]);

  const [institute, setInstitute] = useState(instituteFromStore);
  const [loading, setLoading] = useState(!instituteFromStore);
  const [error, setError] = useState(null);

  const [approveLoading, setApproveLoading] = useState(false);
  const [approveError, setApproveError] = useState(null);

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

        // You already have this API returning all pending institutes
        const res = await axios.get(
          BaseUrl + "/sadmin/pendingInstitutes",
          { withCredentials: true }
        );

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

  const handleApprove = async () => {
    try {
      setApproveLoading(true);
      setApproveError(null);

      await axios.patch(
        `${BaseUrl}/sadmin/institutes/${id}/status`,
        { status: "verified" },
        { withCredentials: true }
      );

      // Option A: navigate back to pending list
      // navigate("/superadmin/pending-institutes");

      // Option B (alternative): show success & maybe redirect to verified page
      navigate("/superadmin/verified-institutes");
    } catch (err) {
      console.error("Error approving institute:", err);
      setApproveError("Failed to approve institute. Please try again.");
    } finally {
      setApproveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <p className="text-gray-600">Loading institute details...</p>
        </div>
      </div>
    );
  }

  if (!institute) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg p-6 text-center shadow-md">
          <p className="text-gray-500">{error || "Institute not found"}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/superadmin/pending-institutes")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to List</span>
        </motion.button>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center gap-6">
            <motion.div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-200 to-indigo-50 shadow-lg"
              whileHover={{ rotate: 8, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {institute.profilePicUrl ? (
                <img
                  src={institute.profilePicUrl}
                  alt={institute.InstitutionName?.charAt(0).toUpperCase()}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-indigo-600 font-bold text-3xl">
                  {institute.InstitutionName?.charAt(0).toUpperCase()}
                </span>
              )}
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {institute.InstitutionName}
              </h1>
              <p className="text-base text-gray-500 mt-1 font-medium">
                {institute.type}
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="text-base font-semibold text-indigo-700 mt-1">
                {institute.status?.toUpperCase()}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Role</div>
              <div className="text-base font-semibold text-gray-800 mt-1">
                {institute.Role}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="border-b flex">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("Details")}
              className={`px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                activeTab === "Details"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 bg-transparent"
              }`}
            >
              Details
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab("Documents")}
              className={`px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                activeTab === "Documents"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                  : "text-gray-500 bg-transparent"
              }`}
            >
              Documents
            </motion.button>
          </div>
          <AnimatePresence mode="wait">
            {activeTab === "Details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35 }}
                className="p-8 space-y-8"
              >
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">
                    Institute Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-gray-400 mt-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Address
                            </div>
                            <div className="text-sm text-gray-800">
                              {institute.address}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start gap-3 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-gray-400 mt-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="M3 7l9 6 9-6" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Email
                            </div>
                            <div className="text-sm text-gray-800">
                              {institute.emailId}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-gray-400 mt-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">
                              Phone
                            </div>
                            <div className="text-sm text-gray-800">
                              {institute.phone}
                            </div>
                          </div>
                        </div>
                        {institute.website && (
                          <div className="flex items-start gap-3 mb-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5 text-gray-400 mt-0.5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                            </svg>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">
                                Website
                              </div>
                              <a
                                href={
                                  institute.website.startsWith("http")
                                    ? institute.website
                                    : `https://${institute.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:underline"
                              >
                                {institute.website}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Contact Person
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800">
                      {institute.firstName} {institute.lastName} (
                      {institute.Role})
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Registered Date
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800">
                      {new Date(institute.createdAt).toLocaleString("en-GB")}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Expected Students
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800">
                      {institute.expectedStudents}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Expected Teachers
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800">
                      {institute.expectedTeachers}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Bio
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-800">{institute.bio}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35 }}
                className="p-8"
              >
                <h3 className="text-base font-semibold text-gray-800 mb-4">
                  Uploaded Documents
                </h3>
                <div className="space-y-3">
                  {/* Aadhar Card */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        {/* icon */}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          Aadhar Card
                        </div>
                        <div className="text-xs text-gray-500">
                          Identity verification document
                        </div>
                      </div>
                    </div>
                    {institute.aadharUrl && (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"
                        onClick={() =>
                          window.open(institute.aadharUrl, "_blank")
                        }
                      >
                        View
                      </button>
                    )}
                  </div>

                  {/* Designation ID */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                        {/* icon */}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          Designation ID
                        </div>
                        <div className="text-xs text-gray-500">
                          Official designation document
                        </div>
                      </div>
                    </div>
                    {institute.designationIDUrl && (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium"
                        onClick={() =>
                          window.open(institute.designationIDUrl, "_blank")
                        }
                      >
                        View
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <motion.button
            whileHover={{
              scale: approveLoading ? 1 : 1.04,
              boxShadow: approveLoading
                ? "none"
                : "0 8px 24px 0 rgba(16,185,129,0.15)",
            }}
            whileTap={approveLoading ? {} : { scale: 0.97 }}
            onClick={handleApprove}
            disabled={approveLoading}
            className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200 ${
              approveLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {approveLoading ? "Approving..." : "Approve Institute"}
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow: "0 8px 24px 0 rgba(239,68,68,0.15)",
            }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 bg-gradient-to-r from-red-400 to-red-500 border border-gray-300 text-white hover:from-red-500 hover:to-red-600 px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all duration-200"
          >
            Reject
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default PendingInstituteDetailsPage;
