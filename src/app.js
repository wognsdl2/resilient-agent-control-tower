import { scenarios, simulateRun, activePolicyCount } from "./resilience.js";
import { drawTopology } from "./topology.js";

const scenarioInput = document.querySelector("#scenario");
const taskInput = document.querySelector("#task");
const runButton = document.querySelector("#run-button");
const exportButton = document.querySelector("#export-button");
const topology = document.querySelector("#topology");

const policies = {
  retry: document.querySelector("#retry"),
  fallback: document.querySelector("#fallback"),
  circuit: document.querySelector("#circuit"),
  cache: document.querySelector("#cache")
};

const output = {
  llm: document.querySelector("#llm-status"),
  mcp: document.querySelector("#mcp-status"),
  ux: document.querySelector("#ux-status"),
  recoveryPath: document.querySelector("#recovery-path"),
  delay: document.querySelector("#delay"),
  confidence: document.querySelector("#confidence"),
  circuits: document.querySelector("#circuits"),
  scenarioLabel: document.querySelector("#scenario-label"),
  answer: document.querySelector("#user-answer"),
  note: document.querySelector("#user-note"),
  timeline: document.querySelector("#timeline"),
  policySummary: document.querySelector("#policy-summary")
};

let currentResult = simulateRun("healthy", taskInput.value, readPolicies());

runButton.addEventListener("click", render);
scenarioInput.addEventListener("change", render);
taskInput.addEventListener("input", render);
exportButton.addEventListener("click", exportReport);

for (const policy of Object.values(policies)) {
  policy.addEventListener("change", render);
}

render();

function render() {
  const scenarioKey = scenarioInput.value;
  currentResult = simulateRun(scenarioKey, taskInput.value, readPolicies());
  output.recoveryPath.textContent = currentResult.route;
  output.delay.textContent = currentResult.delay;
  output.confidence.textContent = `${currentResult.confidence}%`;
  output.circuits.textContent = String(currentResult.circuits);
  output.scenarioLabel.textContent = currentResult.label;
  output.answer.textContent = currentResult.answer;
  output.note.textContent = currentResult.note;
  output.policySummary.textContent = `${currentResult.policyCount} policies active`;

  setStatus(output.llm, "LLM primary", currentResult.llm);
  setStatus(output.mcp, "MCP tools", currentResult.mcp);
  setStatus(output.ux, "User UX", currentResult.confidence > 80 ? "good" : currentResult.confidence > 65 ? "warn" : "bad");
  renderTimeline(currentResult.events);
  drawTopology(topology, currentResult);
}

function readPolicies() {
  return Object.fromEntries(
    Object.entries(policies).map(([key, element]) => [key, element.checked])
  );
}

function setStatus(element, label, status) {
  element.textContent = label;
  element.className = `status-pill ${status}`;
}

function renderTimeline(events) {
  output.timeline.replaceChildren(
    ...events.map((event, index) => {
      const item = document.createElement("li");
      const time = document.createElement("time");
      const text = document.createElement("p");
      time.textContent = `T+${(index * 0.7).toFixed(1)}s`;
      text.textContent = event;
      item.append(time, text);
      return item;
    })
  );
}

function exportReport() {
  const report = {
    project: "Resilient Agent Control Tower",
    scenario: scenarios[scenarioInput.value].label,
    userTask: taskInput.value,
    policiesActive: activePolicyCount(readPolicies()),
    recoveryPath: currentResult.route,
    confidence: currentResult.confidence,
    delay: currentResult.delay,
    openCircuits: currentResult.circuits,
    timeline: currentResult.events,
    userFacingAnswer: currentResult.answer,
    operatorNote: currentResult.note
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "resilient-agent-incident-report.json";
  anchor.click();
  URL.revokeObjectURL(url);
}
