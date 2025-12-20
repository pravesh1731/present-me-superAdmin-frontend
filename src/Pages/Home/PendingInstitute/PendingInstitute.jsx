import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { setPendingInstitutes } from "../../../Components/utils/instituteSlice";
import { BaseUrl } from "../../../Components/utils/constants";

function PendingInstitute() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pending = useSelector((state) => state.institute.pending) || {};
  const [loading, setLoading] = useState(true);

  const getInstituteDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(BaseUrl + "/sadmin/pendingInstitutes", {
        withCredentials: true,
      });
      dispatch(setPendingInstitutes(response.data));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    getInstituteDetails();
  }, []);

  const handleViewDetails = (pending) => {
    navigate(`/superadmin/pending-institutes/${pending.institutionId}`);
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 16 },
    },
    hover: {
      scale: 1.025,
      boxShadow: "0 8px 32px 0 rgba(60, 72, 180, 0.12)",
    },
  };

  // Shimmer placeholder component
  const ShimmerCard = () => (
    <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 relative overflow-hidden animate-pulse">
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
      <div className="border-t pt-4">
        <div className="h-4 w-64 bg-gray-200 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-2 md:px-8">
      <div className="mb-8 flex flex-col items-start ml-6">
        <h2 className="text-3xl font-bold text-indigo-800 tracking-tight drop-shadow-sm">
          Pending Institutes
        </h2>
        <p className="text-base text-gray-500 mt-1">
          Review and verify institute registration requests
        </p>
      </div>

      <div className="space-y-12 max-w-5xl mx-auto">
        <AnimatePresence>
          {loading ? (
            // Show 3 shimmer cards while loading
            <>
              <ShimmerCard />
              <ShimmerCard />
              <ShimmerCard />
            </>
          ) : Array.isArray(pending.data) && pending.data.length > 0 ? (
            pending.data.map((pending, idx) => (
              <motion.div
                key={pending.institutionId}
                className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 relative overflow-hidden group transition-all"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                exit="hidden"
                transition={{ delay: idx * 0.05 }}
                style={{
                  boxShadow: "0 4px 24px 0 rgba(60, 72, 180, 0.08)",
                }}
              >
                {/* 3D floating accent */}
                <motion.div
                  className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-indigo-100 opacity-40 blur-2xl z-0"
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 16,
                    ease: "linear",
                  }}
                />
                <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6 relative z-10">
                  <div className="flex items-start gap-5">
                    <motion.div
                      className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-indigo-200 shadow-lg border-2 border-indigo-100"
                      whileHover={{ scale: 1.08, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 120 }}
                    >
                      {pending.profilePicUrl ? (
                        <img
                          src={pending.profilePicUrl}
                          alt={pending.InstitutionName?.charAt(0).toUpperCase()}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-indigo-700 font-bold text-2xl">
                          {pending.InstitutionName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {pending.InstitutionName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full shadow-sm font-medium">
                          {pending.status}
                        </span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          {pending.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleViewDetails(pending)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700 bg-white shadow transition-all hover:bg-indigo-50 hover:text-indigo-900 hover:shadow-lg active:scale-95"
                    whileTap={{ scale: 0.97 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 relative z-10">
                  <div className="space-y-5">
                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
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
                        <div className="text-xs text-gray-500">Address</div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {pending.address}
                        </div>
                      </div>
                    </div>
                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
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
                        <div className="text-xs text-gray-500">Email</div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {pending.emailId}
                        </div>
                      </div>
                    </div>
                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {pending.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {/* Contact Person */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-500">
                          Contact Person
                        </div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {pending.firstName + " " + pending.lastName}
                        </div>
                      </div>
                    </div>
                    {/* Registered Date */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-500">
                          Registered Date
                        </div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {new Date(pending.createdAt).toLocaleString("en-GB")}
                        </div>
                      </div>
                    </div>
                    {/* Expected Students */}
                    <div className="flex items-start gap-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-indigo-400 mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      <div>
                        <div className="text-xs text-gray-500">
                          Expected Students
                        </div>
                        <div className="text-sm text-gray-800 mt-0.5 font-medium">
                          {pending.expectedStudents} students
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 relative z-10">
                  <div className="text-xs text-gray-500 mb-1">Description</div>
                  <p className="text-sm text-gray-700 font-medium">
                    {pending.bio}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center text-gray-500 py-16 text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              No pending institutes found.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PendingInstitute;
