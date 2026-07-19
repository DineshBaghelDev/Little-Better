import { v } from "convex/values";

import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

const MS_PER_HOUR = 60 * 60 * 1000;
const SESSION_SECONDS = 30 * 60;

const targetType = v.union(
  v.literal("sessions_per_week"),
  v.literal("minutes_per_day"),
  v.literal("minutes_per_week"),
  v.literal("binary_days"),
);

const focusCategory = v.object({
  _id: v.id("focusCategories"),
  _creationTime: v.number(),
  name: v.string(),
  preferredHour: v.optional(v.number()),
  targetType,
  targetValue: v.optional(v.number()),
});

const task = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  scheduledAt: v.optional(v.number()),
  status: v.union(v.literal("planned"), v.literal("done")),
  title: v.string(),
});

const transaction = v.object({
  _id: v.id("transactions"),
  _creationTime: v.number(),
  amount: v.number(),
  category: v.string(),
  occurredAt: v.number(),
  status: v.union(v.literal("pending"), v.literal("confirmed"), v.literal("ignored")),
});

const activeTimer = v.object({
  _id: v.id("activeTimers"),
  _creationTime: v.number(),
  categoryId: v.id("focusCategories"),
  elapsedSeconds: v.number(),
  startedAt: v.number(),
  status: v.union(v.literal("running"), v.literal("paused")),
});

const settings = v.object({
  _id: v.id("appSettings"),
  _creationTime: v.number(),
  focusCategoryId: v.id("focusCategories"),
  monthlyBudget: v.number(),
  onboardedAt: v.number(),
  reflectionHour: v.number(),
});

async function firstActiveTimer(ctx: QueryCtx | MutationCtx) {
  return (
    (await ctx.db
      .query("activeTimers")
      .withIndex("by_status", (q) => q.eq("status", "running"))
      .order("desc")
      .first()) ??
    (await ctx.db
      .query("activeTimers")
      .withIndex("by_status", (q) => q.eq("status", "paused"))
      .order("desc")
      .first())
  );
}

export const onboardingStatus = query({
  args: {},
  returns: v.object({ onboarded: v.boolean() }),
  handler: async (ctx) => ({
    onboarded: (await ctx.db.query("appSettings").order("desc").first()) !== null,
  }),
});

export const bootstrap = mutation({
  args: {
    focusName: v.string(),
    monthlyBudget: v.number(),
    preferredHour: v.number(),
    reflectionHour: v.number(),
    targetValue: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (await ctx.db.query("appSettings").order("desc").first()) return null;

    const now = Date.now();
    const categoryId = await ctx.db.insert("focusCategories", {
      name: args.focusName.trim() || "Study",
      preferredHour: Math.max(0, Math.min(23, Math.round(args.preferredHour))),
      targetType: "sessions_per_week",
      targetValue: Math.max(1, Math.min(7, Math.round(args.targetValue))),
    });
    await ctx.db.insert("appSettings", {
      focusCategoryId: categoryId,
      monthlyBudget: Math.max(0, args.monthlyBudget),
      onboardedAt: now,
      reflectionHour: Math.max(17, Math.min(23, Math.round(args.reflectionHour))),
    });
    await ctx.db.insert("tasks", {
      title: "Plan tomorrow's first task",
      scheduledAt: now + MS_PER_HOUR,
      status: "planned",
    });
    return null;
  },
});

export const today = query({
  args: {},
  returns: v.object({
    activeTimer: v.union(activeTimer, v.null()),
    focusCategory: v.union(focusCategory, v.null()),
    focusSessionsThisWeek: v.number(),
    plannedTasks: v.array(task),
    pendingTransactions: v.array(transaction),
    reflectionDue: v.boolean(),
    settings: v.union(settings, v.null()),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    const focus = settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null;
    const plannedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "planned"))
      .take(20);
    const pendingTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(3);
    const [lastReflection] = await ctx.db.query("reflections").order("desc").take(1);
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    const weekStart = now - 7 * 24 * MS_PER_HOUR;
    const focusSessions = focus
      ? await ctx.db
          .query("focusSessions")
          .withIndex("by_category", (q) => q.eq("categoryId", focus._id))
          .order("desc")
          .take(20)
      : [];

    return {
      activeTimer: await firstActiveTimer(ctx),
      focusCategory: focus,
      focusSessionsThisWeek: focusSessions.filter((session) => session.completedAt >= weekStart)
        .length,
      pendingTransactions,
      plannedTasks: plannedTasks.sort((a, b) => (a.scheduledAt ?? now) - (b.scheduledAt ?? now)),
      reflectionDue:
        !!settingsDoc &&
        new Date(now).getHours() >= settingsDoc.reflectionHour &&
        (!lastReflection || lastReflection.reflectedAt < dayStart.getTime()),
      settings: settingsDoc,
    };
  },
});

export const completeTask = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { status: "done" });
    return null;
  },
});

export const addTask = mutation({
  args: { scheduledAt: v.optional(v.number()), title: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (title) await ctx.db.insert("tasks", { scheduledAt: args.scheduledAt, title, status: "planned" });
    return null;
  },
});

export const scheduleTask = mutation({
  args: { scheduledAt: v.optional(v.number()), taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, { scheduledAt: args.scheduledAt });
    return null;
  },
});

export const addReflection = mutation({
  args: { note: v.string(), tags: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("reflections", {
      note: args.note.trim() || undefined,
      reflectedAt: Date.now(),
      tags: args.tags,
    });
    return null;
  },
});

export const focusState = query({
  args: {},
  returns: v.object({
    activeTimer: v.union(activeTimer, v.null()),
    focusCategory: v.union(focusCategory, v.null()),
  }),
  handler: async (ctx) => {
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    return {
      activeTimer: await firstActiveTimer(ctx),
      focusCategory: settingsDoc ? await ctx.db.get(settingsDoc.focusCategoryId) : null,
    };
  },
});

