import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  RefreshCw,
  Sparkles,
  Table2,
  BarChart3,
  Users,
  Wallet,
} from "lucide-react";
import { loadOverview } from "../../Components/utils/overview";
import { agoLabel, daysSince, formatDate, fullName, money } from "../../Components/utils/format";
import AnimatedNumber from "../../Components/common/AnimatedNumber";
import Sparkline from "../../Components/common/Sparkline";

const COUNT = (value) => (Number(value) || 0).toLocaleString("en-IN");

// Categorical colours validated for 3 series (colour-blind safe, fixed order: one per entity)
const SERIES = [
  { key: "students", label: "Students", color: "#1baf7a" },
  { key: "teachers", label: "Teachers", color: "#eb6834" },
  { key: "institutions", label: "Institutes", color: "#2a78d6" },
];

const monthLabel = (key, long = false) => {
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-IN", {
    month: "short",
    ...(long ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
};

const updatedLabel = (ms, now) => {
  if (!ms) return "";
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  return minutes < 60 ? `${minutes} min ago` : `${Math.round(minutes / 60)} h ago`;
};

// ---------------------------------------------------------------------------
// building blocks
// ---------------------------------------------------------------------------

function AttentionCard({ icon, tone, title, count, hint, to, loading }) {
  const navigate = useNavigate();
  const idle = !loading && count === 0;

  return (
    <button
      onClick={() => navigate(to)}
      className="group flex w-full flex-col rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-[#0A80F5]/40 focus-visible:outline-2 focus-visible:outline-[#0A80F5]"
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-xl p-2.5 ${idle ? "bg-gray-100 text-gray-400" : tone}`}>
          {icon}
        </span>
        <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#0A80F5]" />
      </div>
      {loading ? (
        <div className="mt-4 h-9 w-16 animate-pulse rounded bg-gray-100" />
      ) : (
        <p className="mt-4 text-3xl font-semibold text-gray-800"><AnimatedNumber value={count} /></p>
      )}
      <p className="mt-1 text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-0.5 text-xs text-gray-400">{loading ? " " : idle ? "Nothing waiting" : hint}</p>
    </button>
  );
}

function Kpi({ icon, tone, label, value, hint, to, loading, trend, trendColor }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-[#0A80F5]/40"
    >
      <span className={`rounded-xl p-2.5 ${tone}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <div className="flex items-end justify-between gap-2">
          {loading ? (
            <div className="mt-1.5 h-6 w-16 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="truncate text-xl font-semibold text-gray-800">{value}</p>
          )}
          {trend && !loading && (
            <span className="hidden sm:block" title="New per month (last 5 full months)">
              <Sparkline values={trend} color={trendColor} width={64} height={24} />
            </span>
          )}
        </div>
        {hint && !loading && <p className="truncate text-xs text-gray-400">{hint}</p>}
      </div>
    </button>
  );
}

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// sign-ups chart (one series at a time: counts differ by orders of magnitude, so no shared axis)
// ---------------------------------------------------------------------------

function SignupsChart({ signups, loading }) {
  const [seriesKey, setSeriesKey] = useState("students");
  const [view, setView] = useState("chart");
  const [hover, setHover] = useState(null);

  const series = SERIES.find((item) => item.key === seriesKey);
  const width = 600;
  const height = 230;
  const pad = { top: 28, right: 12, bottom: 32, left: 34 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const values = signups.map((item) => item[seriesKey]);
  const max = Math.max(4, ...values);
  const top = Math.ceil(max / 4) * 4; // round the axis to a friendly multiple of 4
  const band = signups.length ? innerW / signups.length : innerW;
  const barW = Math.min(36, band * 0.5);
  const ticks = [0, top / 2, top];
  const y = (value) => pad.top + innerH - (value / top) * innerH;
  const total = values.reduce((sum, value) => sum + value, 0);

  return (
    <Panel
      title="New sign-ups"
      subtitle={`Last 6 months · ${COUNT(total)} new ${series.label.toLowerCase()}`}
      action={
        <div className="flex rounded-lg bg-gray-100 p-0.5" role="group" aria-label="Chart or table">
          {[
            ["chart", <BarChart3 key="c" className="h-3.5 w-3.5" />, "Chart"],
            ["table", <Table2 key="t" className="h-3.5 w-3.5" />, "Table"],
          ].map(([value, icon, label]) => (
            <button
              key={value}
              onClick={() => setView(value)}
              aria-pressed={view === value}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                view === value ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Series">
        {SERIES.map((item) => (
          <button
            key={item.key}
            role="tab"
            aria-selected={seriesKey === item.key}
            onClick={() => setSeriesKey(item.key)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              seriesKey === item.key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-[230px] animate-pulse rounded-xl bg-gray-100" />
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/70 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">Month</th>
                {SERIES.map((item) => (
                  <th key={item.key} className="px-4 py-2.5 text-right font-medium">
                    {item.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {signups.map((row) => (
                <tr key={row.month}>
                  <td className="px-4 py-2.5 text-gray-700">{monthLabel(row.month, true)}</td>
                  {SERIES.map((item) => (
                    <td key={item.key} className="px-4 py-2.5 text-right tabular-nums text-gray-700">
                      {COUNT(row[item.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={`${series.label} sign-ups per month for the last 6 months`}
            onMouseLeave={() => setHover(null)}
          >
            {/* recessive grid + axis */}
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={tick === 0 ? "#d1d5db" : "#f0f1f3"}
                  strokeWidth="1"
                />
                <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                  {tick}
                </text>
              </g>
            ))}

            {signups.map((row, index) => {
              const value = row[seriesKey];
              const x = pad.left + band * index + (band - barW) / 2;
              const barH = Math.max(value ? 3 : 0, innerH - (y(value) - pad.top));
              const active = hover === index;

              return (
                <g key={row.month}>
                  {/* wide invisible hit target */}
                  <rect
                    x={pad.left + band * index}
                    y={pad.top}
                    width={band}
                    height={innerH + pad.bottom}
                    fill="transparent"
                    onMouseEnter={() => setHover(index)}
                    onFocus={() => setHover(index)}
                    onBlur={() => setHover(null)}
                    tabIndex={0}
                    aria-label={`${monthLabel(row.month, true)}: ${value} ${series.label.toLowerCase()}`}
                  />
                  {value > 0 && (
                    <path
                      d={`M${x},${pad.top + innerH} V${pad.top + innerH - barH + 4} a4,4 0 0 1 4,-4 h${barW - 8} a4,4 0 0 1 4,4 V${pad.top + innerH} Z`}
                      fill={series.color}
                      opacity={hover === null || active ? 1 : 0.45}
                      className="transition-opacity"
                      pointerEvents="none"
                    />
                  )}
                  <text
                    x={x + barW / 2}
                    y={pad.top + innerH - barH - 6}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight={active ? 700 : 500}
                    fill="#4b5563"
                    pointerEvents="none"
                  >
                    {value}
                  </text>
                  <text
                    x={x + barW / 2}
                    y={height - 10}
                    textAnchor="middle"
                    fontSize="11"
                    fill={active ? "#111827" : "#6b7280"}
                    pointerEvents="none"
                  >
                    {monthLabel(row.month)}
                  </text>
                </g>
              );
            })}
          </svg>

          {hover !== null && signups[hover] && (
            <div
              className="pointer-events-none absolute top-0 z-10 w-44 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg"
              style={{
                left: `${Math.min(
                  Math.max(((pad.left + band * hover + band / 2) / width) * 100, 14),
                  86
                )}%`,
                transform: "translateX(-50%)",
              }}
            >
              <p className="mb-1 font-semibold">{monthLabel(signups[hover].month, true)}</p>
              {SERIES.map((item) => (
                <p key={item.key} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-gray-300">
                    <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                  <span className="tabular-nums">{COUNT(signups[hover][item.key])}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// status pipeline (stacked bar + labelled legend — status colours always carry an icon + label)
// ---------------------------------------------------------------------------

const TONES = {
  amber: { bar: "#f59e0b", text: "text-amber-600", icon: Clock },
  blue: { bar: "#0A80F5", text: "text-blue-600", icon: RefreshCw },
  green: { bar: "#059669", text: "text-emerald-600", icon: CircleCheck },
  red: { bar: "#e11d48", text: "text-rose-600", icon: CircleX },
};

function Pipeline({ title, to, parts, loading }) {
  const navigate = useNavigate();
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <button
          onClick={() => navigate(to)}
          className="text-xs font-medium text-[#0A80F5] hover:underline"
        >
          Open
        </button>
      </div>

      {loading ? (
        <div className="h-3 animate-pulse rounded-full bg-gray-100" />
      ) : total === 0 ? (
        <div className="h-3 rounded-full bg-gray-100" />
      ) : (
        <div className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-gray-100">
          {parts
            .filter((part) => part.value > 0)
            .map((part) => (
              <div
                key={part.label}
                title={`${part.label}: ${part.value}`}
                style={{ width: `${(part.value / total) * 100}%`, background: TONES[part.tone].bar }}
              />
            ))}
        </div>
      )}

      <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {parts.map((part) => {
          const Icon = TONES[part.tone].icon;
          return (
            <li key={part.label}>
              <button
                onClick={() => navigate(part.to || to)}
                className="flex w-full items-center gap-1.5 rounded text-left text-xs text-gray-600 hover:text-gray-900"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${TONES[part.tone].text}`} />
                <span className="truncate">{part.label}</span>
                <span className="ml-auto font-semibold tabular-nums text-gray-800">
                  {loading ? "–" : COUNT(part.value)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// latest activity
// ---------------------------------------------------------------------------

const noteState = (status) => {
  const value = String(status || "pending").toLowerCase();
  return value === "verified" ? "approved" : value;
};
const statusPill = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  PENDING: "bg-amber-50 text-amber-700",
  PROCESSING: "bg-blue-50 text-blue-700",
  PAID: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  FAILED: "bg-gray-100 text-gray-700",
};
const statusWord = (status) => {
  const value = String(status || "");
  return value === "approved" ? "Verified" : value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

function ActivityRow({ icon, title, subtitle, status, when, onClick }) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-1 py-3 text-left ${
        onClick ? "rounded-lg transition hover:bg-gray-50" : ""
      }`}
    >
      <span className="rounded-lg bg-blue-50 p-2 text-[#0A80F5]">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{title}</p>
        <p className="truncate text-xs text-gray-500">{subtitle}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusPill[status] || "bg-gray-100 text-gray-600"}`}>
          {statusWord(status)}
        </span>
        <span className="text-[11px] text-gray-400">{agoLabel(when)}</span>
      </div>
    </Tag>
  );
}

function LatestActivity({ recent, loading }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("institutions");

  const tabs = [
    ["institutions", "Institutes", recent?.institutions],
    ["notes", "PYQ & Notes", recent?.notes],
    ["withdrawals", "Withdrawals", recent?.withdrawals],
  ];
  const rows = recent?.[tab] || [];

  return (
    <Panel title="Latest activity" subtitle="Click an item to open it">
      <div className="mb-3 flex gap-1 border-b border-gray-100" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === key
                ? "border-[#0A80F5] text-[#0A80F5]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">Nothing here yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {tab === "institutions" &&
            rows.map((item) => (
              <ActivityRow
                key={item.institutionId}
                icon={<Building2 className="h-4 w-4" />}
                title={item.InstitutionName}
                subtitle={`Registered ${formatDate(item.createdAt)}`}
                status={String(item.status || "pending").toLowerCase()}
                when={item.createdAt}
                onClick={
                  item.status === "rejected"
                    ? undefined
                    : () =>
                        navigate(
                          item.status === "verified"
                            ? `/superadmin/verified-institutes/${item.institutionId}`
                            : `/superadmin/pending-institutes/${item.institutionId}`
                        )
                }
              />
            ))}

          {tab === "notes" &&
            rows.map((item) => (
              <ActivityRow
                key={item.noteId}
                icon={<FileText className="h-4 w-4" />}
                title={item.fileName || "Untitled document"}
                subtitle={`${item.type || "Note"} · ${item.institutionName || "Unknown institute"}`}
                status={noteState(item.status)}
                when={item.createdAt}
                onClick={() =>
                  navigate(
                    `/superadmin/pyq-notes?type=${item.type === "Notes" ? "Notes" : "PYQ"}&status=${noteState(item.status)}`
                  )
                }
              />
            ))}

          {tab === "withdrawals" &&
            rows.map((item) => (
              <ActivityRow
                key={item.withdrawalId}
                icon={<Wallet className="h-4 w-4" />}
                title={`${money(item.amount)} · ${item.userName || "Unknown user"}`}
                subtitle={`${item.userRole || "user"} · ${item.institutionName || "Unknown institute"}`}
                status={item.status}
                when={item.requestedAt}
                onClick={() => navigate(`/superadmin/withdrawals?status=${item.status}`)}
              />
            ))}
        </div>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// recently joined (institutes + teachers + students in one feed)
// ---------------------------------------------------------------------------

const JOIN_KINDS = {
  institutions: { label: "Institute", color: "#2a78d6", tint: "bg-blue-50 text-blue-700" },
  teachers: { label: "Teacher", color: "#eb6834", tint: "bg-orange-50 text-orange-700" },
  students: { label: "Student", color: "#1baf7a", tint: "bg-emerald-50 text-emerald-700" },
};

function RecentlyJoined({ recent, loading }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");

  const feed = useMemo(() => {
    const items = [
      ...(recent?.institutions || []).map((item) => ({
        kind: "institutions",
        id: item.institutionId,
        name: item.InstitutionName,
        subtitle: "New institute registration",
        badge: statusWord(String(item.status || "pending").toLowerCase()),
        badgeKey: String(item.status || "pending").toLowerCase(),
        when: item.createdAt,
        to:
          item.status === "rejected"
            ? null
            : item.status === "verified"
              ? `/superadmin/verified-institutes/${item.institutionId}`
              : `/superadmin/pending-institutes/${item.institutionId}`,
      })),
      ...(recent?.teachers || []).map((item) => ({
        kind: "teachers",
        id: item.teacherId,
        name: fullName(item),
        subtitle: `${item.institutionName || "Unknown institute"}${item.emailId ? ` · ${item.emailId}` : ""}`,
        badge: statusWord(String(item.status || "pending").toLowerCase()),
        badgeKey: String(item.status || "pending").toLowerCase(),
        when: item.createdAt,
        to: `/superadmin/teachers?search=${encodeURIComponent(item.emailId || fullName(item))}`,
      })),
      ...(recent?.students || []).map((item) => ({
        kind: "students",
        id: item.studentId,
        name: fullName(item),
        subtitle: [item.institutionName || "Unknown institute", item.rollNo, item.semester]
          .filter(Boolean)
          .join(" · "),
        badge: item.emailVerified ? "Email verified" : "Not verified",
        badgeKey: item.emailVerified ? "approved" : "pending",
        when: item.createdAt,
        to: `/superadmin/students?search=${encodeURIComponent(item.emailId || fullName(item))}`,
      })),
    ];

    return items.sort((a, b) => new Date(b.when || 0) - new Date(a.when || 0));
  }, [recent]);

  const shown = (filter === "all" ? feed : feed.filter((item) => item.kind === filter)).slice(0, 7);
  const chips = [
    ["all", "All"],
    ["institutions", "Institutes"],
    ["teachers", "Teachers"],
    ["students", "Students"],
  ];

  return (
    <Panel title="Recently joined" subtitle="The newest institutes, teachers and students">
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="Filter recently joined">
        {chips.map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === key
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {key !== "all" && (
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: JOIN_KINDS[key].color }} />
            )}
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No one has joined yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {shown.map((item) => {
            const kind = JOIN_KINDS[item.kind];
            const fresh = (daysSince(item.when) ?? 99) < 3;
            const Row = item.to ? "button" : "div";

            return (
              <li key={`${item.kind}-${item.id}`}>
                <Row
                  onClick={item.to ? () => navigate(item.to) : undefined}
                  className={`flex w-full items-center gap-3 px-1 py-3 text-left ${
                    item.to ? "rounded-lg transition hover:bg-gray-50" : ""
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ background: kind.color }}
                    aria-hidden="true"
                  >
                    {item.kind === "institutions" ? <Building2 className="h-4 w-4" /> : (item.name || "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium text-gray-800">
                      <span className="truncate">{item.name || "Unnamed"}</span>
                      {fresh && (
                        <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-rose-600">
                          New
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-gray-500">{item.subtitle}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${kind.tint}`}>{kind.label}</span>
                    <span className="text-[11px] text-gray-400">{agoLabel(item.when)}</span>
                  </div>
                </Row>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// ---------------------------------------------------------------------------
// page
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading, error, loadedAt } = useSelector((state) => state.overview);
  const adminName = useSelector((state) => state.user?.admin?.firstName);
  const [now, setNow] = useState(Date.now());

  // keep "updated 2 min ago" honest
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // numbers are normally already loaded by the sidebar; fetch if we landed here first
  useEffect(() => {
    if (!data) loadOverview(dispatch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => loadOverview(dispatch, { force: true });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = !data && loading; // very first load: show skeletons

  const inst = data?.institutions;
  const notes = data?.notes;
  const wd = data?.withdrawals;
  const teachers = data?.teachers;
  const students = data?.students;
  const openWithdrawals = (wd?.pending || 0) + (wd?.processing || 0);
  const allClear = data && !inst.pending && !notes.pending && !openWithdrawals;
  const totalWaiting = (inst?.pending || 0) + (notes?.pending || 0) + openWithdrawals;
  // jump straight to the biggest queue
  const nextQueue = [
    { label: "institutes", count: inst?.pending || 0, to: "/superadmin/pending-institutes" },
    { label: "PYQ & Notes", count: notes?.pending || 0, to: "/superadmin/pyq-notes?status=pending" },
    { label: "withdrawals", count: openWithdrawals, to: "/superadmin/withdrawals?status=PENDING" },
  ].sort((a, b) => b.count - a.count)[0];

  if (!data && error) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
        <CircleAlert className="mx-auto h-10 w-10 text-rose-400" />
        <h3 className="mt-3 font-semibold text-gray-800">Couldn&apos;t load the dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          onClick={refresh}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0A80F5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0874dd]"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#0BCCEB] to-[#0A80F5] p-6 text-white shadow-lg shadow-[#0A80F5]/20 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm text-white/80">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              {greeting}
              {adminName ? `, ${adminName}` : ""}
            </h2>
            <p className="mt-2 text-sm text-white/90">
              {first ? (
                "Checking what needs your attention…"
              ) : allClear ? (
                "Everything is reviewed — nice work. New requests will show up here."
              ) : (
                <>
                  <strong>{totalWaiting}</strong> {totalWaiting === 1 ? "item is" : "items are"} waiting for you:{" "}
                  {[
                    inst?.pending ? `${inst.pending} institute${inst.pending === 1 ? "" : "s"}` : null,
                    notes?.pending ? `${notes.pending} PYQ/note${notes.pending === 1 ? "" : "s"}` : null,
                    openWithdrawals ? `${openWithdrawals} withdrawal${openWithdrawals === 1 ? "" : "s"}` : null,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  .
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!first && !allClear && (
                <button
                  onClick={() => navigate(nextQueue.to)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0A80F5] shadow-sm transition hover:shadow-md active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" /> Start with {nextQueue.label}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-sm font-medium text-white ring-1 ring-inset ring-white/30 transition hover:bg-white/25 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              {loadedAt && (
                <span className="text-xs text-white/70">Updated {updatedLabel(loadedAt, now)}</span>
              )}
            </div>
          </div>

          {/* mini totals */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:min-w-[22rem]">
            {[
              ["Institutes", inst?.verified],
              ["Teachers", teachers?.total],
              ["Students", students?.total],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-white/15 px-3 py-3 text-center ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <p className="text-xl font-semibold sm:text-2xl">
                  {first ? "–" : <AnimatedNumber value={value} />}
                </p>
                <p className="text-xs text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {data && error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <CircleAlert className="h-4 w-4 shrink-0" />
          Couldn&apos;t refresh — showing the last numbers we loaded.
        </div>
      )}

      {/* needs attention */}
      <section aria-label="Needs your attention">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Needs your attention</h3>
          {allClear && !first && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CircleCheck className="h-4 w-4" /> You&apos;re all caught up
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AttentionCard
            icon={<Building2 className="h-5 w-5" />}
            tone="bg-amber-50 text-amber-600"
            title="Institutes to review"
            count={inst?.pending || 0}
            hint={inst?.oldestPendingAt ? `Oldest waiting ${agoLabel(inst.oldestPendingAt).toLowerCase()}` : "Registration requests"}
            to="/superadmin/pending-institutes"
            loading={first}
          />
          <AttentionCard
            icon={<FileText className="h-5 w-5" />}
            tone="bg-blue-50 text-[#0A80F5]"
            title="PYQ & Notes to review"
            count={notes?.pending || 0}
            hint={notes?.oldestPendingAt ? `Oldest waiting ${agoLabel(notes.oldestPendingAt).toLowerCase()}` : "Uploads awaiting review"}
            to="/superadmin/pyq-notes?status=pending"
            loading={first}
          />
          <AttentionCard
            icon={<Wallet className="h-5 w-5" />}
            tone="bg-emerald-50 text-emerald-600"
            title="Withdrawals to process"
            count={openWithdrawals}
            hint={`${money((wd?.pendingAmount || 0) + (wd?.processingAmount || 0))} to pay out`}
            to="/superadmin/withdrawals?status=PENDING"
            loading={first}
          />
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Platform totals">
        <Kpi
          icon={<Building2 className="h-5 w-5" />}
          tone="bg-indigo-50 text-indigo-600"
          label="Verified institutes"
          value={<AnimatedNumber value={inst?.verified} />}
          trend={data?.signups?.slice(0, -1).map((m) => m.institutions)}
          trendColor="#2a78d6"
          hint={`${COUNT(inst?.expectedStudents)} students expected`}
          to="/superadmin/verified-institutes"
          loading={first}
        />
        <Kpi
          icon={<GraduationCap className="h-5 w-5" />}
          tone="bg-purple-50 text-purple-600"
          label="Teachers"
          value={<AnimatedNumber value={teachers?.total} />}
          trend={data?.signups?.slice(0, -1).map((m) => m.teachers)}
          trendColor="#eb6834"
          hint={`${COUNT(teachers?.verified)} verified · ${COUNT(teachers?.pending)} pending`}
          to="/superadmin/teachers"
          loading={first}
        />
        <Kpi
          icon={<Users className="h-5 w-5" />}
          tone="bg-blue-50 text-[#0A80F5]"
          label="Students"
          value={<AnimatedNumber value={students?.total} />}
          trend={data?.signups?.slice(0, -1).map((m) => m.students)}
          trendColor="#1baf7a"
          hint={`${COUNT(students?.emailVerified)} email verified`}
          to="/superadmin/students"
          loading={first}
        />
        <Kpi
          icon={<Wallet className="h-5 w-5" />}
          tone="bg-emerald-50 text-emerald-600"
          label="Paid out to users"
          value={<AnimatedNumber value={wd?.paidAmount} format={money} />}
          hint={`${money(notes?.rewardsPaid)} earned from notes`}
          to="/superadmin/withdrawals?status=PAID"
          loading={first}
        />
      </section>

      {/* chart + pipelines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SignupsChart signups={data?.signups || []} loading={first} />
        </div>

        <Panel title="Review pipeline" subtitle="Where everything stands today">
          <div className="space-y-6">
            <Pipeline
              title="PYQ & Notes"
              to="/superadmin/pyq-notes"
              loading={first}
              parts={[
                { label: "Pending", value: notes?.pending || 0, tone: "amber", to: "/superadmin/pyq-notes?status=pending" },
                { label: "Verified", value: notes?.approved || 0, tone: "green", to: "/superadmin/pyq-notes?status=approved" },
                { label: "Rejected", value: notes?.rejected || 0, tone: "red", to: "/superadmin/pyq-notes?status=rejected" },
              ]}
            />
            <Pipeline
              title="Withdrawals"
              to="/superadmin/withdrawals"
              loading={first}
              parts={[
                { label: "Pending", value: wd?.pending || 0, tone: "amber", to: "/superadmin/withdrawals?status=PENDING" },
                { label: "Processing", value: wd?.processing || 0, tone: "blue", to: "/superadmin/withdrawals?status=PROCESSING" },
                { label: "Paid", value: wd?.paid || 0, tone: "green", to: "/superadmin/withdrawals?status=PAID" },
                { label: "Rejected / failed", value: (wd?.rejected || 0) + (wd?.failed || 0), tone: "red", to: "/superadmin/withdrawals?status=REJECTED" },
              ]}
            />
            <Pipeline
              title="Institutes"
              to="/superadmin/pending-institutes"
              loading={first}
              parts={[
                { label: "Pending", value: inst?.pending || 0, tone: "amber", to: "/superadmin/pending-institutes" },
                { label: "Verified", value: inst?.verified || 0, tone: "green", to: "/superadmin/verified-institutes" },
                { label: "Rejected", value: inst?.rejected || 0, tone: "red", to: "/superadmin/pending-institutes" },
              ]}
            />
          </div>
        </Panel>
      </div>

      {/* who joined + what happened */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentlyJoined recent={data?.recent} loading={first} />
        <LatestActivity recent={data?.recent} loading={first} />
      </div>

      {/* where to go next */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Shortcuts">
        {[
          ["Browse all teachers", "Search teachers across every institute", "/superadmin/teachers", GraduationCap],
          ["Browse all students", "Search students across every institute", "/superadmin/students", Users],
          ["Email-unverified students", `${COUNT((students?.total || 0) - (students?.emailVerified || 0))} haven't verified their email`, "/superadmin/students?verified=unverified", Mail],
        ].map(([title, text, to, Icon]) => (
          <ShortcutLink key={title} title={title} text={text} to={to} icon={Icon} />
        ))}
      </section>
    </div>
  );
};

function ShortcutLink({ title, text, to, icon }) {
  const navigate = useNavigate();
  const Icon = icon;

  return (
    <button
      onClick={() => navigate(to)}
      className="group flex items-center gap-3 rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-gray-200 transition hover:ring-[#0A80F5]/40"
    >
      <span className="rounded-lg bg-gray-100 p-2 text-gray-500 transition group-hover:bg-blue-50 group-hover:text-[#0A80F5]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="truncate text-xs text-gray-500">{text}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#0A80F5]" />
    </button>
  );
}

export default Dashboard;
