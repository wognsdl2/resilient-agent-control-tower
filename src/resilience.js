export const scenarios = {
  healthy: {
    label: "Healthy stack",
    llm: "good",
    mcp: "good",
    delay: "0.8s",
    confidence: 96,
    circuits: 0,
    route: "Primary route",
    events: [
      "Accepted the user task and created a plan.",
      "Primary LLM produced a tool plan within the latency budget.",
      "CRM MCP server returned account context.",
      "Agent answered with full confidence and no degradation notice."
    ]
  },
  llm_timeout: {
    label: "LLM timeout",
    llm: "bad",
    mcp: "good",
    delay: "3.2s",
    confidence: 88,
    circuits: 1,
    route: "Primary LLM -> backup LLM",
    events: [
      "Primary LLM exceeded the 1.8s budget.",
      "Retry used jitter to avoid synchronized pressure.",
      "Circuit breaker opened for the primary model.",
      "Backup model completed the answer with a short reliability note."
    ]
  },
  mcp_outage: {
    label: "MCP server outage",
    llm: "good",
    mcp: "bad",
    delay: "2.6s",
    confidence: 74,
    circuits: 1,
    route: "MCP -> cache -> degraded answer",
    events: [
      "CRM MCP returned connection errors.",
      "Circuit breaker prevented repeated failing tool calls.",
      "Agent used last-known-good CRM context from cache.",
      "User received a degraded answer with a verification request."
    ]
  },
  bad_tool_payload: {
    label: "Malformed tool payload",
    llm: "good",
    mcp: "warn",
    delay: "1.9s",
    confidence: 81,
    circuits: 0,
    route: "Schema guard -> repair -> answer",
    events: [
      "MCP response failed schema validation.",
      "Agent isolated the invalid fields and requested a narrower payload.",
      "Schema guard repaired safe fields and discarded ambiguous data.",
      "Answer included a note about omitted unsupported fields."
    ]
  },
  rate_limit: {
    label: "Rate limit pressure",
    llm: "warn",
    mcp: "good",
    delay: "4.4s",
    confidence: 84,
    circuits: 0,
    route: "Queue -> cheaper model -> full answer",
    events: [
      "Primary provider returned rate-limit warnings.",
      "Request moved into a bounded queue with user-visible wait status.",
      "Agent switched to a cheaper compatible model for the draft.",
      "Final answer preserved quality while reducing provider pressure."
    ]
  },
  cascade: {
    label: "Cascading failure",
    llm: "bad",
    mcp: "bad",
    delay: "6.8s",
    confidence: 62,
    circuits: 3,
    route: "Fallback chain -> cache -> handoff",
    events: [
      "Primary LLM timed out and backup LLM returned transient errors.",
      "CRM MCP became unavailable during retry.",
      "Circuit breakers opened for unstable dependencies.",
      "Agent generated a conservative answer from cached context.",
      "User saw a clear handoff recommendation and audit report."
    ]
  }
};

export function activePolicyCount(policies) {
  return Object.values(policies).filter(Boolean).length;
}

export function simulateRun(scenarioKey, task, policies) {
  const scenario = scenarios[scenarioKey] ?? scenarios.healthy;
  const enabledCount = activePolicyCount(policies);
  const missingPolicies = Object.entries(policies)
    .filter(([, enabled]) => !enabled)
    .map(([name]) => name);

  const reliabilityPenalty = missingPolicies.length * 7;
  const confidence = Math.max(35, scenario.confidence - reliabilityPenalty);
  const route = enabledCount > 0 ? scenario.route : "No resilience policy enabled";
  const answer = buildAnswer(scenarioKey, task, confidence, missingPolicies);

  return {
    ...scenario,
    confidence,
    route,
    policyCount: enabledCount,
    answer,
    note: buildNote(scenarioKey, missingPolicies)
  };
}

function buildAnswer(scenarioKey, task, confidence, missingPolicies) {
  const base = `Task received: "${task.trim()}". `;
  const suffix = missingPolicies.length
    ? ` Some resilience controls are disabled, so the answer is marked lower confidence.`
    : " All configured resilience controls were available.";

  if (scenarioKey === "healthy") {
    return `${base}The agent used the primary model and live CRM context, then produced a complete support recommendation. Confidence is ${confidence}%.${suffix}`;
  }

  if (scenarioKey === "cascade") {
    return `${base}Multiple dependencies failed, so the agent avoided guessing, used cached context only, and recommended human review before action. Confidence is ${confidence}%.${suffix}`;
  }

  return `${base}The agent recovered from the incident, continued through the safest available route, and explained the degraded dependency state to the user. Confidence is ${confidence}%.${suffix}`;
}

function buildNote(scenarioKey, missingPolicies) {
  if (missingPolicies.length) {
    return `Disabled policies: ${missingPolicies.join(", ")}. This run is intentionally less reliable.`;
  }

  if (scenarioKey === "healthy") {
    return "No degradation. The answer can be used directly.";
  }

  if (scenarioKey === "cascade") {
    return "Severe degradation. Use the answer as a draft and escalate with the exported incident report.";
  }

  return "Recovered with visible degradation. The user gets an answer plus a clear reliability explanation.";
}