export const startFocus = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const current = await ctx.db.query("appSettings").order("desc").first();
    if (!current || (await firstActiveTimer(ctx))) return null;
    await ctx.db.insert("activeTimers", {
      categoryId: current.focusCategoryId,
      elapsedSeconds: 0,
      startedAt: Date.now(),
      status: "running",
    });
    return null;
  },
});

export const setFocusPaused = mutation({
  args: { paused: v.boolean(), timerId: v.id("activeTimers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const timer = await ctx.db.get(args.timerId);
    if (!timer) return null;
    const now = Date.now();
    const elapsedSeconds =
      timer.status === "running"
        ? timer.elapsedSeconds + Math.floor((now - timer.startedAt) / 1000)
        : timer.elapsedSeconds;
    await ctx.db.patch(args.timerId, {
      elapsedSeconds,
      startedAt: now,
      status: args.paused ? "paused" : "running",
    });
    return null;
  },
});

export const endFocus = mutation({
  args: { timerId: v.id("activeTimers") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const timer = await ctx.db.get(args.timerId);
    if (!timer) return null;
    const now = Date.now();
    const elapsedSeconds =
      timer.status === "running"
        ? timer.elapsedSeconds + Math.floor((now - timer.startedAt) / 1000)
        : timer.elapsedSeconds;
    await ctx.db.insert("focusSessions", {
      categoryId: timer.categoryId,
      completedAt: now,
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      source: "timer",
    });
    await ctx.db.delete(args.timerId);
    return null;
  },
});

export const addManualFocus = mutation({
  args: { minutes: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const current = await ctx.db.query("appSettings").order("desc").first();
    if (!current) return null;
    await ctx.db.insert("focusSessions", {
      categoryId: current.focusCategoryId,
      completedAt: Date.now(),
      durationMinutes: Math.max(1, Math.min(600, Math.round(args.minutes))),
      source: "manual",
    });
    return null;
  },
});

export const addExpense = mutation({
  args: { amount: v.number(), category: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.amount) || args.amount <= 0) return null;
    await ctx.db.insert("transactions", {
      amount: Math.round(args.amount),
      category: args.category.trim() || "General",
      occurredAt: Date.now(),
      status: "pending",
    });
    return null;
  },
});

export const calendar = query({
  args: { from: v.number(), to: v.number() },
  returns: v.object({
    focusSessions: v.array(v.object({
      _id: v.id("focusSessions"),
      _creationTime: v.number(),
      categoryId: v.id("focusCategories"),
      completedAt: v.number(),
      durationMinutes: v.number(),
      source: v.union(v.literal("timer"), v.literal("manual")),
    })),
    scheduledTasks: v.array(task),
    unscheduledTasks: v.array(task),
  }),
  handler: async (ctx, args) => {
    const from = Math.max(0, Math.min(args.from, args.to));
    const to = Math.min(Math.max(args.from, args.to), from + 31 * 24 * MS_PER_HOUR);
    const scheduledTasks = await ctx.db
      .query("tasks")
      .withIndex("by_status_and_scheduledAt", (q) =>
        q.eq("status", "planned").gte("scheduledAt", from).lte("scheduledAt", to),
      )
      .take(100);
    const focus = await ctx.db.query("appSettings").order("desc").first();
    const focusSessions = focus
      ? (await ctx.db
          .query("focusSessions")
          .withIndex("by_category", (q) => q.eq("categoryId", focus.focusCategoryId))
          .order("desc")
          .take(100)).filter((session) => session.completedAt >= from && session.completedAt <= to)
      : [];
    const unscheduledTasks = (await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "planned"))
      .take(50)).filter((item) => item.scheduledAt === undefined);

    return {
      focusSessions,
      scheduledTasks: scheduledTasks.sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0)),
      unscheduledTasks,
    };
  },
});

export const money = query({
  args: {},
  returns: v.object({
    budget: v.number(),
    confirmed: v.array(transaction),
    pending: v.array(transaction),
    spent: v.number(),
    summary: v.array(v.object({ amount: v.number(), category: v.string() })),
  }),
  handler: async (ctx) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
    const settingsDoc = await ctx.db.query("appSettings").order("desc").first();
    const confirmed = await ctx.db
      .query("transactions")
      .withIndex("by_status_and_occurredAt", (q) =>
        q.eq("status", "confirmed").gte("occurredAt", monthStart).lt("occurredAt", monthEnd),
      )
      .order("desc")
      .take(50);
    const pending = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(20);
    const byCategory = new Map<string, number>();
    for (const item of confirmed) byCategory.set(item.category, (byCategory.get(item.category) ?? 0) + item.amount);

    return {
      budget: settingsDoc?.monthlyBudget ?? 0,
      confirmed,
      pending,
      spent: confirmed.reduce((total, item) => total + item.amount, 0),
      summary: [...byCategory.entries()].map(([category, amount]) => ({ amount, category })),
    };
  },
});

export const updateTransaction = mutation({
  args: {
    amount: v.optional(v.number()),
    category: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("ignored"))),
    transactionId: v.id("transactions"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const patch: Partial<{ amount: number; category: string; status: "pending" | "confirmed" | "ignored" }> = {};
    if (args.amount !== undefined && Number.isFinite(args.amount) && args.amount > 0) patch.amount = Math.round(args.amount);
    if (args.category !== undefined && args.category.trim()) patch.category = args.category.trim();
    if (args.status !== undefined) patch.status = args.status;
    if (Object.keys(patch).length) await ctx.db.patch(args.transactionId, patch);
    return null;
  },
});
