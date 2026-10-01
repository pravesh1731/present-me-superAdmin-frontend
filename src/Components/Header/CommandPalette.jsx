import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Building2,
  Clock,
  CornerDownLeft,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import { BaseUrl } from "../utils/constants";
import { loadOverview } from "../utils/overview";
import { logout } from "../utils/auth";
import { fullName } from "../utils/format";

const GROUP_ORDER = ["Pages", "Actions", "Institutes", "Teachers", "Students"];

const matches = (text, tokens) => {
  const haystack = String(text || "").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
};

// Cmd/Ctrl+K "jump to anything": pages, quick actions, institutes, teachers and students
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const overview = useSelector((state) => state.overview.data);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [institutes, setInstitutes] = useState([]);
  const [people, setPeople] = useState({ teachers: [], students: [], loading: false });
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const institutesLoaded = useRef(false);

  const go = (path) => () => navigate(path);

  const staticItems = useMemo(() => {
    const waiting = {
      institutes: overview?.institutions?.pending || 0,
      notes: overview?.notes?.pending || 0,
      withdrawals: (overview?.withdrawals?.pending || 0) + (overview?.withdrawals?.processing || 0),
    };
    const count = (n) => (n ? `${n} waiting` : "All clear");

    return [
      { group: "Pages", title: "Dashboard", icon: LayoutDashboard, keywords: "home overview", run: go("/superadmin") },
      { group: "Pages", title: "Teachers", icon: GraduationCap, keywords: "faculty staff", run: go("/superadmin/teachers") },
      { group: "Pages", title: "Students", icon: Users, keywords: "learners", run: go("/superadmin/students") },
      { group: "Pages", title: "Pending Institutes", icon: Clock, keywords: "registrations approve", run: go("/superadmin/pending-institutes") },
      { group: "Pages", title: "Verified Institutes", icon: BadgeCheck, keywords: "colleges schools", run: go("/superadmin/verified-institutes") },
      { group: "Pages", title: "PYQ & Notes", icon: FileText, keywords: "papers documents uploads", run: go("/superadmin/pyq-notes") },
      { group: "Pages", title: "Withdrawals", icon: Wallet, keywords: "payouts upi money", run: go("/superadmin/withdrawals") },
      { group: "Actions", title: "Review pending institutes", subtitle: count(waiting.institutes), icon: Clock, keywords: "approve reject", run: go("/superadmin/pending-institutes") },
      { group: "Actions", title: "Review pending PYQ & Notes", subtitle: count(waiting.notes), icon: FileText, keywords: "verify reject documents", run: go("/superadmin/pyq-notes?status=pending") },
      { group: "Actions", title: "Process pending withdrawals", subtitle: count(waiting.withdrawals), icon: Wallet, keywords: "pay payout upi", run: go("/superadmin/withdrawals?status=PENDING") },
      { group: "Actions", title: "Students who haven't verified email", icon: Mail, keywords: "unverified", run: go("/superadmin/students?verified=unverified") },
      { group: "Actions", title: "Refresh dashboard numbers", icon: RefreshCw, keywords: "reload update", run: () => loadOverview(dispatch, { force: true }) },
      { group: "Actions", title: "Sign out", icon: LogOut, keywords: "logout exit", run: () => logout(dispatch, navigate) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview]);

  // reset + focus every time the palette opens; load institutes once for instant search
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setTimeout(() => inputRef.current?.focus(), 0);

    if (!institutesLoaded.current) {
      institutesLoaded.current = true;
      Promise.allSettled([
        axios.get(`${BaseUrl}/sadmin/verifiedInstitutes`, { withCredentials: true }),
        axios.get(`${BaseUrl}/sadmin/pendingInstitutes`, { withCredentials: true }),
      ]).then(([verified, pending]) => {
        const rows = [
          ...(verified.value?.data?.data || []).map((item) => ({ ...item, state: "verified" })),
          ...(pending.value?.data?.data || []).map((item) => ({ ...item, state: "pending" })),
        ];
        setInstitutes(rows);
        if (!rows.length) institutesLoaded.current = false; // try again next time
      });
    }
  }, [open]);

  // teachers + students come from the server, debounced
  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setPeople({ teachers: [], students: [], loading: false });
      return undefined;
    }

    let current = true;
    setPeople((state) => ({ ...state, loading: true }));
    const timer = setTimeout(async () => {
      const get = (what) =>
        axios.get(`${BaseUrl}/sadmin/${what}`, {
          params: { search: term, pageSize: 5 },
          withCredentials: true,
        });
      const [teachers, students] = await Promise.allSettled([get("teachers"), get("students")]);
      if (!current) return;
      setPeople({
        teachers: teachers.value?.data?.data || [],
        students: students.value?.data?.data || [],
        loading: false,
      });
    }, 300);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query, open]);

  const results = useMemo(() => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = [];

    staticItems.forEach((item) => {
      if (!tokens.length || matches(`${item.title} ${item.keywords}`, tokens)) list.push(item);
    });

    if (tokens.length) {
      institutes
        .filter((item) =>
          matches(`${item.InstitutionName} ${item.emailId} ${fullName(item)} ${item.address}`, tokens)
        )
        .slice(0, 5)
        .forEach((item) =>
          list.push({
            group: "Institutes",
            title: item.InstitutionName,
            subtitle: `${item.state === "verified" ? "Verified" : "Pending"} · ${item.emailId || ""}`,
            icon: Building2,
            run: go(
              item.state === "verified"
                ? `/superadmin/verified-institutes/${item.institutionId}`
                : `/superadmin/pending-institutes/${item.institutionId}`
            ),
          })
        );

      people.teachers.forEach((teacher) =>
        list.push({
          group: "Teachers",
          title: fullName(teacher),
          subtitle: `${teacher.institutionName || ""} · ${teacher.emailId || ""}`,
          icon: GraduationCap,
          run: go(`/superadmin/teachers?search=${encodeURIComponent(teacher.emailId || fullName(teacher))}`),
        })
      );
      people.students.forEach((student) =>
        list.push({
          group: "Students",
          title: fullName(student),
          subtitle: `${student.institutionName || ""} · ${student.rollNo || student.emailId || ""}`,
          icon: Users,
          run: go(`/superadmin/students?search=${encodeURIComponent(student.emailId || fullName(student))}`),
        })
      );
    }

    // Without a query keep the list short: pages + the first few actions
    const capped = tokens.length
      ? list
      : list.filter((item) => item.group === "Pages" || list.filter((x) => x.group === "Actions").indexOf(item) < 4);

    return GROUP_ORDER.flatMap((group) => capped.filter((item) => item.group === group));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, staticItems, institutes, people]);

  useEffect(() => setActive(0), [query]);

  // keep the highlighted row visible while arrowing through a long list
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const choose = (item) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  let lastGroup = null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-gray-900/40 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages, institutes, teachers, students…"
            aria-label="Search"
            className="w-full bg-transparent py-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
          />
          {people.loading && <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-gray-400" />}
          <kbd className="hidden rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400 sm:block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-gray-500">
              {people.loading ? "Searching…" : `No results for “${query}”`}
            </p>
          ) : (
            results.map((item, index) => {
              const showHeading = item.group !== lastGroup;
              lastGroup = item.group;
              const Icon = item.icon;
              const isActive = index === active;

              return (
                <React.Fragment key={`${item.group}-${item.title}-${index}`}>
                  {showHeading && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {item.group}
                    </p>
                  )}
                  <button
                    data-index={index}
                    role="option"
                    aria-selected={isActive}
                    onMouseMove={() => setActive(index)}
                    onClick={() => choose(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive ? "bg-[#0A80F5]/10" : ""
                    }`}
                  >
                    <span
                      className={`rounded-lg p-2 ${
                        isActive ? "bg-[#0A80F5] text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-gray-800">{item.title}</span>
                      {item.subtitle && (
                        <span className="block truncate text-xs text-gray-500">{item.subtitle}</span>
                      )}
                    </span>
                    {isActive && <CornerDownLeft className="h-4 w-4 shrink-0 text-[#0A80F5]" />}
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-gray-100 bg-gray-50/70 px-4 py-2 text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <ArrowDown className="h-3 w-3" /> navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> open
          </span>
          <span className="ml-auto hidden sm:block">Type 2+ letters to search people</span>
        </div>
      </div>
    </div>
  );
}
