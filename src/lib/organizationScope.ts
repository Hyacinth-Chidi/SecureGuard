import mongoose from "mongoose";

type Query = Record<string, unknown>;

function normalizeOrganizationId(organizationId?: string | mongoose.Types.ObjectId | null) {
  if (!organizationId) return null;
  if (organizationId instanceof mongoose.Types.ObjectId) {
    return organizationId;
  }
  return new mongoose.Types.ObjectId(organizationId);
}

export function buildTenantScopedQuery(
  baseQuery: Query,
  organizationId?: string | mongoose.Types.ObjectId | null,
  legacyFallbackQuery?: Query
) {
  const normalizedOrganizationId = normalizeOrganizationId(organizationId);
  if (!normalizedOrganizationId) {
    return baseQuery;
  }

  // If a legacy fallback query is provided, we support both `isSystem: true` AND the legacy fallback.
  // Otherwise, we support `organizationId` OR `isSystem: true`.
  if (!legacyFallbackQuery) {
    return {
      ...baseQuery,
      $or: [
        { organizationId: normalizedOrganizationId },
        { isSystem: true }
      ]
    };
  }

  return {
    ...baseQuery,
    $or: [
      { organizationId: normalizedOrganizationId },
      { isSystem: true },
      {
        organizationId: { $exists: false },
        ...legacyFallbackQuery,
      },
    ],
  };
}
