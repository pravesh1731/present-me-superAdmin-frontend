import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  WalletCards,
  X,
} from "lucide-react";
import { BaseUrl } from "../../Components/utils/constants";

const PAGE_SIZE = 50;

const statuses = [
  "all",
  "PENDING",
  "PROCESSING",
  "PAID",
  "REJECTED",
  "FAILED",
];

const fieldClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100";

const dateLabel = (value) => {
  const date = new Date(value);

  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
};

const statusClass = (status) =>
  ({
    PAID:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    PROCESSING:
      "bg-blue-50 text-blue-700 ring-blue-600/20",

    PENDING:
      "bg-amber-50 text-amber-700 ring-amber-600/20",

    REJECTED:
      "bg-rose-50 text-rose-700 ring-rose-600/20",

    FAILED:
      "bg-gray-100 text-gray-700 ring-gray-500/20",
  })[String(status).toUpperCase()] ||
  "bg-gray-100 text-gray-700 ring-gray-500/20";

function WithdrawalStatus({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
        status
      )}`}
    >
      {status || "—"}
    </span>
  );
}

function Withdrawals() {
  // ----------------------------------------
  // FILTERS
  // ----------------------------------------

  const [filters, setFilters] = useState({
    status: "all",
    userRole: "all",
    institutionId: "",
    search: "",
    minAmount: "",
    maxAmount: "",
    fromDate: "",
    toDate: "",
  });

  // ----------------------------------------
  // DATA
  // ----------------------------------------

  const [items, setItems] = useState([]);
  const [institutes, setInstitutes] = useState([]);

  // ----------------------------------------
  // LOADING / ERROR
  // ----------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------
  // PAGINATION
  // ----------------------------------------

  const [nextCursor, setNextCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([]);
  const [page, setPage] = useState(1);

  // ----------------------------------------
  // MORE FILTERS
  // ----------------------------------------

  const [showMoreFilters, setShowMoreFilters] =
    useState(false);

  // ----------------------------------------
  // STATUS UPDATE
  // ----------------------------------------

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState(null);

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "",
    adminNote: "",
    paymentReferenceId: "",
    failureReason: "",
  });

  // ========================================
  // LOAD WITHDRAWALS
  // ========================================

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

      const response = await axios.get(
        `${BaseUrl}/sadmin/withdrawals`,
        {
          params,
          withCredentials: true,
        }
      );

      setItems(
        Array.isArray(response.data?.data)
          ? response.data.data
          : []
      );

      setNextCursor(
        response.data?.nextCursor || null
      );
    } catch (requestError) {
      console.error(
        "Unable to load withdrawals:",
        requestError
      );

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

  // ========================================
  // LOAD INSTITUTES
  // ========================================

  useEffect(() => {
    axios
      .get(`${BaseUrl}/sadmin/verifiedInstitutes`, {
        withCredentials: true,
      })
      .then((response) => {
        setInstitutes(
          Array.isArray(response.data?.data)
            ? response.data.data
            : []
        );
      })
      .catch((requestError) => {
        console.error(
          "Unable to load institutes:",
          requestError
        );
      });
  }, []);

  // ========================================
  // LOAD WHEN FILTER CHANGES
  // ========================================

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

  // ========================================
  // SET FILTER
  // ========================================

  const setFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setFilters({
      status: "all",
      userRole: "all",
      institutionId: "",
      search: "",
      minAmount: "",
      maxAmount: "",
      fromDate: "",
      toDate: "",
    });
  };

  const hasFilters = Object.entries(filters).some(
    ([key, value]) =>
      key === "status" || key === "userRole"
        ? value !== "all"
        : Boolean(value)
  );

  // ========================================
  // NEXT PAGE
  // ========================================

  const goNext = () => {
    if (!nextCursor || loading) return;

    setCursorHistory((history) => [
      ...history,
      nextCursor,
    ]);

    setPage((value) => value + 1);

    loadWithdrawals(nextCursor);
  };

  // ========================================
  // PREVIOUS PAGE
  // ========================================

  const goPrevious = () => {
    if (!cursorHistory.length || loading) return;

    const history = cursorHistory.slice(0, -1);

    setCursorHistory(history);

    setPage((value) => value - 1);

    loadWithdrawals(history.at(-1) || null);
  };

  // ========================================
  // OPEN STATUS MODAL
  // ========================================

  const openStatusModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);

    setStatusForm({
      status: "",
      adminNote: "",
      paymentReferenceId: "",
      failureReason: "",
    });

    setError("");

    setShowStatusModal(true);
  };

  // ========================================
  // CLOSE STATUS MODAL
  // ========================================

  const closeStatusModal = () => {
    if (updatingStatus) return;

    setShowStatusModal(false);
    setSelectedWithdrawal(null);

    setStatusForm({
      status: "",
      adminNote: "",
      paymentReferenceId: "",
      failureReason: "",
    });
  };

  // ========================================
  // UPDATE WITHDRAWAL STATUS
  // ========================================

  const updateWithdrawalStatus = async () => {
    if (!selectedWithdrawal) return;

    const {
      status,
      adminNote,
      paymentReferenceId,
      failureReason,
    } = statusForm;

    // ----------------------------------------
    // STATUS REQUIRED
    // ----------------------------------------

    if (!status) {
      setError("Please select a status.");
      return;
    }

    // ----------------------------------------
    // PAID VALIDATION
    // ----------------------------------------

    if (
      status === "PAID" &&
      !paymentReferenceId.trim()
    ) {
      setError(
        "Payment reference ID is required when marking a withdrawal as PAID."
      );
      return;
    }

    // ----------------------------------------
    // REJECTED VALIDATION
    // ----------------------------------------

    if (
      status === "REJECTED" &&
      !adminNote.trim()
    ) {
      setError(
        "Admin note is required when rejecting a withdrawal."
      );
      return;
    }

    // ----------------------------------------
    // FAILED VALIDATION
    // ----------------------------------------

    if (
      status === "FAILED" &&
      !failureReason.trim()
    ) {
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

        adminNote:
          adminNote.trim() || undefined,

        paymentReferenceId:
          paymentReferenceId.trim() || undefined,

        failureReason:
          failureReason.trim() || undefined,
      };

      console.log(
        "Updating withdrawal:",
        selectedWithdrawal.withdrawalId
      );

      console.log("Payload:", payload);

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

      console.log(
        "Status update response:",
        response.data
      );

      if (response.data?.success) {
        closeStatusModal();

        /*
         * Reload current page.
         *
         * If page 1, load normally.
         * If another page, reload using current cursor.
         */
        const currentCursor =
          cursorHistory.length
            ? cursorHistory.at(-1)
            : null;

        await loadWithdrawals(currentCursor);
      }
    } catch (requestError) {
      console.error(
        "Unable to update withdrawal status:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to update withdrawal status. Please try again."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ========================================
  // MAIN UI
  // ========================================

  return (
    <div className="pb-8">

      {/* ================================== */}
      {/* PAGE HEADER */}
      {/* ================================== */}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Withdrawals
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Review withdrawal requests from students
          and teachers.
        </p>
      </div>

      {/* ================================== */}
      {/* MAIN CARD */}
      {/* ================================== */}

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">

        {/* ================================= */}
        {/* FILTER SECTION */}
        {/* ================================= */}

        <div className="space-y-4 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-6">

          {/* STATUS + SEARCH */}

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            {/* STATUS FILTER */}

            <div className="flex gap-2 overflow-x-auto pb-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    setFilter("status", status)
                  }
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                    filters.status === status
                      ? "bg-[#0A80F5] text-white shadow-sm"
                      : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {status === "all"
                    ? "All"
                    : status[0] +
                      status
                        .slice(1)
                        .toLowerCase()}
                </button>
              ))}
            </div>

            {/* SEARCH */}

            <label className="relative block w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={filters.search}
                onChange={(event) =>
                  setFilter(
                    "search",
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
                placeholder="Search ID, user, or UPI..."
              />
            </label>
          </div>

          {/* BASIC FILTERS */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* USER ROLE */}

            <select
              value={filters.userRole}
              onChange={(event) =>
                setFilter(
                  "userRole",
                  event.target.value
                )
              }
              className={fieldClass}
            >
              <option value="all">
                All users
              </option>

              <option value="student">
                Students
              </option>

              <option value="teacher">
                Teachers
              </option>
            </select>

            {/* INSTITUTION */}

            <select
              value={filters.institutionId}
              onChange={(event) =>
                setFilter(
                  "institutionId",
                  event.target.value
                )
              }
              className={fieldClass}
            >
              <option value="">
                All institutes
              </option>

              {institutes.map((item) => (
                <option
                  key={
                    item.institutionId ||
                    item.id
                  }
                  value={
                    item.institutionId ||
                    item.id
                  }
                >
                  {item.InstitutionName ||
                    item.institutionName ||
                    item.name ||
                    "Unnamed Institute"}
                </option>
              ))}
            </select>

            {/* MORE FILTERS */}

            <button
              onClick={() =>
                setShowMoreFilters(
                  (value) => !value
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />

              {showMoreFilters
                ? "Hide filters"
                : "More filters"}
            </button>

            {/* CLEAR */}

            <button
              onClick={clearFilters}
              disabled={!hasFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />

              Clear filters
            </button>
          </div>

          {/* MORE FILTERS */}

          {showMoreFilters && (
            <div className="grid grid-cols-1 gap-3 border-t border-gray-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* MIN */}

              <label className="text-xs font-medium text-gray-600">
                Minimum amount

                <input
                  min="0"
                  type="number"
                  value={filters.minAmount}
                  onChange={(event) =>
                    setFilter(
                      "minAmount",
                      event.target.value
                    )
                  }
                  className={`${fieldClass} mt-1`}
                  placeholder="₹ 0"
                />
              </label>

              {/* MAX */}

              <label className="text-xs font-medium text-gray-600">
                Maximum amount

                <input
                  min="0"
                  type="number"
                  value={filters.maxAmount}
                  onChange={(event) =>
                    setFilter(
                      "maxAmount",
                      event.target.value
                    )
                  }
                  className={`${fieldClass} mt-1`}
                  placeholder="₹ 0"
                />
              </label>

              {/* FROM DATE */}

              <label className="text-xs font-medium text-gray-600">
                From date

                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(event) =>
                    setFilter(
                      "fromDate",
                      event.target.value
                    )
                  }
                  className={`${fieldClass} mt-1`}
                />
              </label>

              {/* TO DATE */}

              <label className="text-xs font-medium text-gray-600">
                To date

                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(event) =>
                    setFilter(
                      "toDate",
                      event.target.value
                    )
                  }
                  className={`${fieldClass} mt-1`}
                />
              </label>
            </div>
          )}
        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && !showStatusModal && (
          <div className="m-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:m-6">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* DESKTOP TABLE */}
        {/* ================================= */}

        <div className="hidden overflow-x-auto md:block">

          <table className="w-full min-w-[1100px] text-left">

            <thead className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <tr>

                <th className="px-6 py-4 font-medium">
                  Withdrawal
                </th>

                <th className="px-4 py-4 font-medium">
                  User
                </th>

                <th className="px-4 py-4 font-medium">
                  UPI ID
                </th>

                <th className="px-4 py-4 font-medium">
                  Requested
                </th>

                <th className="px-4 py-4 font-medium">
                  Amount
                </th>

                <th className="px-6 py-4 font-medium">
                  Status
                </th>

                <th className="px-6 py-4 font-medium">
                  Action
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (
                <TableSkeleton />
              ) : (
                items.map((item, index) => (
                  <WithdrawalRow
                    key={
                      item.withdrawalId ||
                      index
                    }
                    item={item}
                    onUpdateStatus={
                      openStatusModal
                    }
                  />
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* ================================= */}
        {/* MOBILE */}
        {/* ================================= */}

        <div className="space-y-3 p-4 md:hidden">

          {loading
            ? Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-gray-100 p-4"
                  >
                    <div className="h-4 w-2/3 rounded bg-gray-100" />

                    <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                )
              )
            : items.map((item, index) => (
                <WithdrawalCard
                  key={
                    item.withdrawalId ||
                    index
                  }
                  item={item}
                  onUpdateStatus={
                    openStatusModal
                  }
                />
              ))}
        </div>

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {!loading && !items.length && (
          <div className="px-6 py-16 text-center">

            <WalletCards className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-3 font-medium text-gray-800">
              No withdrawals found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Try changing or clearing the
              filters.
            </p>

          </div>
        )}

        {/* ================================= */}
        {/* PAGINATION */}
        {/* ================================= */}

        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-700">
              {page}
            </span>{" "}
            · Up to {PAGE_SIZE} requests per
            page
          </p>

          <div className="flex gap-2">

            <button
              onClick={goPrevious}
              disabled={
                !cursorHistory.length ||
                loading
              }
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />

              Previous
            </button>

            <button
              onClick={goNext}
              disabled={!nextCursor || loading}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0A80F5] px-3 py-2 text-sm font-medium text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next

              <ChevronRight className="h-4 w-4" />
            </button>

          </div>
        </div>
      </section>

      {/* ==================================== */}
      {/* STATUS UPDATE MODAL */}
      {/* ==================================== */}

      {showStatusModal &&
        selectedWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
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
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* BODY */}

              <div className="space-y-4 px-6 py-5">

                {/* WITHDRAWAL INFO */}

                <div className="rounded-xl bg-gray-50 p-4">

                  <div className="grid grid-cols-2 gap-4 text-sm">

                    <div>
                      <p className="text-xs text-gray-500">
                        User
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedWithdrawal.userName ||
                          "Unknown user"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Role
                      </p>

                      <p className="mt-1 font-medium capitalize text-gray-800">
                        {selectedWithdrawal.userRole ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Institute
                      </p>

                      <p className="mt-1 font-medium text-gray-800">
                        {selectedWithdrawal.institutionName ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Amount
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        ₹
                        {Number(
                          selectedWithdrawal.amount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        UPI ID
                      </p>

                      <p className="mt-1 truncate font-medium text-gray-800">
                        {selectedWithdrawal.upiId ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Current Status
                      </p>

                      <div className="mt-1">
                        <WithdrawalStatus
                          status={
                            selectedWithdrawal.status
                          }
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* MODAL ERROR */}

                {error && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {/* STATUS */}

                <label className="block text-sm font-medium text-gray-600">
                  New Status

                  <select
                    value={statusForm.status}
                    onChange={(event) =>
                      setStatusForm(
                        (current) => ({
                          ...current,
                          status:
                            event.target
                              .value,
                          paymentReferenceId:
                            "",
                          failureReason:
                            "",
                        })
                      )
                    }
                    className={`${fieldClass} mt-1`}
                  >
                    <option value="">
                      Select status
                    </option>

                    {selectedWithdrawal.status ===
                      "PENDING" && (
                      <>
                        <option value="PROCESSING">
                          Processing
                        </option>

                        <option value="REJECTED">
                          Rejected
                        </option>
                      </>
                    )}

                    {selectedWithdrawal.status ===
                      "PROCESSING" && (
                      <>
                        <option value="PAID">
                          Paid
                        </option>

                        <option value="FAILED">
                          Failed
                        </option>
                      </>
                    )}
                  </select>
                </label>

                {/* PAYMENT REFERENCE */}

                {statusForm.status ===
                  "PAID" && (
                  <label className="block text-sm font-medium text-gray-600">
                    Payment Reference ID
                    <span className="text-rose-500">
                      {" "}
                      *
                    </span>

                    <input
                      type="text"
                      value={
                        statusForm.paymentReferenceId
                      }
                      onChange={(event) =>
                        setStatusForm(
                          (current) => ({
                            ...current,
                            paymentReferenceId:
                              event.target
                                .value,
                          })
                        )
                      }
                      className={`${fieldClass} mt-1`}
                      placeholder="e.g. UPI-TXN-987654"
                    />
                  </label>
                )}

                {/* FAILURE REASON */}

                {statusForm.status ===
                  "FAILED" && (
                  <label className="block text-sm font-medium text-gray-600">
                    Failure Reason
                    <span className="text-rose-500">
                      {" "}
                      *
                    </span>

                    <textarea
                      value={
                        statusForm.failureReason
                      }
                      onChange={(event) =>
                        setStatusForm(
                          (current) => ({
                            ...current,
                            failureReason:
                              event.target
                                .value,
                          })
                        )
                      }
                      className={`${fieldClass} mt-1 min-h-[90px] resize-none`}
                      placeholder="Enter reason for payment failure"
                    />
                  </label>
                )}

                {/* ADMIN NOTE */}

                {(statusForm.status ===
                  "PROCESSING" ||
                  statusForm.status ===
                    "PAID" ||
                  statusForm.status ===
                    "REJECTED" ||
                  statusForm.status ===
                    "FAILED") && (
                  <label className="block text-sm font-medium text-gray-600">
                    Admin Note

                    {statusForm.status ===
                      "REJECTED" && (
                      <span className="text-rose-500">
                        {" "}
                        *
                      </span>
                    )}

                    <textarea
                      value={
                        statusForm.adminNote
                      }
                      onChange={(event) =>
                        setStatusForm(
                          (current) => ({
                            ...current,
                            adminNote:
                              event.target
                                .value,
                          })
                        )
                      }
                      className={`${fieldClass} mt-1 min-h-[90px] resize-none`}
                      placeholder="Enter admin note"
                    />
                  </label>
                )}
              </div>

              {/* FOOTER */}

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
                  disabled={
                    updatingStatus ||
                    !statusForm.status
                  }
                  className="rounded-lg bg-[#0A80F5] px-4 py-2 text-sm font-medium text-white hover:bg-[#0874dd] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Update Status"}
                </button>

              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// ========================================
// TABLE SKELETON
// ========================================

function TableSkeleton() {
  return Array.from({ length: 6 }).map(
    (_, index) => (
      <tr
        key={index}
        className="animate-pulse"
      >
        <td className="px-6 py-5">
          <div className="h-4 w-36 rounded bg-gray-100" />
        </td>

        <td className="px-4 py-5">
          <div className="h-4 w-28 rounded bg-gray-100" />
        </td>

        <td className="px-4 py-5">
          <div className="h-4 w-28 rounded bg-gray-100" />
        </td>

        <td className="px-4 py-5">
          <div className="h-4 w-24 rounded bg-gray-100" />
        </td>

        <td className="px-4 py-5">
          <div className="h-4 w-16 rounded bg-gray-100" />
        </td>

        <td className="px-6 py-5">
          <div className="h-6 w-20 rounded-full bg-gray-100" />
        </td>

        <td className="px-6 py-5">
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </td>
      </tr>
    )
  );
}

// ========================================
// DESKTOP ROW
// ========================================

function WithdrawalRow({
  item,
  onUpdateStatus,
}) {
  const canUpdate =
    item.status === "PENDING" ||
    item.status === "PROCESSING";

  return (
    <tr className="text-sm hover:bg-gray-50/80">

      {/* WITHDRAWAL */}

      <td className="px-6 py-4">
        <p className="font-medium text-gray-800">
          {item.withdrawalId || "—"}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {item.institutionName || "—"}
        </p>
      </td>

      {/* USER */}

      <td className="px-4 py-4">
        <p className="text-gray-700">
          {item.userName || "Unknown user"}
        </p>

        <p className="mt-0.5 text-xs text-gray-500">
          {item.userRole || "—"}

          {item.userEmail
            ? ` · ${item.userEmail}`
            : ""}
        </p>
      </td>

      {/* UPI */}

      <td className="px-4 py-4 text-gray-600">
        {item.upiId || "—"}
      </td>

      {/* REQUESTED */}

      <td className="px-4 py-4 text-gray-600">
        {dateLabel(
          item.requestedAt ||
            item.createdAt
        )}
      </td>

      {/* AMOUNT */}

      <td className="px-4 py-4 font-semibold text-gray-800">
        ₹
        {Number(
          item.amount || 0
        ).toLocaleString("en-IN")}
      </td>

      {/* STATUS */}

      <td className="px-6 py-4">
        <WithdrawalStatus
          status={item.status}
        />
      </td>

      {/* ACTION */}

      <td className="px-6 py-4">
        {canUpdate ? (
          <button
            onClick={() =>
              onUpdateStatus(item)
            }
            className="rounded-lg bg-[#0A80F5] px-3 py-2 text-xs font-medium text-white hover:bg-[#0874dd]"
          >
            Update
          </button>
        ) : (
          <span className="text-xs text-gray-400">
            Completed
          </span>
        )}
      </td>
    </tr>
  );
}

// ========================================
// MOBILE CARD
// ========================================

function WithdrawalCard({
  item,
  onUpdateStatus,
}) {
  const canUpdate =
    item.status === "PENDING" ||
    item.status === "PROCESSING";

  return (
    <article className="rounded-xl border border-gray-100 p-4">

      <div className="flex items-start justify-between gap-3">

        <div>
          <h3 className="font-semibold text-gray-800">
            {item.userName ||
              "Unknown user"}
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            {item.withdrawalId || "—"}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {item.institutionName || "—"}
          </p>
        </div>

        <WithdrawalStatus
          status={item.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

        <div>
          <p className="text-xs text-gray-500">
            Amount
          </p>

          <p className="mt-1 font-semibold text-gray-800">
            ₹
            {Number(
              item.amount || 0
            ).toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            UPI ID
          </p>

          <p className="mt-1 truncate text-gray-700">
            {item.upiId || "—"}
          </p>
        </div>

      </div>

      <p className="mt-3 text-xs text-gray-500">
        {item.userRole || "—"} ·{" "}
        {dateLabel(
          item.requestedAt ||
            item.createdAt
        )}
      </p>

      {canUpdate && (
        <button
          onClick={() =>
            onUpdateStatus(item)
          }
          className="mt-4 w-full rounded-lg bg-[#0A80F5] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#0874dd]"
        >
          Update Status
        </button>
      )}
    </article>
  );
}

export default Withdrawals;