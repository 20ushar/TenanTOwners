const DEFAULT_ADMIN_EMAILS = [
  "tenantownerofficial@gmail.com",
  "t21shar@gmail.com",
  "t21shar9891851774@gmail.com"
];

function normalizeEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

function parseAdminEmails(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map(email => normalizeEmail(email))
    .filter(Boolean);
}

const environmentAdminEmails = parseAdminEmails(
  import.meta.env.VITE_ADMIN_EMAILS
);

export const ADMIN_EMAILS = Array.from(
  new Set([
    ...DEFAULT_ADMIN_EMAILS.map(normalizeEmail),
    ...environmentAdminEmails
  ])
);

export function isAdminEmail(email: string | null | undefined): boolean {
  const normalizedEmail = normalizeEmail(email);

  return Boolean(normalizedEmail) &&
    ADMIN_EMAILS.includes(normalizedEmail);
}
