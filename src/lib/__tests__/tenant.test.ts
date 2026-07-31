import assert from "node:assert/strict";
import test from "node:test";
import { getOrganizationHomePath, getPostLoginRedirect, slugifyOrganizationName } from "@/lib/tenant";

test("slugifyOrganizationName creates route-safe organization slugs", () => {
  assert.equal(slugifyOrganizationName("  Acme Security, Inc.  "), "acme-security-inc");
  assert.equal(slugifyOrganizationName("!!!"), "");
});

test("organization home paths are role and slug aware", () => {
  assert.equal(getOrganizationHomePath("org_admin", "acme"), "/acme/admin/dashboard");
  assert.equal(getOrganizationHomePath("employee", "acme"), "/acme/employee/dashboard");
  assert.equal(getOrganizationHomePath("employee", null), "/dashboard");
});

test("post-login redirect separates platform admins from tenant users", () => {
  assert.equal(getPostLoginRedirect("platform_admin", null), "/platform/admin/dashboard");
  assert.equal(getPostLoginRedirect("org_admin", "acme"), "/acme/admin/dashboard");
});
