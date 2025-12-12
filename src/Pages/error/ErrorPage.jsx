import React from "react";
import { AlertTriangle, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] text-center px-6 relative overflow-hidden">
      {/* Floating background accents */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl opacity-20"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-20"
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full backdrop-blur-lg bg-white/20 shadow-2xl rounded-3xl p-10 border border-white/30 relative z-10 text-white"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="bg-linear-to-tr from-[#FF5F6D] to-[#FF1E56] text-white p-4 rounded-full shadow-lg backdrop-blur-md border border-white/20">
            <AlertTriangle className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md">
            Oops! Something went wrong.
          </h1>

          {/* Message */}
          <p className="text-white/90 text-base leading-relaxed">
            An unexpected error occurred while loading the{" "}
            <b>Present Me Admin Panel</b>. Please try again or return to your
            dashboard.
          </p>

          {/* Action Button */}
          <div className="mt-6">
            <motion.button
              onClick={() => navigate("/superadmin")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white text-[#0A80F5] px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-2xl transition-all"
            >
              <Home className="w-5 h-5" />
              Go back to Dashboard
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-10 text-sm text-white/80 relative z-10">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">Present Me Admin</span> · Modern
        Attendance System
      </footer>
    </div>
  );
};

export default ErrorPage;
