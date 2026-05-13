import assert from "node:assert/strict";
import { scenarios, simulateRun } from "../src/resilience.js";

const fullPolicies = {
  retry: true,
  fallback: true,
  circuit: true,
  cache: true
};

for (const key of Object.keys(scenarios)) {
  const result = simulateRun(key, "Draft a support recommendation.", fullPolicies);
  assert.ok(result.answer.length > 80, `${key} should produce a useful answer`);
  assert.ok(result.events.length >= 4, `${key} should produce an incident timeline`);
  assert.ok(result.confidence >= 35 && result.confidence <= 100, `${key} confidence should stay bounded`);
  assert.notEqual(result.route, "No resilience policy enabled", `${key} should use resilience policies`);
}

const degraded = simulateRun("cascade", "Draft a support recommendation.", {
  retry: false,
  fallback: false,
  circuit: false,
  cache: false
});

assert.equal(degraded.route, "No resilience policy enabled");
assert.ok(degraded.confidence < scenarios.cascade.confidence);

console.log("All resilience scenario tests passed.");
