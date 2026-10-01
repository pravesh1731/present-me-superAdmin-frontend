import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { loadOverview } from "../utils/overview";
import { logout } from "../utils/auth";
import { LogOut } from "lucide-react";
import logo from "../../assets/logo-small.png";

// Small "needs action" counter next to a nav item
const NavBadge = ({ count, collapsed }) =>
  count > 0 ? (
    <span
      className={
        collapsed
          ? "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white ring-2 ring-[#0A80F5]"
          : "ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
      }
      title={`${count} waiting for review`}
    >
      {count > 99 ? "99+" : count}
    </span>
  ) : null;

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
    to: "/superadmin/pyq-notes",
    label: "PYQ & Notes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </svg>
    ),
  },
  {
    to: "/superadmin/withdrawals",
    label: "Withdrawals",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7h-7m7 5h-7m7 5h-7M4 5h5v5H4zm0 9h5v5H4z"
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
  const location = useLocation();
  // "/superadmin/" and "/superadmin" are the same page, but NavLink's `end` treats them differently
  const currentPath = location.pathname.replace(/\/+$/, "");

  const overview = useSelector((state) => state.overview.data);

  // Items that are waiting on the super admin, keyed by nav route
  const badges = {
    "/superadmin/pending-institutes": overview?.institutions?.pending || 0,
    "/superadmin/pyq-notes": overview?.notes?.pending || 0,
    "/superadmin/withdrawals":
      (overview?.withdrawals?.pending || 0) +
      (overview?.withdrawals?.processing || 0),
  };

  // One cached request feeds the badges and the dashboard (refreshed again after any action)
  useEffect(() => {
    loadOverview(dispatch);
  }, [dispatch]);

  const admin = useSelector((state) => state.user?.admin);
  const name = `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() || "Super Admin";
  const initials = `${admin?.firstName?.[0] || ""}${admin?.lastName?.[0] || ""}`.toUpperCase() || "SA";
  const handleLogout = () => logout(dispatch, navigate);

  // Dashboard is only active on the dashboard itself (not on every /superadmin/... page)
  const isDashboard = (item) => item.to === "/superadmin";
  const renderLink = (item, { compact, onNavigate }) => (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={onNavigate}
      title={compact ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center ${
          compact ? "justify-center py-3" : "gap-3 px-4 py-3"
        } rounded-lg text-sm transition-colors ${
          (isDashboard(item) ? currentPath === "/superadmin" : isActive)
            ? "bg-white font-medium text-[#0A80F5] shadow-sm"
            : "text-white/95 [text-shadow:0_1px_2px_rgba(8,60,140,0.25)] hover:bg-white/20 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {(isDashboard(item) ? currentPath === "/superadmin" : isActive) && (
            <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-linear-to-b from-[#0BCCEB] to-[#0A80F5]" />
          )}
          <span className="relative w-6 text-center">
            {item.icon}
            {compact && <NavBadge count={badges[item.to]} collapsed />}
          </span>
          {!compact && <span>{item.label}</span>}
          {!compact && <NavBadge count={badges[item.to]} />}
        </>
      )}
    </NavLink>
  );

  const userCard = (compact) => (
    <div className={`relative border-t border-white/25 p-3 ${compact ? "flex flex-col items-center gap-2" : ""}`}>
      <div className={`flex items-center ${compact ? "" : "gap-3 rounded-xl bg-white/15 p-2.5"}`}>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#0A80F5]"
          title={compact ? name : undefined}
        >
          {initials}
        </span>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-xs text-white/75">Super Admin</p>
          </div>
        )}
        {!compact && (
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
      {compact && (
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const brand = (compact) => (
    <div className={`relative flex h-24 items-center ${compact ? "justify-center" : "px-4"}`}>
      <img
        src={logo}
        alt="Present-Me"
        className="h-11 w-11 shrink-0 rounded-xl shadow-md ring-2 ring-white/60"
      />
      {!compact && (
        <div className="ml-3">
          <div className="font-semibold text-white [text-shadow:0_1px_2px_rgba(8,60,140,0.25)]">Present-Me</div>
          <div className="text-xs text-white/90 [text-shadow:0_1px_2px_rgba(8,60,140,0.25)]">Admin Panel</div>
        </div>
      )}
    </div>
  );

  return (
    <aside>
      {/* Desktop sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 hidden h-full flex-col overflow-hidden bg-linear-to-b from-[#0BCCEB] to-[#0A80F5] shadow-xl shadow-[#0A80F5]/20 transition-all md:flex ${
          collapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        {brand(collapsed)}
        <nav className="relative flex-1 space-y-1 px-2 py-2" aria-label="Main navigation">
          {navItems.map((item) => renderLink(item, { compact: collapsed }))}
        </nav>
        {userCard(collapsed)}
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose}></div>
          <div className="absolute bottom-0 left-0 top-0 flex h-full w-64 flex-col overflow-hidden bg-linear-to-b from-[#0BCCEB] to-[#0A80F5] shadow-xl">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            {brand(false)}
            <nav className="relative flex-1 space-y-1 overflow-y-auto px-2 py-2" aria-label="Main navigation">
              {navItems.map((item) => renderLink(item, { compact: false, onNavigate: onClose }))}
            </nav>
            {userCard(false)}
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
