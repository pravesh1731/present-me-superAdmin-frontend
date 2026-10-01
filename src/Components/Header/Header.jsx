import React, { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import axios from "axios";
import { ChevronRight, CircleAlert, Menu, RefreshCw, Search } from "lucide-react";
import Sidebar from "../sidebar/Sidebar";
import CommandPalette from "./CommandPalette";
import { NotificationsMenu, ProfileMenu } from "./HeaderMenus";
import { addUser } from "../utils/userSlice";
import { BaseUrl } from "../utils/constants";
import { shortcutLabel } from "../utils/platform";

const titleMap = {
  "/superadmin": "Dashboard",
  "/superadmin/teachers": "Teachers",
  "/superadmin/students": "Students",
  "/superadmin/pending-institutes": "Pending Institutes",
  "/superadmin/verified-institutes": "Verified Institutes",
  "/superadmin/pyq-notes": "PYQ & Notes",
  "/superadmin/PYQ&Notes": "PYQ & Notes",
  "/superadmin/withdrawals": "Withdrawals",
};

// Detail pages get a "Parent / Details" breadcrumb
const detailParents = {
  "/superadmin/pending-institutes/": "/superadmin/pending-institutes",
  "/superadmin/verified-institutes/": "/superadmin/verified-institutes",
};

const COLLAPSED_KEY = "presentme_sidebar_collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};

const Header = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(true);

  //this is because jab ham refresh kre to user ka data lost na ho (logout jaisa na ho jye)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(BaseUrl + "/sadmin/profile", {
        withCredentials: true,
      });

      dispatch(addUser(response.data));
      setFetchError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate("/superadmin/signin");
      } else {
        setFetchError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Ctrl/Cmd + K opens the command palette from anywhere
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close the mobile drawer whenever the route changes
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Handle dynamic routes like /pending-institutes/:id
  const detailPrefix = Object.keys(detailParents).find((prefix) =>
    location.pathname.startsWith(prefix)
  );
  const parentPath = detailPrefix ? detailParents[detailPrefix] : null;
  const title = detailPrefix
    ? "Institute Details"
    : titleMap[location.pathname] || "Dashboard";
  const parentTitle = parentPath ? titleMap[parentPath] : null;

  // Browser tab title, so several tabs stay distinguishable
  useEffect(() => {
    document.title = `${parentTitle ? `${title} · ${parentTitle}` : title} · Present-Me Super Admin`;
  }, [title, parentTitle]);

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setCollapsed((value) => {
        try {
          localStorage.setItem(COLLAPSED_KEY, value ? "0" : "1");
        } catch {
          // storage unavailable — the preference just won't persist
        }
        return !value;
      });
    } else {
      setMobileOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0A80F5]"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <CircleAlert className="h-12 w-12 text-rose-400" />
        <h1 className="text-xl font-semibold text-gray-800">Can&apos;t reach the server</h1>
        <p className="max-w-sm text-sm text-gray-500">
          {fetchError.response?.data?.message ||
            "Check your connection and try again. If this keeps happening, the server may be down."}
        </p>
        <button
          onClick={fetchUserData}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0874dd]"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
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
        className={`flex-1 min-w-0 bg-gray-50 min-h-screen pt-14 md:pt-16 md:static transition-all duration-200 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header
          className={`mb-6 flex items-center justify-between gap-3 shadow-md fixed top-0 left-0 right-0 bg-linear-to-r from-[#0BCCEB] to-[#0A80F5] text-white z-30 px-4 h-14 ${
            collapsed ? "md:left-20" : "md:left-64"
          }`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
              className="rounded-md border border-white/30 bg-white/15 p-2 text-white transition hover:bg-white/25"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
              {parentTitle && (
                <>
                  <button
                    onClick={() => navigate(parentPath)}
                    className="hidden truncate text-sm text-white/80 hover:text-white sm:block"
                  >
                    {parentTitle}
                  </button>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 text-white/50 sm:block" />
                </>
              )}
              <h1 className="truncate text-xl font-semibold [text-shadow:0_1px_2px_rgba(8,60,140,0.25)]">{title}</h1>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setPaletteOpen(true)}
              aria-label="Search"
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 p-2 text-sm text-white/90 transition hover:bg-white/25 sm:w-56 sm:px-3"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span className="hidden flex-1 text-left sm:block">Search or jump to…</span>
              <kbd className="hidden rounded border border-white/30 bg-white/15 px-1.5 text-[10px] text-white/90 sm:block">
                {shortcutLabel}
              </kbd>
            </button>

            <NotificationsMenu />
            <ProfileMenu />
          </div>
        </header>

        <div className="px-4 pt-8 md:pl-8">
          <div className="max-w-full md:max-w-7xl mx-auto w-full">
            {/* Subtle fade-in on every route change (enter only, so there is no flash of the old page) */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </main>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};

export default Header;
