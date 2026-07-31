import { createHash } from "crypto";

export function hashInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getEmailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase().trim() ?? "";
}

export function isEmailAllowedForOrganization(email: string, allowedEmailDomains?: string[]) {
  if (!allowedEmailDomains || allowedEmailDomains.length === 0) {
    return true;
  }

  return allowedEmailDomains.map((domain) => domain.toLowerCase().trim()).includes(getEmailDomain(email));
}
