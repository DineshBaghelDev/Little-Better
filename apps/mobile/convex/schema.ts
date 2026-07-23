import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  tasks: defineTable({
    userId: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    location: v.optional(v.string()),
    meetingLink: v.optional(v.string()),
    note: v.optional(v.string()),
    reminderLeadMinutes: v.optional(v.number()),
    title: v.string(),
    status: v.union(v.literal("planned"), v.literal("done")),
    scheduledAt: v.optional(v.number()),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_status_and_completedAt", ["userId", "status", "completedAt"])
    .index("by_user_status_and_scheduledAt", ["userId", "status", "scheduledAt"]),
  focusCategories: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    preferredHour: v.optional(v.number()),
    targetValue: v.optional(v.number()),
    targetType: v.union(
      v.literal("sessions_per_week"),
      v.literal("minutes_per_day"),
      v.literal("minutes_per_week"),
      v.literal("binary_days"),
    ),
  }).index("by_user", ["userId"]),
  focusSessions: defineTable({
    userId: v.optional(v.id("users")),
    categoryId: v.id("focusCategories"),
    completedAt: v.number(),
    durationMinutes: v.number(),
    source: v.union(v.literal("timer"), v.literal("manual")),
  })
    .index("by_user_and_category", ["userId", "categoryId"])
    .index("by_user_category_and_completedAt", ["userId", "categoryId", "completedAt"]),
  transactions: defineTable({
    userId: v.optional(v.id("users")),
    accountId: v.optional(v.id("accounts")),
    amount: v.number(),
    category: v.string(),
    detectionKey: v.optional(v.string()),
    merchant: v.optional(v.string()),
    note: v.optional(v.string()),
    occurredAt: v.number(),
    paymentMethod: v.optional(v.union(v.literal("cash"), v.literal("online"))),
    rawText: v.optional(v.string()),
    resolution: v.optional(v.union(v.literal("failed"), v.literal("refunded"), v.literal("duplicate"))),
    source: v.optional(v.union(v.literal("manual"), v.literal("text"), v.literal("notification"), v.literal("import"))),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("ignored"),
    ),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_status_and_occurredAt", ["userId", "status", "occurredAt"])
    .index("by_user_and_detectionKey", ["userId", "detectionKey"]),
  accounts: defineTable({
    userId: v.optional(v.id("users")),
    archived: v.optional(v.boolean()),
    balance: v.number(),
    name: v.string(),
  }).index("by_user", ["userId"]),
  transactionCategories: defineTable({
    userId: v.optional(v.id("users")),
    name: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
  })
    .index("by_user_and_type", ["userId", "type"]),
  reflections: defineTable({
    userId: v.optional(v.id("users")),
    note: v.optional(v.string()),
    reflectedAt: v.number(),
    tags: v.array(v.string()),
  })
    .index("by_user_and_reflectedAt", ["userId", "reflectedAt"]),
  reflectionDismissals: defineTable({
    userId: v.optional(v.id("users")),
    action: v.union(v.literal("skip"), v.literal("snooze")),
    createdAt: v.number(),
    dateKey: v.string(),
    snoozeUntil: v.optional(v.number()),
  })
    .index("by_user_and_dateKey", ["userId", "dateKey"]),
  activeTimers: defineTable({
    userId: v.optional(v.id("users")),
    categoryId: v.id("focusCategories"),
    elapsedSeconds: v.number(),
    startedAt: v.number(),
    status: v.union(v.literal("running"), v.literal("paused")),
  })
    .index("by_user_and_status", ["userId", "status"]),
  appSettings: defineTable({
    userId: v.optional(v.id("users")),
    backgroundPattern: v.optional(v.union(v.literal("none"), v.literal("sprouts"), v.literal("dots"), v.literal("stars"))),
    colorScheme: v.optional(v.union(v.literal("sage"), v.literal("teal"), v.literal("lavender"), v.literal("coral"), v.literal("mustard"))),
    focusCategoryId: v.id("focusCategories"),
    monthlyBudget: v.number(),
    navStyle: v.optional(v.union(v.literal("floating"), v.literal("classic"), v.literal("compact"))),
    notificationsEnabled: v.optional(v.boolean()),
    onboardedAt: v.number(),
    reflectionHour: v.number(),
  }).index("by_user", ["userId"]),
  weeklyInsights: defineTable({
    userId: v.optional(v.id("users")),
    actionHour: v.optional(v.number()),
    actionType: v.optional(v.literal("move_focus_reminder")),
    appliedAt: v.optional(v.number()),
    createdAt: v.number(),
    evidence: v.string(),
    observation: v.string(),
    previousHour: v.optional(v.number()),
    status: v.union(
      v.literal("new"),
      v.literal("applied"),
      v.literal("dismissed"),
    ),
    suggestedAction: v.string(),
  })
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_status_and_createdAt", ["userId", "status", "createdAt"]),
});
