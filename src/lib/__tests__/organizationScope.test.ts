import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import { buildTenantScopedQuery } from "@/lib/organizationScope";

test("buildTenantScopedQuery leaves queries unchanged when no organization is present", () => {
  const baseQuery = { status: "active" };

  assert.deepEqual(buildTenantScopedQuery(baseQuery, null), baseQuery);
});

test("buildTenantScopedQuery adds organizationId for tenant-owned records", () => {
  const organizationId = new mongoose.Types.ObjectId();
  const query = buildTenantScopedQuery({ status: "active" }, organizationId);

  assert.equal(query.status, "active");
  assert.equal(query.organizationId, organizationId);
});

test("buildTenantScopedQuery supports a constrained legacy fallback", () => {
  const organizationId = new mongoose.Types.ObjectId();
  const query = buildTenantScopedQuery({ status: "draft" }, organizationId, { createdBy: "admin-id" });

  assert.equal(query.status, "draft");
  assert.deepEqual(query.$or, [
    { organizationId },
    {
      organizationId: { $exists: false },
      createdBy: "admin-id",
    },
  ]);
});
