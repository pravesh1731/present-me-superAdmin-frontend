import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowUpDown,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileDown,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { BaseUrl } from "../utils/constants";
import { downloadCsv } from "../utils/format";
import useToast from "../utils/useToast";
import { Toast } from "../common/ui";
import { PersonDrawer } from "../institute/PeoplePanels";

const PAGE_SIZES = [25, 50, 100];
const selectClass =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#0A80F5]";
const tableHead = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500";

// One list page for teachers AND students: server-side search / filter / sort / pagination,
// a details drawer, and CSV export. The two pages only differ by the `config` they pass in.
export default function PeopleListPage({ config }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [toast, notify] = useToast();

  const [tab, setTab] = useState(searchParams.get(config.statusParam) || "all");
  const [institutionId, setInstitutionId] = useState(searchParams.get("institutionId") || "");
  // deep links (command palette, dashboard): ?search=…&status=…&institutionId=…
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [search, setSearch] = useState((searchParams.get("search") || "").trim());
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [result, setResult] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const searchRef = useRef(null);

  const buildParams = (extra = {}) => ({
    page,
    pageSize,
    sort,
    ...(search ? { search } : {}),
    ...(institutionId ? { institutionId } : {}),
    ...(tab !== "all" ? { [config.statusParam]: tab } : {}),
    ...extra,
  });

  // wait for the user to stop typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    axios
      .get(`${BaseUrl}/sadmin/verifiedInstitutes`, { withCredentials: true })
      .then((response) =>
        setInstitutes(Array.isArray(response.data?.data) ? response.data.data : [])
      )
      .catch((err) => console.error("Unable to load institutes:", err));
  }, []);

  // "/" jumps to search
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // load whenever a filter / page changes; ignore answers that arrive out of order
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError("");

    axios
      .get(`${BaseUrl}${config.endpoint}`, {
        params: {
          page,
          pageSize,
          sort,
          ...(search ? { search } : {}),
          ...(institutionId ? { institutionId } : {}),
          ...(tab !== "all" ? { [config.statusParam]: tab } : {}),
          ...(reloadKey ? { refresh: 1 } : {}),
        },
        withCredentials: true,
      })
      .then((response) => {
        if (!current) return;
        setResult(response.data);
        // the server clamps out-of-range pages; follow it
        if (response.data?.page && response.data.page !== page) setPage(response.data.page);
      })
      .catch((err) => {
        if (!current) return;
        console.error(`Unable to load ${config.kind}:`, err);
        setError(err.response?.data?.message || `Unable to load ${config.kind}. Please try again.`);
      })
      .finally(() => current && setLoading(false));

    return () => {
      current = false;
    };
  }, [config, tab, institutionId, search, sort, page, pageSize, reloadKey]);

  const rows = result?.data || [];
  const summary = result?.summary || {};
  const total = result?.total || 0;
  const totalPages = result?.totalPages || 1;
  const first = total ? (result.page - 1) * result.pageSize + 1 : 0;
  const last = Math.min(total, (result?.page || 1) * (result?.pageSize || pageSize));

  const filtersActive = tab !== "all" || institutionId || search;
  const resetAll = () => {
    setTab("all");
    setInstitutionId("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const exportPage = () => {
    downloadCsv(config.kind, config.csvColumns, rows);
    notify(`Exported ${rows.length} ${config.kind} to CSV`);
  };

  // every row that matches the current filters, 100 at a time
  const exportAll = async () => {
    setExporting(true);
    try {
      const everything = [];
      let current = 1;
      let pages = 1;
      do {
        const response = await axios.get(`${BaseUrl}${config.endpoint}`, {
          params: buildParams({ page: current, pageSize: 100 }),
          withCredentials: true,
        });
        everything.push(...(response.data?.data || []));
        pages = response.data?.totalPages || 1;
        current += 1;
      } while (current <= pages);

      downloadCsv(config.kind, config.csvColumns, everything);
      notify(`Exported all ${everything.length} ${config.kind} to CSV`);
    } catch (err) {
      console.error("Export failed:", err);
      notify("Export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const openInstitute = (row) =>
    row.institutionId && row.institutionName !== "Unknown institution"
      ? navigate(`/superadmin/verified-institutes/${row.institutionId}`)
      : null;

  return (
    <div className="pb-8">
      {/* header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{config.title}</h2>
          <p className="mt-1 text-sm text-gray-500">{config.subtitle}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportAll}
            disabled={exporting || loading || !total}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "Exporting…" : `Export all${total ? ` (${total.toLocaleString("en-IN")})` : ""}`}
          </button>
          <button
            onClick={exportPage}
            disabled={loading || !rows.length}
            className="hidden rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 sm:block"
          >
            This page
          </button>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            aria-label="Refresh list"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        {/* toolbar */}
        <div className="space-y-3 border-b border-gray-100 bg-gray-50/70 p-4 sm:p-6">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={`${config.title} filter`}>
            {config.tabs.map((item) => (
              <button
                key={item.value}
                role="tab"
                aria-selected={tab === item.value}
                onClick={() => {
                  setTab(item.value);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === item.value
                    ? "bg-[#0A80F5] text-white shadow-sm"
                    : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
                }`}
              >
                {item.label}
                <span
                  className={`rounded-full px-1.5 text-[11px] font-semibold ${
                    tab === item.value ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {result ? (summary[item.summaryKey] ?? 0).toLocaleString("en-IN") : "–"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
            <label className="relative block w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={config.searchPlaceholder}
                aria-label={config.searchPlaceholder}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-[#0A80F5] focus:ring-2 focus:ring-blue-100"
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

            <select
              value={institutionId}
              onChange={(event) => {
                setInstitutionId(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by institute"
              className={`${selectClass} lg:max-w-56`}
            >
              <option value="">All institutes</option>
              {institutes.map((item) => (
                <option key={item.institutionId} value={item.institutionId}>
                  {item.InstitutionName}
                </option>
              ))}
            </select>

            <label className="relative block">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                aria-label="Sort"
                className={`${selectClass} w-full pl-9`}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>

            {filtersActive && (
              <button
                onClick={resetAll}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:m-6">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setReloadKey((value) => value + 1)} className="font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {/* phones: one card per person */}
        <div className={`divide-y divide-gray-100 md:hidden ${loading && result ? "opacity-50" : ""}`}>
          {!result && loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse space-y-3 p-4">
                  <div className="h-10 w-2/3 rounded bg-gray-100" />
                  <div className="h-4 w-1/2 rounded bg-gray-100" />
                </div>
              ))
            : rows.map((row) => (
                <button
                  key={row[config.idKey] || row.emailId}
                  onClick={() => setSelected(row)}
                  className="block w-full p-4 text-left transition-colors hover:bg-blue-50/40"
                >
                  {config.columns[0].render(row, { openInstitute })}
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                    {config.columns.slice(1).map((column) => (
                      <div key={column.label} className="min-w-0">
                        <dt className="text-[11px] uppercase tracking-wide text-gray-400">{column.label}</dt>
                        <dd className="mt-0.5 min-w-0 text-sm">{column.render(row, { openInstitute })}</dd>
                      </div>
                    ))}
                  </dl>
                </button>
              ))}
        </div>

        {/* tablets and up: table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.label} className={tableHead}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-100 transition-opacity ${loading && result ? "opacity-50" : ""}`}>
              {!result && loading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {config.columns.map((column) => (
                        <td key={column.label} className="px-4 py-4">
                          <div className="h-4 w-24 rounded bg-gray-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={row[config.idKey] || row.emailId}
                      onClick={() => setSelected(row)}
                      className="cursor-pointer transition-colors hover:bg-blue-50/40"
                    >
                      {config.columns.map((column) => (
                        <td key={column.label} className="px-4 py-3">
                          {column.render(row, { openInstitute })}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && !rows.length && (
          <div className="px-6 py-16 text-center">
            <config.EmptyIcon className="mx-auto h-10 w-10 text-gray-300" />
            <h3 className="mt-3 font-medium text-gray-800">{config.emptyTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtersActive ? "Nothing matches your filters." : config.emptyText}
            </p>
            {filtersActive && (
              <button
                onClick={resetAll}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="h-4 w-4" /> Reset filters
              </button>
            )}
          </div>
        )}

        {/* pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>
              {total ? (
                <>
                  <span className="font-medium text-gray-700">
                    {first.toLocaleString("en-IN")}–{last.toLocaleString("en-IN")}
                  </span>{" "}
                  of {total.toLocaleString("en-IN")}
                </>
              ) : (
                "0 results"
              )}
            </span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
              className={`${selectClass} py-1.5`}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {[
              { Icon: ChevronsLeft, label: "First page", go: () => setPage(1), disabled: page <= 1 },
              { Icon: ChevronLeft, label: "Previous page", go: () => setPage((value) => value - 1), disabled: page <= 1 },
            ].map((button) => (
              <button
                key={button.label}
                onClick={button.go}
                disabled={button.disabled || loading}
                aria-label={button.label}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <button.Icon className="h-4 w-4" />
              </button>
            ))}
            <span className="px-3 text-sm text-gray-600">
              Page <span className="font-medium text-gray-800">{result?.page || page}</span> of {totalPages}
            </span>
            {[
              { Icon: ChevronRight, label: "Next page", go: () => setPage((value) => value + 1), disabled: page >= totalPages },
              { Icon: ChevronsRight, label: "Last page", go: () => setPage(totalPages), disabled: page >= totalPages },
            ].map((button) => (
              <button
                key={button.label}
                onClick={button.go}
                disabled={button.disabled || loading}
                aria-label={button.label}
                className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <button.Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected && (
        <PersonDrawer
          title={config.personLabel}
          person={selected}
          knownKeys={config.knownKeys}
          onClose={() => setSelected(null)}
          onCopy={notify}
          rows={config.drawerRows(selected, { openInstitute })}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
