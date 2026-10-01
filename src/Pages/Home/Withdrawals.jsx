import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  ArrowUpDown,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  FileDown,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Wallet,
  WalletCards,
  X,
} from "lucide-react";
import { BaseUrl } from "../../Components/utils/constants";

const PAGE_SIZE = 50;

const statuses = ["all", "PENDING", "PROCESSING", "PAID", "REJECTED", "FAILED"];

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amountHigh", label: "Amount: high to low" },
  { value: "amountLow", label: "Amount: low to high" },
];

const timeOf = (item) =>
  new Date(item?.requestedAt || item?.createdAt || 0).getTime();
const amountOf = (item) => Number(item?.amount) || 0;
const sorters = {
  newest: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  amountHigh: (a, b) => amountOf(b) - amountOf(a),
  amountLow: (a, b) => amountOf(a) - amountOf(b),
};

const emptyFilters = {
  status: "all",
  userRole: "all",
  institutionId: "",
  search: "",
  minAmount: "",
  maxAmount: "",
  fromDate: "",
  toDate: "",
};

const emptyStatusForm = {
  status: "",
  adminNote: "",
  paymentReferenceId: "",
  failureReason: "",
};

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";

const formatDate = (value, withTime = true) => {
  const date = new Date(value);

  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";
};

const money = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

const roleLabel = (role) =>
  ({ student: "Student", teacher: "Teacher" })[role] || role || "—";

const canUpdateStatus = (item) =>
  item?.status === "PENDING" || item?.status === "PROCESSING";

const statusClass = (status) =>
  ({
    PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    PROCESSING: "bg-blue-50 text-blue-700 ring-blue-600/20",
    PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
    REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/20",
    FAILED: "bg-gray-100 text-gray-700 ring-gray-500/20",
  })[String(status).toUpperCase()] ||
  "bg-gray-100 text-gray-700 ring-gray-500/20";

const statusLabel = (status) =>
  status ? status[0] + status.slice(1).toLowerCase() : "—";

const csvCell = (value) =>
  `"${String(value ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;

const exportCsv = (rows) => {
  const columns = [
    ["Withdrawal ID", (w) => w.withdrawalId],
    ["User", (w) => w.userName],
    ["Role", (w) => roleLabel(w.userRole)],
    ["Email", (w) => w.userEmail],
    ["Institute", (w) => w.institutionName],
    ["UPI ID", (w) => w.upiId],
    ["Amount", (w) => w.amount],
    ["Status", (w) => w.status],
    ["Requested at", (w) => w.requestedAt || w.createdAt],
    ["Processed at", (w) => w.processedAt],
    ["Payment reference", (w) => w.paymentReferenceId],
    ["Admin note", (w) => w.adminNote],
    ["Failure reason", (w) => w.failureReason],
  ];
  const lines = [
    columns.map(([label]) => csvCell(label)).join(","),
    ...rows.map((row) => columns.map(([, get]) => csvCell(get(row))).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `withdrawals-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

function WithdrawalStatus({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
        status
      )}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function Avatar({ name }) {
  const initials = String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] text-xs font-semibold text-white">
      {initials || "?"}
    </span>
  );
}

function RoleBadge({ role }) {
  const style =
    role === "teacher"
      ? "bg-indigo-50 text-indigo-700"
      : "bg-sky-50 text-sky-700";

  return (
    <span
      className={`whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ${style}`}
    >
      {roleLabel(role)}
    </span>
  );
}

