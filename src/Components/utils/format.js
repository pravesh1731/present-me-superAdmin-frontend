import axios from "axios";
import { BaseUrl } from "./constants";

export const formatDate = (value, withTime = false) => {
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

export const daysSince = (value) => {
  const time = new Date(value).getTime();

  return Number.isNaN(time)
    ? null
    : Math.max(0, Math.floor((Date.now() - time) / 86400000));
};

export const agoLabel = (value) => {
  const days = daysSince(value);

  if (days === null) return "—";
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

export const money = (value) => `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

export const fullName = (person) =>
  `${person?.firstName || ""} ${person?.lastName || ""}`.trim() || "—";

export const websiteHref = (site) =>
  site ? (/^https?:\/\//i.test(site) ? site : `https://${site}`) : "";

export const fileKind = (url) => {
  const clean = String(url || "").split("?")[0].toLowerCase();

  if (/\.(png|jpe?g|webp|gif|bmp)$/.test(clean)) return "image";
  if (clean.endsWith(".pdf")) return "pdf";
  return "other";
};

// The institution list endpoints return whole DB records (including password hashes).
// Never render anything that looks like a credential.
export const isSensitiveKey = (key) => /pass|hash|token|secret|otp/i.test(key);

const csvCell = (value) =>
  `"${String(value ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;

export const downloadCsv = (filename, columns, rows) => {
  const lines = [
    columns.map(([label]) => csvCell(label)).join(","),
    ...rows.map((row) => columns.map(([, get]) => csvCell(get(row))).join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const setInstituteStatus = (institutionId, status) =>
  axios.patch(
    `${BaseUrl}/sadmin/institutes/${institutionId}/status`,
    { status },
    { withCredentials: true }
  );
