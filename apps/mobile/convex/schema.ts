import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    status: v.union(v.literal("planned"), v.literal("done")),
    scheduledAt: v.optional(v.number()),
  }).index("by_status", ["status"]),
  focusCategories: defineTable({
    name: v.string(),
    targetType: v.union(
      v.literal("sessions_per_week"),
      v.literal("minutes_per_day"),
      v.literal("minutes_per_week"),
      v.literal("binary_days"),
    ),
  }),
  focusSessions: defineTable({
    categoryId: v.id("focusCategories"),
    completedAt: v.number(),
    durationMinutes: v.number(),
    source: v.union(v.literal("timer"), v.literal("manual")),
  }).index("by_category", ["categoryId"]),
  transactions: defineTable({
    amount: v.number(),
    category: v.string(),
    occurredAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("ignored"),
    ),
  }).index("by_status", ["status"]),
  reflections: defineTable({
    note: v.optional(v.string()),
    reflectedAt: v.number(),
    tags: v.array(v.string()),
  }),
  weeklyInsights: defineTable({
    createdAt: v.number(),
    evidence: v.string(),
    observation: v.string(),
    status: v.union(
      v.literal("new"),
      v.literal("applied"),
      v.literal("dismissed"),
    ),
    suggestedAction: v.string(),
  }).index("by_status", ["status"]),
});
