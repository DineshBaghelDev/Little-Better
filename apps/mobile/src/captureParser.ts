export type ExtractedAction =
  | { amount: string; category: string; merchant: string; type: "expense"; warnings: string[] }
  | { minutes: string; note: string; type: "focus"; warnings: string[] }
  | { reminderLeadMinutes: string; scheduledAt: string; title: string; type: "task"; warnings: string[] }
  | { exceptText: string; scheduledAt: string; type: "move"; warnings: string[] };

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

function dateAt(value: Date, hour: number, minute = 0) {
  const date = new Date(value);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

function parseHour(text: string) {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  const suffix = match[3]?.toLowerCase();
  if (suffix === "pm" && hour < 12) hour += 12;
  if (suffix === "am" && hour === 12) hour = 0;
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

function scheduledTime(text: string) {
  const lower = text.toLowerCase();
  const time = parseHour(lower.match(/\bat\s+([^,.]+)/)?.[1] ?? "");
  if (!/\b(today|tomorrow)\b/.test(lower) && !time) return "";
  const date = /\btomorrow\b/.test(lower) ? tomorrowDate() : new Date();
  if (!time) return String(dateAt(date, 9));
  let value = dateAt(date, time.hour, time.minute);
  if (!/\b(today|tomorrow)\b/.test(lower) && value <= Date.now()) value += 24 * 60 * 60 * 1000;
  return String(value);
}

function expenseCategory(text: string) {
  if (/\b(food|lunch|dinner|breakfast|cafe|restaurant|grocery|groceries|zomato|swiggy)\b/.test(text)) return "Food";
  if (/\b(uber|ola|metro|bus|fuel|petrol|travel|taxi)\b/.test(text)) return "Travel";
  if (/\b(electricity|water|recharge|internet|bill)\b/.test(text)) return "Bills";
  if (/\b(shop|shopping|clothes|amazon|flipkart)\b/.test(text)) return "Shopping";
  return "General";
}

function clauses(text: string) {
  return text
    .replace(/\s+(?:and\s+then|then)\s+/gi, "|")
    .replace(/\s+and\s+(?=(?:i\s+)?(?:spent|paid|bought|purchased|studied|focus|focused|worked|read|meditated|exercised|remind|add|schedule|move)\b)/gi, "|")
    .split(/\||[;\n]+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseClause(text: string): ExtractedAction | null {
  const lower = text.toLowerCase().replace(/^i\s+/, "");

  if (lower.includes("move unfinished tasks")) {
    const exceptText = lower.match(/\bexcept\s+(.+?)(?:[,.]|$)/)?.[1]?.trim() || "";
    return {
      exceptText,
      scheduledAt: scheduledTime(lower) || String(dateAt(tomorrowDate(), 9)),
      type: "move",
      warnings: exceptText ? [] : ["Check which tasks to exclude"],
    };
  }

  if (/\b(spent|paid|bought|purchased|expense|rs|inr)\b|\u20b9/i.test(lower)) {
    const amount = lower.match(/(?:\u20b9|\brs\.?|\binr)?\s*([\d,]+(?:\.\d{1,2})?)(?:\s*(?:rupees?|rs|inr))?/i)?.[1];
    if (amount) {
      const merchant = lower.match(/\b(?:to|at)\s+(.+?)(?:\s+(?:using|via|on|for)\b|[,.]|$)/i)?.[1]?.trim() ?? "";
      const category = expenseCategory(lower);
      return {
        amount: amount.replace(/,/g, ""),
        category,
        merchant,
        type: "expense",
        warnings: category === "General" ? ["Check category"] : [],
      };
    }
  }

  const focus = lower.match(/\b(focus|focused|studied|worked(?:\s+on)?|read|meditated|exercised)\s*(.*?)\s+(?:for\s+)?(\d+)\s*(minutes?|mins?|hours?|hrs?)\b/i);
  if (focus) {
    const minutes = Number(focus[3]) * (/^(hour|hr)/i.test(focus[4]) ? 60 : 1);
    return { minutes: String(minutes), note: focus[2].trim(), type: "focus", warnings: [] };
  }

  if (/^(?:remind me to|add(?: task)?|schedule|todo|need to)\b/i.test(lower) || /\b(today|tomorrow)\b/.test(lower)) {
    const reminder = lower.match(/\bremind me\s+(\d+)\s*(minutes?|mins?|hours?|hrs?)\s+(?:before|early)\b/i);
    const title = text
      .replace(/^\s*(?:i\s+)?(?:remind me to|add(?: task)?|schedule|todo|need to)\s+/i, "")
      .replace(/\s+\b(?:today|tomorrow)\b.*$/i, "")
      .replace(/\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b.*$/i, "")
      .trim();
    if (title) {
      return {
        reminderLeadMinutes: reminder ? String(Number(reminder[1]) * (/^(hour|hr)/i.test(reminder[2]) ? 60 : 1)) : "",
        scheduledAt: scheduledTime(lower),
        title,
        type: "task",
        warnings: scheduledTime(lower) ? [] : ["Add a date if needed"],
      };
    }
  }

  return null;
}

export function parseCapture(text: string): ExtractedAction[] {
  const parsed = clauses(text).map(parseClause).filter((action): action is ExtractedAction => action !== null);
  return parsed.length
    ? parsed
    : [{ reminderLeadMinutes: "", scheduledAt: "", title: text.trim(), type: "task", warnings: ["Check item type"] }];
}
