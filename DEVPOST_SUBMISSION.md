# Devpost Submission Draft

## Project name

Resilient Agent Control Tower

## Tagline

A live incident lab for AI agents that explains LLM and MCP failures, recovers through fallback policies, and keeps the user informed instead of stuck behind a spinner.

## Built for

DevNetwork AI + ML Hackathon 2026  
Challenge: TrueFoundry: Resilient Agents

## What it does

Resilient Agent Control Tower is a browser-based simulator for AI agent reliability incidents. A judge can choose scenarios such as LLM timeout, MCP outage, malformed tool payload, rate-limit pressure, or cascading failure. The app then shows the agent's recovery path, active circuit breakers, fallback route, incident timeline, confidence level, and the final user-facing answer.

The key idea is that resilience is not only backend retries. A good agent should tell the user what failed, what fallback was used, how confident the result is, and when a human should verify the answer.

## Inspiration

Modern AI products often fail in invisible ways: a provider times out, an MCP tool returns malformed data, or a backup model responds differently. The user usually sees only a spinner or a vague error. This project turns that failure path into a visible, explainable workflow.

## How I built it

The project is a dependency-free static web app built with HTML, CSS, and JavaScript modules. The simulator logic lives in `src/resilience.js`, the topology renderer lives in `src/topology.js`, and the UI wiring lives in `src/app.js`. A small Node test suite checks that every scenario produces a non-empty user response, a bounded confidence score, and a useful incident timeline.

## What makes it useful

- Tests multiple incident scenarios without needing real production outages
- Shows LLM and MCP dependency status in one dashboard
- Demonstrates retries, provider fallback, circuit breakers, and cached context
- Produces a user-facing answer that explains degraded reliability
- Exports an incident report for support or postmortem review

## Challenges

The hardest part was making infrastructure reliability understandable from the user's point of view. The demo avoids turning this into a backend-only diagram and instead focuses on what the user sees: delay, confidence, fallback path, and escalation guidance.

## Accomplishments

- Built a working simulator with six incident scenarios
- Added a topology canvas that changes based on dependency health
- Added active policy toggles for retry, fallback, circuit breaker, and cache
- Added an exportable JSON incident report
- Deployed a live GitHub Pages demo
- Added automated scenario tests

## What I learned

Agent reliability needs two layers: infrastructure policy and user communication. Retry logic helps, but users also need to know when an answer is degraded, what data source failed, and how much confidence they should place in the result.

## What's next

- Add live integrations with TrueFoundry AI Gateway routing
- Store incident traces for historical reliability analytics
- Add team-level SLO dashboards
- Add real MCP server health checks
- Support policy presets for support, sales, research, and operations agents

## Links

Live demo: https://wognsdl2.github.io/resilient-agent-control-tower/

Source code: https://github.com/wognsdl2/resilient-agent-control-tower

## Technologies

HTML, CSS, JavaScript, Canvas, GitHub Pages, Node.js