function StatCard({ label, value, hint, icon, tone, loading }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
      <span className={`rounded-xl p-2.5 ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        {loading ? (
          <div className="mt-1.5 h-5 w-14 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="truncate text-lg font-semibold text-gray-800">{value}</p>
        )}
        {hint && !loading && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <label className="block text-xs font-medium text-gray-500">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Withdrawals() {
  const [filters, setFilters] = useState(emptyFilters);
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [items, setItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [page, setPage] = useState(1);

  const [detailItem, setDetailItem] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusForm, setStatusForm] = useState(emptyStatusForm);

  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);

  const notify = (message, tone = "success") => setToast({ message, tone });

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // "/" jumps to search
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Wait for the user to stop typing before hitting the API
  useEffect(() => {
    const timer = setTimeout(
      () => setFilters((current) => ({ ...current, search: searchInput.trim() })),
      400
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  const instituteNames = useMemo(() => {
    const map = {};
    institutes.forEach((item) => {
      const id = item.institutionId || item.id;
      if (id)
        map[id] =
          item.InstitutionName ||
          item.institutionName ||
          item.name ||
          "Unnamed Institute";
    });
    return map;
  }, [institutes]);

  const visibleItems = useMemo(
    () => [...items].sort(sorters[sortBy]),
    [items, sortBy]
  );

  // Totals for the rows currently loaded (the API is paginated, so this is per page)
  const stats = useMemo(() => {
    const summary = {
      pending: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      closed: { count: 0, amount: 0 },
    };
    items.forEach((item) => {
      const bucket =
        item.status === "PENDING"
          ? summary.pending
          : item.status === "PROCESSING"
            ? summary.processing
            : item.status === "PAID"
              ? summary.paid
              : summary.closed;
      bucket.count += 1;
      bucket.amount += amountOf(item);
    });
    return summary;
  }, [items]);

  const loadWithdrawals = async (cursor = null) => {
    setLoading(true);
    setError("");

    try {
      const params = {
        status: filters.status,
        userRole: filters.userRole,
        pageSize: PAGE_SIZE,
      };

      [
        "institutionId",
        "search",
        "minAmount",
        "maxAmount",
        "fromDate",
        "toDate",
      ].forEach((key) => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(`${BaseUrl}/sadmin/withdrawals`, {
        params,
        withCredentials: true,
      });

      setItems(Array.isArray(response.data?.data) ? response.data.data : []);
      setNextCursor(response.data?.nextCursor || null);
    } catch (requestError) {
      console.error("Unable to load withdrawals:", requestError);

      setItems([]);
      setNextCursor(null);

      setError(
        requestError.response?.data?.message ||
          "Unable to load withdrawal requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${BaseUrl}/sadmin/verifiedInstitutes`, {
        withCredentials: true,
      })
      .then((response) => {
        setInstitutes(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
      })
      .catch((requestError) => {
        console.error("Unable to load institutes:", requestError);
      });
  }, []);

  useEffect(() => {
    setCursorHistory([]);
    setPage(1);

    loadWithdrawals();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.status,
    filters.userRole,
    filters.institutionId,
    filters.search,
    filters.minAmount,
    filters.maxAmount,
    filters.fromDate,
    filters.toDate,
  ]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetAll = () => {
    setFilters(emptyFilters);
    setSearchInput("");
  };

  // Filters shown as removable chips (status lives in the tabs above)
  const activeChips = [
    filters.userRole !== "all" && {
      label: `${roleLabel(filters.userRole)}s`,
      clear: () => setFilter("userRole", "all"),
    },
    filters.institutionId && {
      label: instituteNames[filters.institutionId] || "Institute",
      clear: () => setFilter("institutionId", ""),
    },
    filters.minAmount && {
      label: `≥ ${money(filters.minAmount)}`,
      clear: () => setFilter("minAmount", ""),
    },
    filters.maxAmount && {
      label: `≤ ${money(filters.maxAmount)}`,
      clear: () => setFilter("maxAmount", ""),
    },
    filters.fromDate && {
      label: `From ${formatDate(filters.fromDate, false)}`,
      clear: () => setFilter("fromDate", ""),
    },
    filters.toDate && {
      label: `To ${formatDate(filters.toDate, false)}`,
      clear: () => setFilter("toDate", ""),
    },
    filters.search && {
      label: `“${filters.search}”`,
      clear: () => {
        setSearchInput("");
        setFilter("search", "");
      },
    },
  ].filter(Boolean);

  const currentCursor = () => (cursorHistory.length ? cursorHistory.at(-1) : null);

  const goNext = () => {
    if (!nextCursor || loading) return;

    setCursorHistory((history) => [...history, nextCursor]);
    setPage((value) => value + 1);
    loadWithdrawals(nextCursor);
  };

  const goPrevious = () => {
    if (!cursorHistory.length || loading) return;

    const history = cursorHistory.slice(0, -1);

    setCursorHistory(history);
    setPage((value) => value - 1);
    loadWithdrawals(history.at(-1) || null);
  };

  const openStatusModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setStatusForm(emptyStatusForm);
    setError("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (updatingStatus) return;

    setShowStatusModal(false);
    setSelectedWithdrawal(null);
    setStatusForm(emptyStatusForm);
  };

  const updateWithdrawalStatus = async () => {
    if (!selectedWithdrawal) return;

    const { status, adminNote, paymentReferenceId, failureReason } = statusForm;

    if (!status) {
      setError("Please select a status.");
      return;
    }

    if (status === "PAID" && !paymentReferenceId.trim()) {
      setError(
        "Payment reference ID is required when marking a withdrawal as PAID."
      );
      return;
    }

    if (status === "REJECTED" && !adminNote.trim()) {
      setError("Admin note is required when rejecting a withdrawal.");
      return;
    }

    if (status === "FAILED" && !failureReason.trim()) {
      setError(
        "Failure reason is required when marking a withdrawal as FAILED."
      );
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const payload = {
        status,
        adminNote: adminNote.trim() || undefined,
        paymentReferenceId: paymentReferenceId.trim() || undefined,
        failureReason: failureReason.trim() || undefined,
      };

      const response = await axios.patch(
        `${BaseUrl}/sadmin/withdrawals/${selectedWithdrawal.withdrawalId}/status`,
        payload,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        const label = statusLabel(status).toLowerCase();
        const amount = money(selectedWithdrawal.amount);

        setUpdatingStatus(false);
        setShowStatusModal(false);
        setSelectedWithdrawal(null);
        setStatusForm(emptyStatusForm);
        setDetailItem(null);
        notify(`${amount} withdrawal marked as ${label}`);

        await loadWithdrawals(currentCursor());
      }
    } catch (requestError) {
      console.error("Unable to update withdrawal status:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Unable to update withdrawal status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const detailIndex = detailItem
    ? visibleItems.findIndex((row) => row.withdrawalId === detailItem.withdrawalId)
    : -1;

  const stepDetail = (delta) => {
    const next = visibleItems[detailIndex + delta];
    if (next) setDetailItem(next);
  };

  const hasPendingBanner =
    !loading && stats.pending.count > 0 && filters.status !== "PENDING";

  return (
    <div className="pb-8">
      {/* PAGE HEADER */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Withdrawals</h2>

          <p className="mt-1 text-sm text-gray-500">
            Review withdrawal requests from students and teachers.
          </p>
        </div>

        <button
          onClick={() => {
            exportCsv(visibleItems);
            notify(`Exported ${visibleItems.length} rows to CSV`);
          }}
          disabled={loading || !visibleItems.length}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* SUMMARY */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={stats.pending.count}
          hint={money(stats.pending.amount)}
          icon={<Clock className="h-5 w-5" />}
          tone="bg-amber-50 text-amber-600"
          loading={loading}
        />
        <StatCard
          label="Processing"
          value={stats.processing.count}
          hint={money(stats.processing.amount)}
          icon={<LoaderCircle className="h-5 w-5" />}
          tone="bg-blue-50 text-[#0A80F5]"
          loading={loading}
        />
        <StatCard
          label="Paid out"
          value={money(stats.paid.amount)}
          hint={`${stats.paid.count} payout${stats.paid.count === 1 ? "" : "s"}`}
          icon={<CircleCheck className="h-5 w-5" />}
          tone="bg-emerald-50 text-emerald-600"
          loading={loading}
        />
        <StatCard
          label="Rejected / failed"
          value={stats.closed.count}
          hint={money(stats.closed.amount)}
          icon={<CircleX className="h-5 w-5" />}
          tone="bg-rose-50 text-rose-600"
          loading={loading}
        />
      </div>

      {hasPendingBanner && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <Banknote className="h-4 w-4 shrink-0" />
            <span>
              <strong>{stats.pending.count}</strong> request
              {stats.pending.count === 1 ? " is" : "s are"} waiting for review
              on this page, worth <strong>{money(stats.pending.amount)}</strong>.
            </span>
          </p>
          <button
            onClick={() => setFilter("status", "PENDING")}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600"
          >
            Review now
          </button>
        </div>
      )}

      {/* MAIN CARD */}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        {/* TOOLBAR */}

        <div className="space-y-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Withdrawal status"
            >
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter("status", status)}
                  role="tab"
                  aria-selected={filters.status === status}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    filters.status === status
                      ? "bg-[#0A80F5] text-white shadow-sm"
                      : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {status === "all" ? "All" : statusLabel(status)}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  ref={searchRef}
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
                  placeholder="Search ID, user or UPI…"
                  aria-label="Search withdrawals"
                />

                {searchInput ? (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-400">
                    /
                  </kbd>
                )}
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters((value) => !value)}
                  aria-expanded={showFilters}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition sm:flex-none ${
                    showFilters || activeChips.length
                      ? "border-[#0A80F5] bg-blue-50 text-[#0A80F5]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeChips.length > 0 && (
                    <span className="rounded-full bg-[#0A80F5] px-1.5 text-[11px] font-semibold text-white">
                      {activeChips.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => loadWithdrawals(currentCursor())}
                  disabled={loading}
                  className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                  aria-label="Refresh list"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="space-y-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <FilterField label="User type">
                  <select
                    value={filters.userRole}
                    onChange={(event) => setFilter("userRole", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="all">All users</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                  </select>
                </FilterField>

                <FilterField label="Institute">
                  <select
                    value={filters.institutionId}
                    onChange={(event) =>
                      setFilter("institutionId", event.target.value)
                    }
                    className={fieldClass}
                  >
                    <option value="">All institutes</option>

                    {institutes.map((item) => (
                      <option
                        key={item.institutionId || item.id}
                        value={item.institutionId || item.id}
                      >
                        {item.InstitutionName ||
                          item.institutionName ||
                          item.name ||
                          "Unnamed Institute"}
                      </option>
                    ))}
                  </select>
                </FilterField>

                <FilterField label="Minimum amount">
                  <input
                    min="0"
                    type="number"
                    value={filters.minAmount}
                    onChange={(event) => setFilter("minAmount", event.target.value)}
                    className={fieldClass}
                    placeholder="₹ 0"
                  />
                </FilterField>

                <FilterField label="Maximum amount">
                  <input
                    min="0"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(event) => setFilter("maxAmount", event.target.value)}
                    className={fieldClass}
                    placeholder="₹ 0"
                  />
                </FilterField>

                <FilterField label="From date">
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(event) => setFilter("fromDate", event.target.value)}
                    className={fieldClass}
                  />
                </FilterField>

                <FilterField label="To date">
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(event) => setFilter("toDate", event.target.value)}
                    className={fieldClass}
                  />
                </FilterField>

                <div className="sm:col-span-2">
                  <FilterField label="Sort by">
                    <div className="relative">
                      <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className={`${fieldClass} pl-9`}
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FilterField>
                </div>
              </div>
            </div>
          )}

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-3 pr-1.5 text-xs font-medium text-[#0A80F5] ring-1 ring-inset ring-blue-100"
                >
                  {chip.label}
                  <button
                    onClick={chip.clear}
                    className="rounded-full p-0.5 hover:bg-blue-100"
                    aria-label={`Remove filter ${chip.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <RotateCcw className="h-3 w-3" /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* ERROR */}

        {error && !showStatusModal && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:m-6">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => loadWithdrawals(currentCursor())}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-4 py-4 font-medium">UPI ID</th>
                <th className="px-4 py-4 font-medium">Requested</th>
                <th className="px-4 py-4 font-medium">Amount</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="sticky right-0 bg-white px-4 py-4 text-right font-medium">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton />
              ) : (
                visibleItems.map((item, index) => (
                  <WithdrawalRow
                    key={item.withdrawalId || index}
                    item={item}
                    onOpen={setDetailItem}
                    onUpdateStatus={openStatusModal}
                    onCopy={(text) => {
                      navigator.clipboard?.writeText(text);
                      notify("UPI ID copied");
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE */}

        <div className="space-y-3 p-4 md:hidden">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-gray-100 p-4"
                >
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))
            : visibleItems.map((item, index) => (
                <WithdrawalCard
                  key={item.withdrawalId || index}
                  item={item}
                  onOpen={setDetailItem}
                  onUpdateStatus={openStatusModal}
                />
              ))}
        </div>

        {/* EMPTY */}

        {!loading && !error && !visibleItems.length && (
          <div className="px-6 py-16 text-center">
            <WalletCards className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-3 font-medium text-gray-800">
              No withdrawals found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              {nextCursor
                ? "Nothing matches on this page, but more pages are available — try Next."
                : "Try changing or clearing the filters."}
            </p>

            {(activeChips.length > 0 || filters.status !== "all") && (
              <button
                onClick={resetAll}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset everything
              </button>
            )}
          </div>
        )}

        {/* PAGINATION */}

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-gray-500">
            Page <span className="font-medium text-gray-700">{page}</span> ·{" "}
            {items.length} loaded · up to {PAGE_SIZE} per page
          </p>

          <div className="flex gap-2">
            <button
              onClick={goPrevious}
              disabled={!cursorHistory.length || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <button
              onClick={goNext}
              disabled={!nextCursor || loading}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0A80F5] px-3 py-2 text-sm font-medium text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* DETAILS DRAWER */}

      {detailItem && (
        <DetailsDrawer
          item={detailItem}
          paused={showStatusModal}
          position={detailIndex >= 0 ? `${detailIndex + 1} / ${visibleItems.length}` : ""}
          onPrev={detailIndex > 0 ? () => stepDetail(-1) : null}
          onNext={
            detailIndex >= 0 && detailIndex < visibleItems.length - 1
              ? () => stepDetail(1)
              : null
          }
          onClose={() => setDetailItem(null)}
          onUpdateStatus={openStatusModal}
          onCopy={(label, text) => {
            navigator.clipboard?.writeText(text);
            notify(`${label} copied`);
          }}
        />
      )}

      {/* STATUS UPDATE MODAL */}

      {showStatusModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="status-title"
        >
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3
                  id="status-title"
                  className="text-lg font-semibold text-gray-800"
                >
                  Update Withdrawal
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedWithdrawal.withdrawalId}
                </p>
              </div>

              <button
                onClick={closeStatusModal}
                disabled={updatingStatus}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">User</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {selectedWithdrawal.userName || "Unknown user"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {roleLabel(selectedWithdrawal.userRole)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Institute</p>
                    <p className="mt-1 font-medium text-gray-800">
                      {selectedWithdrawal.institutionName || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="mt-1 font-semibold text-gray-800">
                      {money(selectedWithdrawal.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">UPI ID</p>
                    <p className="mt-1 truncate font-medium text-gray-800">
                      {selectedWithdrawal.upiId || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Current Status</p>
                    <div className="mt-1">
                      <WithdrawalStatus status={selectedWithdrawal.status} />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <label className="block text-sm font-medium text-gray-600">
                New Status
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({
                      ...current,
                      status: event.target.value,
                      paymentReferenceId: "",
                      failureReason: "",
                    }))
                  }
                  className={`${fieldClass} mt-1`}
                >
                  <option value="">Select status</option>

                  {selectedWithdrawal.status === "PENDING" && (
                    <>
                      <option value="PROCESSING">Processing</option>
                      <option value="REJECTED">Rejected</option>
                    </>
                  )}

                  {selectedWithdrawal.status === "PROCESSING" && (
                    <>
                      <option value="PAID">Paid</option>
                      <option value="FAILED">Failed</option>
                    </>
                  )}
                </select>
              </label>

              {statusForm.status === "PAID" && (
                <label className="block text-sm font-medium text-gray-600">
                  Payment Reference ID
                  <span className="text-rose-500"> *</span>
                  <input
                    type="text"
                    value={statusForm.paymentReferenceId}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        paymentReferenceId: event.target.value,
                      }))
                    }
                    className={`${fieldClass} mt-1`}
                    placeholder="e.g. UPI-TXN-987654"
                  />
                </label>
              )}

              {statusForm.status === "FAILED" && (
                <label className="block text-sm font-medium text-gray-600">
                  Failure Reason
                  <span className="text-rose-500"> *</span>
                  <textarea
                    value={statusForm.failureReason}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        failureReason: event.target.value,
                      }))
                    }
                    className={`${fieldClass} mt-1 min-h-[90px] resize-none`}
                    placeholder="Enter reason for payment failure"
                  />
                </label>
              )}

              {["PROCESSING", "PAID", "REJECTED", "FAILED"].includes(
                statusForm.status
              ) && (
                <label className="block text-sm font-medium text-gray-600">
                  Admin Note
                  {statusForm.status === "REJECTED" && (
                    <span className="text-rose-500"> *</span>
                  )}
                  <textarea
                    value={statusForm.adminNote}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        adminNote: event.target.value,
                      }))
                    }
                    className={`${fieldClass} mt-1 min-h-[90px] resize-none`}
                    placeholder="Enter admin note"
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeStatusModal}
                disabled={updatingStatus}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={updateWithdrawalStatus}
                disabled={updatingStatus || !statusForm.status}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2 text-sm font-medium text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {updatingStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.tone === "error" ? "bg-rose-600" : "bg-gray-900"
          }`}
        >
          {toast.tone === "error" ? (
            <CircleAlert className="h-4 w-4" />
          ) : (
            <CircleCheck className="h-4 w-4 text-emerald-400" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}

// ========================================
// DETAILS DRAWER
// ========================================

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-gray-800">
        {children}
      </dd>
    </div>
  );
}

function CopyValue({ label, value, onCopy }) {
  if (!value) return "—";

  return (
    <button
      onClick={() => onCopy(label, value)}
      className="inline-flex items-center gap-1.5 text-right hover:text-[#0A80F5]"
      title={`Copy ${label}`}
    >
      <span className="break-all">{value}</span>
      <Copy className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

// Fields already shown in the structured sections; the rest go under "All other fields"
const knownFields = [
  "withdrawalId",
  "userId",
  "userRole",
  "userName",
  "userEmail",
  "userExists",
  "institutionId",
  "institutionName",
  "upiId",
  "amount",
  "status",
  "requestedAt",
  "createdAt",
  "updatedAt",
  "processedAt",
  "adminNote",
  "paymentReferenceId",
  "failureReason",
];

function DetailsDrawer({
  item,
  paused,
  position,
  onPrev,
  onNext,
  onClose,
  onUpdateStatus,
  onCopy,
}) {
  const extraFields = Object.entries(item).filter(
    ([key, value]) =>
      !knownFields.includes(key) && value !== null && value !== undefined
  );

  useEffect(() => {
    const onKey = (event) => {
      if (paused) return;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) return;
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && onPrev) onPrev();
      if (event.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="withdrawal-title"
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
          <div className="min-w-0">
            <div className="mb-2">
              <WithdrawalStatus status={item.status} />
            </div>

            <h3
              id="withdrawal-title"
              className="text-2xl font-semibold text-gray-800"
            >
              {money(item.amount)}
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              Requested {formatDate(item.requestedAt || item.createdAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label="Previous request"
              title="Previous (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <span className="text-xs tabular-nums text-gray-400">{position}</span>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              aria-label="Next request"
              title="Next (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Close details"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {item.status === "REJECTED" && item.adminNote && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Rejected</p>
              <p className="mt-1 whitespace-pre-wrap">{item.adminNote}</p>
            </div>
          )}

          {item.status === "FAILED" && item.failureReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p className="font-semibold">Payment failed</p>
              <p className="mt-1 whitespace-pre-wrap">{item.failureReason}</p>
            </div>
          )}

          <section>
            <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Wallet className="h-4 w-4 text-[#0A80F5]" /> Payout
            </h4>
            <dl>
              <DetailRow label="Amount">{money(item.amount)}</DetailRow>
              <DetailRow label="UPI ID">
                <CopyValue label="UPI ID" value={item.upiId} onCopy={onCopy} />
              </DetailRow>
              <DetailRow label="Payment reference">
                <CopyValue
                  label="Payment reference"
                  value={item.paymentReferenceId}
                  onCopy={onCopy}
                />
              </DetailRow>
              {item.adminNote && item.status !== "REJECTED" && (
                <DetailRow label="Admin note">
                  <span className="whitespace-pre-wrap">{item.adminNote}</span>
                </DetailRow>
              )}
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">User</h4>
            <dl>
              <DetailRow label="Name">
                <span className="inline-flex items-center gap-2">
                  {item.userName || "Unknown user"}
                  <RoleBadge role={item.userRole} />
                </span>
              </DetailRow>
              <DetailRow label="Email">
                <CopyValue label="Email" value={item.userEmail} onCopy={onCopy} />
              </DetailRow>
              <DetailRow label="Institute">{item.institutionName || "—"}</DetailRow>
              {item.userExists === false && (
                <DetailRow label="Account">
                  <span className="text-amber-600">User record not found</span>
                </DetailRow>
              )}
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">Timeline</h4>
            <dl>
              <DetailRow label="Requested">
                {formatDate(item.requestedAt || item.createdAt)}
              </DetailRow>
              <DetailRow label="Last updated">{formatDate(item.updatedAt)}</DetailRow>
              <DetailRow label="Processed">{formatDate(item.processedAt)}</DetailRow>
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold text-gray-800">Identifiers</h4>
            <dl>
              <DetailRow label="Withdrawal ID">
                <span className="text-xs">
                  <CopyValue
                    label="Withdrawal ID"
                    value={item.withdrawalId}
                    onCopy={onCopy}
                  />
                </span>
              </DetailRow>
              <DetailRow label="User ID">
                <span className="break-all text-xs">{item.userId || "—"}</span>
              </DetailRow>
              <DetailRow label="Institute ID">
                <span className="break-all text-xs">{item.institutionId || "—"}</span>
              </DetailRow>
            </dl>
          </section>

          {extraFields.length > 0 && (
            <details className="rounded-xl bg-gray-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800">
                All other fields ({extraFields.length})
              </summary>
              <dl className="mt-2">
                {extraFields.map(([key, value]) => (
                  <DetailRow key={key} label={key}>
                    <span className="text-xs">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </DetailRow>
                ))}
              </dl>
            </details>
          )}
        </div>

        {canUpdateStatus(item) && (
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={() => onUpdateStatus(item)}
              className="w-full rounded-lg bg-[#0A80F5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0874dd]"
            >
              {item.status === "PENDING"
                ? "Review request"
                : "Mark as paid or failed"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

// ========================================
// TABLE SKELETON
// ========================================

function TableSkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <tr key={index} className="animate-pulse">
      <td className="px-6 py-5">
        <div className="h-9 w-44 rounded bg-gray-100" />
      </td>
      {[28, 24, 16].map((width) => (
        <td key={width} className="px-4 py-5">
          <div className="h-4 rounded bg-gray-100" style={{ width: `${width * 4}px` }} />
        </td>
      ))}
      <td className="px-4 py-5">
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-5">
        <div className="ml-auto h-8 w-20 rounded-lg bg-gray-100" />
      </td>
    </tr>
  ));
}

// ========================================
// DESKTOP ROW
// ========================================

function WithdrawalRow({ item, onOpen, onUpdateStatus, onCopy }) {
  const canUpdate = canUpdateStatus(item);

  return (
    <tr
      onClick={() => onOpen(item)}
      className={`cursor-pointer text-sm transition-colors hover:bg-blue-50/40 ${
        item.status === "PENDING"
          ? "bg-amber-50/30 shadow-[inset_3px_0_0_#f59e0b]"
          : ""
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={item.userName} />

          <div className="min-w-0">
            <p className="max-w-[200px] truncate font-medium text-gray-800">
              {item.userName || "Unknown user"}
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <RoleBadge role={item.userRole} />
              <span className="max-w-[140px] truncate text-xs text-gray-500">
                {item.institutionName || "—"}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-gray-600">
        {item.upiId ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onCopy(item.upiId);
            }}
            title="Copy UPI ID"
            className="group inline-flex items-center gap-1.5 hover:text-[#0A80F5]"
          >
            <span className="max-w-[160px] truncate">{item.upiId}</span>
            <Copy className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
          </button>
        ) : (
          "—"
        )}
      </td>

      <td className="px-4 py-4 text-gray-600">
        <div className="whitespace-nowrap">
          {formatDate(item.requestedAt || item.createdAt, false)}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(item.requestedAt || item.createdAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </td>

      <td className="px-4 py-4 text-base font-semibold text-gray-800">
        {money(item.amount)}
      </td>

      <td className="px-4 py-4">
        <WithdrawalStatus status={item.status} />
      </td>

      <td className="sticky right-0 bg-white px-4 py-4 text-right shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.08)]">
        {canUpdate ? (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onUpdateStatus(item);
            }}
            className="rounded-lg bg-[#0A80F5] px-3 py-2 text-xs font-medium text-white hover:bg-[#0874dd]"
          >
            Update
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Check className="h-3.5 w-3.5" /> Completed
          </span>
        )}
      </td>
    </tr>
  );
}

// ========================================
// MOBILE CARD
// ========================================

function WithdrawalCard({ item, onOpen, onUpdateStatus }) {
  const canUpdate = canUpdateStatus(item);

  return (
    <article
      onClick={() => onOpen(item)}
      className={`cursor-pointer rounded-xl border p-4 ${
        item.status === "PENDING"
          ? "border-amber-200 bg-amber-50/30"
          : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={item.userName} />

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-gray-800">
              {item.userName || "Unknown user"}
            </h3>

            <div className="mt-0.5 flex items-center gap-1.5">
              <RoleBadge role={item.userRole} />
              <span className="truncate text-xs text-gray-500">
                {item.institutionName || "—"}
              </span>
            </div>
          </div>
        </div>

        <WithdrawalStatus status={item.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500">Amount</p>
          <p className="mt-1 text-base font-semibold text-gray-800">
            {money(item.amount)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">UPI ID</p>
          <p className="mt-1 truncate text-gray-700">{item.upiId || "—"}</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {formatDate(item.requestedAt || item.createdAt)}
      </p>

      {canUpdate && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onUpdateStatus(item);
          }}
          className="mt-4 w-full rounded-lg bg-[#0A80F5] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#0874dd]"
        >
          Update Status
        </button>
      )}
    </article>
  );
}

export default Withdrawals;
