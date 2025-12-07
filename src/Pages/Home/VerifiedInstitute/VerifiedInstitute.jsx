import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setVerifiedInstitutes } from "../../../Components/utils/instituteSlice";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

function VerifiedInstitute() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const verified = useSelector((state) => state.institute.verified) || {};

  const getInstituteDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/sadmin/verifiedInstitutes",
        { withCredentials: true }
      );
      dispatch(setVerifiedInstitutes(response.data));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getInstituteDetails();
  }, []);

  const handleViewDetails = (verified) => {
    navigate(`/verified-institutes/${verified.institutionId}`);
  };

  const filteredInstitutes = Array.isArray(verified.data)
    ? verified.data.filter(
        (item) =>
          item.InstitutionName?.toLowerCase().includes(
            searchQuery.toLowerCase()
          ) || item.firstName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
      scale: 1.03,
      boxShadow: "0 8px 32px 0 rgba(60, 72, 180, 0.14)",
    },
  };

  return (
    <div className="min-h-screen py-8 px-2 md:px-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-start">
        <h2 className="text-3xl font-bold text-indigo-800 tracking-tight drop-shadow-sm">
          Verified Institutes
        </h2>
        <p className="text-base text-gray-500 mt-1">
          All verified and active institutes
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search institutes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 pl-12 border border-gray-200 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Institutes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {filteredInstitutes.map((verified, idx) => (
            <motion.div
              key={verified.institutionId}
              className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 relative overflow-hidden group transition-all"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              exit="hidden"
              transition={{ delay: idx * 0.05 }}
              style={{
                boxShadow: "0 4px 24px 0 rgba(60, 72, 180, 0.10)",
              }}
            >
              {/* 3D floating accent */}
              <motion.div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-indigo-100 opacity-30 blur-2xl z-0"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 16,
                  ease: "linear",
                }}
              />
              {/* Institute Header */}
              <div className="flex items-start gap-5 mb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-indigo-200 shadow-lg border-2 border-indigo-100"
                  whileHover={{ scale: 1.08, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 120 }}
                >
                  {verified.profilePicUrl ? (
                    <img
                      src={verified.profilePicUrl}
                      alt={verified.InstitutionName?.charAt(0).toUpperCase()}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-indigo-700 font-bold text-2xl">
                      {verified.InstitutionName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {verified.InstitutionName}
                  </h3>
                  <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full shadow font-medium">
                    {verified.status}
                  </span>
                </div>
              </div>

              {/* Institute Details */}
              <div className="space-y-2 mb-6 relative z-10">
                <div className="text-base text-gray-700 font-medium">
                  {verified.InstitutionName}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {verified.address}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100 relative z-10">
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-blue-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Students</div>
                    <div className="text-base font-semibold text-gray-800">
                      {verified.expectedStudents}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-purple-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87" />
                    <path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-500">Teachers</div>
                    <div className="text-base font-semibold text-gray-800">
                      {verified.expectedTeachers}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 relative z-10">
                <motion.button
                  onClick={() => handleViewDetails(verified)}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white shadow transition-all hover:bg-indigo-50 hover:text-indigo-900 hover:shadow-lg active:scale-95"
                  whileTap={{ scale: 0.97 }}
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
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  View
                </motion.button>
                <motion.button
                  onClick={() => navigate("/chat")}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow transition-all active:scale-95"
                  whileTap={{ scale: 0.97 }}
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
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  Chat
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredInstitutes.length === 0 && (
        <motion.div
          className="bg-white rounded-3xl p-16 text-center shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-500 text-lg">
            No institutes found matching your search.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default VerifiedInstitute;
