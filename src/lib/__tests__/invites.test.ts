import assert from "node:assert/strict";
import test from "node:test";
import { getEmailDomain, hashInviteToken, isEmailAllowedForOrganization } from "@/lib/invites";

test("hashInviteToken returns a stable sha256 digest without exposing the token", () => {
  const token = "sample-token";
  const hash = hashInviteToken(token);

  assert.equal(hash, hashInviteToken(token));
  assert.notEqual(hash, token);
  assert.equal(hash.length, 64);
});

test("getEmailDomain normalizes domains", () => {
  assert.equal(getEmailDomain("User@Example.COM "), "example.com");
});

test("isEmailAllowedForOrganization allows open organizations and enforces configured domains", () => {
  assert.equal(isEmailAllowedForOrganization("user@anywhere.com", []), true);
  assert.equal(isEmailAllowedForOrganization("user@example.com", ["example.com"]), true);
  assert.equal(isEmailAllowedForOrganization("user@other.com", ["example.com"]), false);
});
