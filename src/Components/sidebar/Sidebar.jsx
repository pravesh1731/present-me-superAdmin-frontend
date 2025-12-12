import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";
import {
  setPendingCount,
  setPendingInstitutes,
  setVerifiedCount,
  setVerifiedInstitutes,
} from "../utils/instituteSlice";

const navItems = [
  {
    to: "/superadmin",
    label: "Dashboard",
    icon: (
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
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: "/superadmin/teachers",
    label: "Teachers",
    icon: (
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
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: "/superadmin/students",
    label: "Students",
    icon: (
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
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <path d="M7 10l5 3 5-3" />
        <path d="M12 3v7" />
      </svg>
    ),
  },
  {
    to: "/superadmin/pending-institutes",
    label: "Pending Institutes",
    icon: (
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
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    to: "/superadmin/verified-institutes",
    label: "Verified Institutes",
    icon: (
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
        <path d="M21 12.79A9 9 0 1111.21 3" />
        <path d="M22 4l-10 10" />
      </svg>
    ),
  },
  {
    to: "/superadmin/chat",
    label: "Chat",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
];

const Sidebar = ({
  collapsed = false,
  mobileOpen = false,
  onClose = () => {},
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pending = useSelector((state) => state.institute.pending) || [];
  const verified = useSelector((state) => state.institute.verified) || [];

  const pendingCount = pending.length || 0;
  const verifiedCount = verified.length || 0;

  const fetchPending = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/sadmin/pendingInstitutes",
        { withCredentials: true }
      );
      dispatch(setPendingCount(res.data?.data?.length || 0));
    } catch (err) {
      console.error("Error fetching pending institutes:", err);
    }
  };

  const fetchVerified = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/sadmin/verifiedInstitutes",
        { withCredentials: true }
      );
      dispatch(setVerifiedCount(res.data?.data?.length || 0));
    } catch (err) {
      console.error("Error fetching verified institutes:", err);
    }
  };

  // 🔁 Extra Tip: auto-fetch on dashboard load (and on refresh)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Only fetch if arrays are empty (avoids double-fetch
        // if lists page already loaded them)
        if (pending.length === 0) {
          await fetchPending();
        }
        if (verified.length === 0) {
          await fetchVerified();
        }
      } catch (err) {
        console.error("Error loading institute data:", err);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/sadmin/logout",
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeUser());
      navigate("/superadmin/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside>
      {/* Desktop sidebar */}
      <div
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full bg-white border-r border-gray-100 z-40 transition-all ${
          collapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div
          className={`h-24 flex items-center ${
            collapsed ? "justify-center" : "px-2"
          }`}
        >
          <div className="w-10 h-10 rounded-md bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] flex items-center justify-center text-white font-semibold mr-3">
            PM
          </div>
          {!collapsed && (
            <div>
              <div className="font-semibold">Present-Me</div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-3 px-4"
                } py-3 rounded-lg text-sm ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span className="w-6 text-center">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              collapsed
                ? "p-2 rounded-full"
                : "w-full text-left px-3 py-2 rounded-lg"
            } border border-gray-100 text-sm text-gray-700 hover:bg-gray-50`}
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!collapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black opacity-30"
            onClick={onClose}
          ></div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 flex flex-col h-full">
            <div className="h-16 flex items-center">
              <div className="w-10 h-10 rounded-md bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] flex items-center justify-center text-white font-semibold mr-3">
                PM
              </div>
              <div>
                <div className="font-semibold">Present-Me</div>
                <div className="text-xs text-gray-500">Admin Panel</div>
              </div>
            </div>
            <nav className="mt-4 space-y-1 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                >
                  <span className="w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left px-3 py-2 rounded-lg border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 mt-4"
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
