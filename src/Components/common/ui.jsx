import React, { useState } from "react";
import { CircleAlert, CircleCheck, Copy, LoaderCircle, X } from "lucide-react";

export function StatCard({ label, value, hint, icon, tone, loading }) {
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

export function InstituteAvatar({ name, src, size = "md" }) {
  const [broken, setBroken] = useState(false);
  const box =
    size === "lg" ? "h-20 w-20 text-3xl" : size === "sm" ? "h-9 w-9 text-sm" : "h-14 w-14 text-xl";

  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-indigo-100 bg-indigo-200 font-bold text-indigo-700 shadow ${box}`}
    >
      {src && !broken ? (
        <img
          src={src}
          alt=""
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        String(name || "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

export function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700 ring-gray-500/20",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
    red: "bg-rose-50 text-rose-700 ring-rose-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 text-sm last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-gray-800">
        {children}
      </dd>
    </div>
  );
}

export function CopyText({ label, value, onCopy, children }) {
  if (!value) return <span>—</span>;

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        onCopy?.(`${label} copied`);
      }}
      title={`Copy ${label}`}
      className="inline-flex items-center gap-1.5 text-right hover:text-[#0A80F5]"
    >
      <span className="break-all">{children || value}</span>
      <Copy className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

export function Toast({ toast }) {
  if (!toast) return null;

  return (
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
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  tone = "primary",
  loading,
  error,
  onConfirm,
  onCancel,
}) {
  const button =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : tone === "success"
        ? "bg-emerald-600 hover:bg-emerald-700"
        : "bg-[#0A80F5] hover:bg-[#0874dd]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <h3 id="confirm-title" className="text-lg font-semibold text-gray-800">
            {title}
          </h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5 text-sm text-gray-600">
          <p>{message}</p>
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${button}`}
          >
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
