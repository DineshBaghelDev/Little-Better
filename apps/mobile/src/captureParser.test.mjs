import assert from "node:assert/strict";

import { parseCapture } from "./captureParser.ts";

const actions = parseCapture("I spent 350 rupees on dinner then studied math for 45 minutes then remind me to call Dad tomorrow at 6 pm");
assert.deepEqual(actions.map(({ type }) => type), ["expense", "focus", "task"]);
assert.equal(actions[0].amount, "350");
assert.equal(actions[0].category, "Food");
assert.equal(actions[1].minutes, "45");
assert.equal(actions[2].title, "call Dad");

const imperative = parseCapture("spent 450 at Cafe and focus 25 minutes and remind me to call Sam tomorrow");
assert.deepEqual(imperative.map(({ type }) => type), ["expense", "focus", "task"]);
assert.equal(imperative[1].minutes, "25");

console.log("capture parser checks passed");
