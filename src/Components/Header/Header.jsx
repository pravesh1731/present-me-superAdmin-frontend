import React, { use, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addUser } from "../utils/userSlice";
import { Store } from "lucide-react";
import { BaseUrl } from "../utils/constants";

const titleMap = {
  "/superadmin": "Dashboard",
  "/superadmin/teachers": "Teachers",
  "/superadmin/students": "Students",
  "/superadmin/pending-institutes": "Pending Institutes",
  "/superadmin/verified-institutes": "Verified Institutes",
  "/superadmin/chat": "Chat",
};

const Header = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);

  //this is because jab ham refresh kre to user ka data lost na ho (logout jaisa na ho jye)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const response = await axios.get(BaseUrl + "/sadmin/profile", {
        withCredentials: true,
      });

      dispatch(addUser(response.data));
      setFetchError(null);
    } catch (err) {
      setFetchError(err);
      if (err.response && err.response.status === 401) {
        navigate("/superadmin/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  const user = useSelector((store) => store.user);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle dynamic routes like /pending-institutes/:id
  let title = titleMap[location.pathname] || "Dashboard";
  if (location.pathname.startsWith("/superadmin/pending-institutes/")) {
    title = "Institute Details";
  }
  if (location.pathname.startsWith("/superadmin/verified-institutes/")) {
    title = "Institute Details";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0A80F5]"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main
        className={`flex-1 bg-gray-50 min-h-screen pt-14 md:pt-16 md:static transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header
          className={`mb-6 flex items-center justify-between border-b border-gray-200 shadow-md fixed top-0 left-0 right-0 bg-white z-30 px-4 h-14 ${
            collapsed ? "md:left-20" : "md:left-64"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (window.innerWidth >= 768) {
                  setCollapsed(!collapsed);
                } else {
                  setMobileOpen(true);
                }
              }}
              className="p-2 rounded-md bg-white border border-gray-100 shadow-sm"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] flex items-center justify-center text-white font-semibold">
              {user.admin.firstName[0] + user.admin.lastName[0]}
            </div>
          </div>
        </header>

        <div className="px-4 pt-8 md:pl-8">
          <div className="max-w-full md:max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Header;
