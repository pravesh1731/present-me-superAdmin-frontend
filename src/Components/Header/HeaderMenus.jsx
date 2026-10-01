import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Building2,
  CircleCheck,
  FileText,
  LogOut,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { loadOverview } from "../utils/overview";
import { logout } from "../utils/auth";
import { agoLabel, money } from "../utils/format";

// Closes a dropdown on outside click or Escape
function useDismiss(open, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => ref.current && !ref.current.contains(event.target) && onClose();
    const onKey = (event) => event.key === "Escape" && onClose();

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}

export function NotificationsMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.overview);
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const openWithdrawals = (data?.withdrawals?.pending || 0) + (data?.withdrawals?.processing || 0);
  const queues = [
    {
      icon: Building2,
      tone: "bg-amber-50 text-amber-600",
      title: "Institutes to review",
      count: data?.institutions?.pending || 0,
      hint: data?.institutions?.oldestPendingAt
        ? `Oldest: ${agoLabel(data.institutions.oldestPendingAt).toLowerCase()}`
        : "",
      to: "/superadmin/pending-institutes",
    },
    {
      icon: FileText,
      tone: "bg-blue-50 text-[#0A80F5]",
      title: "PYQ & Notes to review",
      count: data?.notes?.pending || 0,
      hint: data?.notes?.oldestPendingAt ? `Oldest: ${agoLabel(data.notes.oldestPendingAt).toLowerCase()}` : "",
      to: "/superadmin/pyq-notes?status=pending",
    },
    {
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-600",
      title: "Withdrawals to process",
      count: openWithdrawals,
      hint: `${money((data?.withdrawals?.pendingAmount || 0) + (data?.withdrawals?.processingAmount || 0))} to pay out`,
      to: "/superadmin/withdrawals?status=PENDING",
    },
  ];
  const total = queues.reduce((sum, queue) => sum + queue.count, 0);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label={total ? `${total} items need your attention` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-lg border border-white/30 bg-white/15 p-2 text-white transition hover:bg-white/25"
      >
        <Bell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-[#0A80F5]">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">Needs your attention</p>
            <button
              onClick={() => loadOverview(dispatch, { force: true })}
              disabled={loading}
              className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {total === 0 ? (
            <div className="px-4 py-8 text-center">
              <CircleCheck className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="mt-2 text-sm font-medium text-gray-800">You&apos;re all caught up</p>
              <p className="text-xs text-gray-500">Nothing is waiting for review.</p>
            </div>
          ) : (
            <ul className="p-2">
              {queues
                .filter((queue) => queue.count > 0)
                .map((queue) => (
                  <li key={queue.title}>
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate(queue.to);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-gray-50"
                    >
                      <span className={`rounded-lg p-2 ${queue.tone}`}>
                        <queue.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-800">{queue.title}</span>
                        <span className="block truncate text-xs text-gray-500">{queue.hint}</span>
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {queue.count}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          )}

          <button
            onClick={() => {
              setOpen(false);
              navigate("/superadmin");
            }}
            className="w-full border-t border-gray-100 px-4 py-2.5 text-center text-xs font-medium text-[#0A80F5] hover:bg-gray-50"
          >
            Open dashboard
          </button>
        </div>
      )}
    </div>
  );
}

export function ProfileMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector((state) => state.user?.admin);
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));

  const name = `${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() || "Super Admin";
  const initials = `${admin?.firstName?.[0] || ""}${admin?.lastName?.[0] || ""}`.toUpperCase() || "SA";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-semibold text-[#0A80F5] shadow-sm ring-2 ring-white/50 transition hover:ring-white"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">{name}</p>
              <p className="truncate text-xs text-gray-500">{admin?.emailId || "Super Admin"}</p>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                setOpen(false);
                logout(dispatch, navigate);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
