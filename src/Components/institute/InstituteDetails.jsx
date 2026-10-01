import React from "react";
import {
  Building2,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import { CopyText, DetailRow } from "../common/ui";
import {
  formatDate,
  fullName,
  isSensitiveKey,
  websiteHref,
} from "../utils/format";

// Fields rendered in the sections below; anything else lands in "All other fields"
const knownFields = [
  "institutionId",
  "InstitutionName",
  "firstName",
  "lastName",
  "Role",
  "role",
  "emailId",
  "phone",
  "address",
  "website",
  "status",
  "type",
  "createdAt",
  "expectedStudents",
  "expectedTeachers",
  "bio",
  "profilePicUrl",
  "aadharUrl",
  "designationIDUrl",
];

function Section({ icon, title, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-gray-800">
        <span className="text-[#0A80F5]">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function CountTile({ icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
      <span className={`rounded-lg p-2.5 ${tone}`}>{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-800">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export default function InstituteDetails({ institute, onCopy }) {
  const role = institute.Role || institute.role;
  const extraFields = Object.entries(institute).filter(
    ([key, value]) =>
      !knownFields.includes(key) &&
      !isSensitiveKey(key) &&
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <CountTile
          icon={<Users className="h-5 w-5" />}
          label="Expected students"
          value={institute.expectedStudents}
          tone="bg-blue-50 text-blue-600"
        />
        <CountTile
          icon={<GraduationCap className="h-5 w-5" />}
          label="Expected teachers"
          value={institute.expectedTeachers}
          tone="bg-purple-50 text-purple-600"
        />
      </div>

      <Section icon={<Building2 className="h-4 w-4" />} title="Institute information">
        <dl>
          <DetailRow label="Name">{institute.InstitutionName || "—"}</DetailRow>
          <DetailRow label="Type">
            <span className="capitalize">{institute.type || "—"}</span>
          </DetailRow>
          <DetailRow label="Address">
            <span className="inline-flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              {institute.address || "—"}
            </span>
          </DetailRow>
          <DetailRow label="Website">
            {institute.website ? (
              <a
                href={websiteHref(institute.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {String(institute.website).replace(/^https?:\/\//i, "")}
              </a>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label="Registered on">
            {formatDate(institute.createdAt, true)}
          </DetailRow>
        </dl>
      </Section>

      <Section icon={<User className="h-4 w-4" />} title="Contact person">
        <dl>
          <DetailRow label="Name">{fullName(institute)}</DetailRow>
          <DetailRow label="Designation">{role || "—"}</DetailRow>
          <DetailRow label="Email">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              <CopyText label="Email" value={institute.emailId} onCopy={onCopy} />
            </span>
          </DetailRow>
          <DetailRow label="Phone">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              <CopyText label="Phone" value={institute.phone} onCopy={onCopy} />
            </span>
          </DetailRow>
        </dl>
      </Section>

      {institute.bio && (
        <Section icon={<Building2 className="h-4 w-4" />} title="About">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {institute.bio}
          </p>
        </Section>
      )}

      <Section icon={<Building2 className="h-4 w-4" />} title="Identifiers">
        <dl>
          <DetailRow label="Institution ID">
            <span className="text-xs">
              <CopyText
                label="Institution ID"
                value={institute.institutionId}
                onCopy={onCopy}
              />
            </span>
          </DetailRow>
        </dl>
      </Section>

      {extraFields.length > 0 && (
        <details className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800">
            All other fields ({extraFields.length})
          </summary>
          <dl className="mt-2">
            {extraFields.map(([key, value]) => (
              <DetailRow key={key} label={key}>
                <span className="text-xs">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </span>
              </DetailRow>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
