import React, { useState } from "react";
import { CircleCheck, CircleX, ExternalLink, Eye, EyeOff, FileText } from "lucide-react";
import { fileKind } from "../utils/format";

function DocumentCard({ title, subtitle, url }) {
  const [open, setOpen] = useState(false);
  const kind = fileKind(url);
  const previewable = kind === "image" || kind === "pdf";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-blue-50 p-2.5 text-[#0A80F5]">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-gray-800">{title}</p>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        {url ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CircleCheck className="h-4 w-4" /> Uploaded
            </span>
            {previewable && (
              <button
                onClick={() => setOpen((value) => !value)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                {open ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {open ? "Hide" : "Preview"}
              </button>
            )}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A80F5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0874dd]"
            >
              Open <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
            <CircleX className="h-4 w-4" /> Not uploaded
          </span>
        )}
      </div>

      {open && url && (
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          {kind === "image" ? (
            <img src={url} alt={title} className="mx-auto max-h-[480px] object-contain" />
          ) : (
            <iframe title={title} src={url} className="h-[480px] w-full" />
          )}
        </div>
      )}
    </div>
  );
}

export default function DocumentsPanel({ institute }) {
  return (
    <div className="space-y-3">
      <DocumentCard
        title="Aadhaar card"
        subtitle="Identity verification document"
        url={institute.aadharUrl}
      />
      <DocumentCard
        title="Designation ID"
        subtitle="Official designation document"
        url={institute.designationIDUrl}
      />
      <p className="text-xs text-gray-400">
        If a preview doesn&apos;t load, the file host may block embedding — use Open instead.
      </p>
    </div>
  );
}
