import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    location: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    note: v.optional(v.string()),
    title: v.string(),
    status: v.union(v.literal("planned"), v.literal("done")),
    scheduledAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_status_and_scheduledAt", ["status", "scheduledAt"]),
  focusCategories: defineTable({
    name: v.string(),
    preferredHour: v.optional(v.number()),
    targetValue: v.optional(v.number()),
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
    merchant: v.optional(v.string()),
    note: v.optional(v.string()),
    occurredAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("ignored"),
    ),
  })
    .index("by_status", ["status"])
    .index("by_status_and_occurredAt", ["status", "occurredAt"]),
  reflections: defineTable({
    note: v.optional(v.string()),
    reflectedAt: v.number(),
    tags: v.array(v.string()),
  }),
  activeTimers: defineTable({
    categoryId: v.id("focusCategories"),
    elapsedSeconds: v.number(),
    startedAt: v.number(),
    status: v.union(v.literal("running"), v.literal("paused")),
  }).index("by_status", ["status"]),
  appSettings: defineTable({
    focusCategoryId: v.id("focusCategories"),
    monthlyBudget: v.number(),
    onboardedAt: v.number(),
    reflectionHour: v.number(),
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
