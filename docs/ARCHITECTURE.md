# Mission Control V2
## Agent Control Plane — Landscape & Reference Analysis

*A systems architecture briefing for the design of a localhost-first AI agent management platform*
*March 2026 · Confidential*

---

## Table of Contents

1. [Landscape Overview](#1-landscape-overview)
2. [System Deep Dives](#2-system-deep-dives)
3. [Cross-System Design Patterns](#3-cross-system-design-patterns)
4. [Core Entity Model](#4-core-entity-model)
5. [Event Schema & Sourcing Rules](#5-event-schema--sourcing-rules)
6. [Command Model](#6-command-model)
7. [Run Dispatch Model](#7-run-dispatch-model)
8. [Lifecycle Model](#8-lifecycle-model)
9. [State Boundaries](#9-state-boundaries)
10. [UI Primitives](#10-ui-primitives)
11. [Anti-Patterns to Avoid](#11-anti-patterns-to-avoid)
12. [V1 Implementation Guidance](#12-v1-implementation-guidance)
13. [Architectural Decisions to Lock In Early](#13-architectural-decisions-to-lock-in-early)
14. [Recommended Tech Decisions](#14-recommended-tech-decisions)
15. [Revisions Added](#15-revisions-added)

---

## 1. Landscape Overview

An agent control plane sits at the intersection of four established categories of infrastructure tooling. Each contributes a distinct set of mental models, UI patterns, and data primitives. Understanding where those categories overlap — and where they diverge — is the first step toward designing Mission Control V2 with clarity.

### 1.1 Category Map

| Category | Problem Solved / Operator Interaction / Translation Value |
|---|---|
| **AI Agent Orchestration** (LangSmith, CrewAI) | **Problem:** Coordinating LLM-backed agents that produce unpredictable outputs and need tracing at the prompt/token level. **Operator:** Trace inspector, prompt comparison, evaluation runs. **Translation:** Trace/span hierarchy is the right model for agent sub-task execution. Evaluation runs are a form of task. |
| **Workflow Orchestration** (Temporal, Prefect, Airflow) | **Problem:** Running durable, fault-tolerant sequences of work that survive process restarts. **Operator:** DAG viewer, run history, retry controls, pause/resume. **Translation:** The run/workflow instance distinction maps cleanly to task/run in Mission Control. Temporal's "workflow as code" durability model is aspirational. |
| **Infrastructure Observability** (Kubernetes, Grafana, Dagster) | **Problem:** Knowing the health of processes across nodes; correlating metrics to events. **Operator:** Node health panels, metric charts, event logs. **Translation:** Node/agent health monitoring is directly applicable. Avoid importing the full complexity of distributed cluster management. |
| **Developer Agent Tools** (Continue.dev, Ray) | **Problem:** Steering coding or compute agents through tasks; inspecting partial outputs in real time. **Operator:** Chat-style command interface, streaming output, session history. **Translation:** The operator interaction model — command, observe, intervene — maps directly to Mission Control's operator UX. |

### 1.2 The Core Tension

> **Observation vs. Control**
>
> Most existing systems optimize for one of two things: observability (you can see everything but intervention is indirect) or control (you can command agents but visibility is shallow). Mission Control V2 needs both, which is rarer than it sounds.
>
> Systems like Grafana are excellent observability consoles but do not model "send a command to a worker." Systems like Prefect model task execution well but have weak real-time log streaming for interactive agents. The reference systems below were selected because each contributes something to one side of this tension.

---

## 2. System Deep Dives

Six reference systems were selected for depth. Each was chosen because it solves a problem Mission Control V2 will encounter directly.

### 2.1 LangSmith
*LLM trace inspection & evaluation platform by LangChain*

**Core Concepts**
- **Traces** — a tree of spans, each representing one LLM call, tool call, or chain step.
- **Runs** — individual trace instances (one trace per user invocation).
- **Projects** — groupings of runs by deployment or experiment.
- **Datasets & Evaluators** — structured inputs and expected outputs for automated eval.

**UI Patterns**
- Trace tree viewer: hierarchical expansion of spans with latency and token counts.
- Side-by-side diff view for prompt version comparison.
- Run list with filter by status, tags, latency, cost.
- Feedback annotation panel — operators can tag traces as correct/incorrect.

**State Model**
- Trace data is append-only; runs are immutable once complete.
- Metadata (tags, feedback) is mutable and stored separately from trace payloads.
- Cloud-hosted by default; self-hosted option available but complex.

**Strengths**
- The span/trace model is the most battle-tested way to represent LLM agent execution.
- Latency and token cost are first-class fields, not afterthoughts.
- Feedback annotation enables systematic quality tracking.

**Weaknesses**
- No concept of "send a command to an agent" — purely observational.
- State management is cloud-opinionated; local-first operation requires effort.
- Trace depth can be overwhelming for non-LLM tasks (tool calls, file ops).
- Evaluation tooling encourages a batch/offline workflow, not real-time intervention.

---

### 2.2 Temporal
*Durable workflow execution engine with full state persistence*

**Core Concepts**
- **Workflow** — a long-running, durable function that can sleep, wait for signals, and resume after crashes.
- **Activity** — a single unit of work within a workflow (retryable, idempotent).
- **Worker** — a process that polls for workflow/activity tasks and executes them.
- **Task Queue** — the channel through which the server dispatches work to workers.
- **Event History** — an append-only log of every state transition a workflow has ever made.

**UI Patterns**
- Workflow list with status chips: Running / Completed / Failed / Terminated.
- Event History timeline — scrollable, with event type badges and timestamps.
- Worker list: connected workers per task queue, with polling status.
- Signal/query panel: operators can send typed signals to running workflows.

**State Model**
- All state is derived from the event history log. UI reads from a projection of that log.
- Workflow state is never held in memory only — it is durably replayed from history.
- SQLite or PostgreSQL backend; local development uses a bundled SQLite instance.

**Strengths**
- Event history is the canonical truth — there is no confusion between runtime and persisted state.
- The Signal concept (typed commands to running workflows) is the right model for "operator sends command to agent."
- Worker health is surfaced cleanly: polling cadence, last seen time, task queue membership.
- Local development story is excellent; no cloud required.

**Weaknesses**
- Full Temporal server is heavy for a single-machine deployment.
- The Go/Java/TS SDK coupling means non-Temporal agents cannot participate natively.
- Event history replay can be cognitively demanding — 500 events in a long workflow is common.
- DAG visualization is minimal; complex workflows are hard to read in the UI.

---

### 2.3 Prefect
*Python-native workflow orchestration with a strong operator UI*

**Core Concepts**
- **Flow** — a Python function decorated as an orchestrated workflow.
- **Task** — a step within a flow; cached and retried independently.
- **Flow Run** — one execution instance of a Flow, with a full lifecycle (Scheduled → Running → Completed).
- **Deployment** — a versioned, schedulable configuration for a Flow.
- **Work Pool** — a pool of workers that execute flow runs.

**UI Patterns**
- Flow Run timeline: Gantt-style view of task start/end times within a run.
- Log stream panel: real-time log tailing with level filtering.
- Radar: auto-generated dependency graph for flow tasks.
- Notification rules: configurable alerts on state transitions.

**State Model**
- States are typed objects with a canonical FSM: Scheduled → Pending → Running → Completed/Failed/Crashed.
- State transitions are persisted; UI reads from a REST API backed by a database.
- Logs are stored in the database but can be streamed via Server-Sent Events (SSE).

**Strengths**
- The Gantt task timeline is the clearest representation of "what happened inside this run" in any orchestration UI.
- State machine is explicit, documented, and maps cleanly to AI agent lifecycle.
- Log streaming via SSE is production-proven and works well locally.
- Deployment versioning (code, parameters, schedule) is a useful model for agent configurations.

**Weaknesses**
- Prefect Server (local) still requires a running API server process — adds operational overhead.
- Python coupling means the control plane concepts leak into the agent code.
- Notification system is bolted on rather than built around an event bus.
- Cache/retry logic is powerful but creates hidden state that is hard to inspect.

---

### 2.4 Dagster
*Asset-oriented orchestration platform with the strongest UI of the category*

**Core Concepts**
- **Asset** — a persistent artifact (data, model, file) with a known producer job.
- **Job** — a set of ops (steps) that produce or transform assets.
- **Run** — one execution of a Job, with a full event log.
- **Resource** — a configured dependency (database connection, API client) injected into ops.
- **Sensor/Schedule** — automated triggers for jobs.

**UI Patterns**
- Asset graph: node-link diagram of assets and their dependency relationships.
- Run event log: a scrollable, filterable, structured log of every event in a run.
- Launchpad: parameter editor for manually triggering runs with custom config.
- Partitions view: timeline of which data partitions have been materialized.

**State Model**
- Event log is the source of truth; all UI state is derived from querying the event log.
- Run status is a materialized view over events — not a separate field.
- SQLite in development, PostgreSQL in production. Event log is the single durable table.

**Strengths**
- The event log as source-of-truth is the cleanest architectural decision in the category.
- Launchpad (parameterized manual run trigger) is the right model for operator-initiated tasks.
- Asset lineage gives operators a mental model of "what did this agent produce."
- UI quality is the highest of any orchestration tool — clearly designed for operators, not just engineers.

**Weaknesses**
- Asset model does not map naturally to conversational or exploratory agents.
- Heavy Python framework; the control plane and the agent code are coupled by design.
- Event log queries can be slow at scale without careful indexing.
- Partitions/schedules complexity exceeds what a single-agent local deployment needs.

---

### 2.5 Kubernetes Dashboard
*Web UI for inspecting and managing a Kubernetes cluster*

**Core Concepts**
- **Node** — a physical or virtual machine in the cluster.
- **Pod** — a running container instance, with lifecycle (Pending → Running → Succeeded/Failed).
- **Namespace** — a logical grouping for isolation.
- **Event** — a cluster-generated record of state changes (pod scheduling, errors, restarts).
- **Metrics** — CPU/memory/network usage per resource.

**UI Patterns**
- Resource list views: sortable tables of Pods/Nodes/Services with status badges.
- Detail pane: YAML editor, event log, log stream, resource graph — all per-resource.
- Health indicators: color-coded status (green/yellow/red) at a glance.
- Exec/log panel: direct log access and shell access to running containers.

**State Model**
- All state is read from the Kubernetes API server (etcd-backed).
- Dashboard has no local persistence — it is a pure read/command interface.
- Events are ephemeral by default (TTL 1 hour); this is a significant weakness.

**Strengths**
- Node × Resource matrix is the right mental model for "what is running where."
- Log streaming directly from a running process is implemented cleanly.
- The detail pane pattern (resource context + logs + events in one view) is highly effective.
- Status badge system (color + icon + tooltip) is widely understood by operators.

**Weaknesses**
- Event ephemerality is a critical flaw — operators lose history after an hour.
- No concept of runs or tasks — everything is present-tense state, not history.
- YAML editor is a power-user escape hatch, not a primary operator workflow.
- Requires a running Kubernetes API server; not applicable locally without k3s or minikube.

---

### 2.6 Ray Dashboard
*Observability console for distributed Python compute clusters*

**Core Concepts**
- **Actor** — a stateful, long-running Python class managed by Ray.
- **Task** — a stateless remote function call.
- **Job** — a Python script or application submitted to the cluster.
- **Node** — a machine in the cluster, with resource capacity (CPU, GPU, RAM).
- **Object** — an in-memory data object tracked by the object store.

**UI Patterns**
- Cluster overview: node health tiles with live CPU/memory sparklines.
- Actor table: list of running actors with state, PID, resource usage.
- Job logs: per-job log stream with filtering.
- Metrics: integrated Grafana panels embedded in the dashboard.

**State Model**
- State is read from the Ray Global Control Service (GCS).
- Jobs and actors are stored in-memory in the GCS; history is ephemeral.
- Metrics are persisted by Prometheus (external); dashboard reads from Prometheus API.

**Strengths**
- Actor model (stateful, long-running, named) maps well to AI agents.
- Resource consumption per actor is surfaced clearly — useful for agent cost tracking.
- Sparkline per node is an efficient way to show "is this machine stressed."
- The job submission model (code + config) is a practical pattern for task dispatch.

**Weaknesses**
- History is almost entirely ephemeral; operators cannot review what happened yesterday.
- Metrics require an external Prometheus instance — not local-first.
- The distinction between Tasks, Actors, and Jobs is confusing for non-Ray developers.
- Deep coupling to Ray runtime; control plane is not separable from the compute framework.

---

## 3. Cross-System Design Patterns

Across six systems spanning four categories, eight design patterns emerge with enough consistency to be considered load-bearing. Each exists because it solves a real operator problem that cannot be solved without it.

| Pattern | Why It Exists | How Systems Implement It |
|---|---|---|
| **Task / Run Split** | A task is a definition; a run is an execution. Conflating them means you cannot rerun, compare, or diff. | Temporal: Workflow def vs Workflow Execution. Prefect: Flow vs Flow Run. Dagster: Job vs Run. All are explicit about this split. |
| **Append-only Event Log** | Mutable state databases lose history; event logs preserve causal ordering. Operators need to know not just what is true but what happened. | Dagster: single "event log" table is source of truth. Temporal: event history is the workflow state. Both treat the log as canonical. |
| **Typed State Machine** | Undefined state transitions cause UI bugs and operator confusion. Typed states enable color coding, filtering, and notification rules. | Prefect: States are typed Python objects with defined transitions. Temporal: Workflow state is an enum with guarded transitions. |
| **Streaming Log View** | Batch log loading prevents operators from observing running agents in real time. Without streaming, debugging requires waiting for completion. | Prefect: SSE-based log streaming. Kubernetes: WebSocket log tail. Ray: HTTP chunked log endpoint. All solve the same problem differently. |
| **Worker / Node Health** | Without visibility into the host process health, operators cannot distinguish "agent is thinking" from "agent is dead." | Kubernetes: node resource usage + pod status. Ray: per-node CPU/memory sparklines. Temporal: worker polling status per task queue. |
| **Operator Signal / Command** | Observation without intervention is monitoring, not control. Operators need typed commands to pause, resume, or redirect agents. | Temporal: typed Signals to running workflows. Prefect: pause/resume + cancellation. Kubernetes: exec/delete/scale commands. |
| **Parameterized Run Trigger** | Operators need to run tasks with custom inputs without modifying code. A launchpad or form prevents the "edit a config file" workflow. | Dagster: Launchpad with schema-validated config editor. Prefect: Run parameters as Pydantic models. Both render a form from the schema. |
| **Historical Run Browser** | Operators need to answer: "what did this agent do last Tuesday?" Systems without run history force operators to rely on memory or external logs. | Prefect: Flow Run history table with filter/search. LangSmith: Run list with date/status/cost filtering. Dagster: Runs page with partition view. |

---

## 4. Core Entity Model

### 4.1 Entities

| Entity | Definition & Design Notes |
|---|---|
| **Agent** | A named, versioned process that executes tasks. Has an identity (name, version, capabilities), a connection status (CONNECTED / DEGRADED / DISCONNECTED), and a runtime handle. The control plane does not own agent code — it owns the agent record and its history. |
| **Node** | The host machine on which one or more agents run. For a Mac mini deployment, there is typically one Node. Tracks: hostname, OS, resource utilization (CPU/RAM), last heartbeat timestamp. Node health is a proxy for agent health. |
| **Task** | A definition of work to be performed: name, input schema, target agent, priority. Tasks are reusable templates. They are never "in progress" — Runs are. Avoid conflating Task and Run. |
| **Run** | One execution of a Task by a specific Agent. Has: id, taskId, agentId, status (enum), createdAt, startedAt, completedAt, exitCode, inputSnapshot. A Run is immutable once complete. Status must be a typed enum with defined transitions. |
| **Event** | An append-only record of something that happened: agent connected, run started, command sent, error occurred. Events are the canonical source of truth. The UI derives all state from Events. Never update Event records. See Section 5 for the full schema. |
| **Command** | A control-plane instruction issued by an operator or automated policy. Commands are distinct from Events: they represent intent, not fact. A Command that is sent and acknowledged produces Events as its result. See Section 6 for the full model. |
| **Log** | Structured or unstructured output emitted by a running agent during a Run. Logs are associated with a RunId and have a sequence number, timestamp, level, and body. Logs are a distinct record type from Events: they are optimized for streaming and archival, not for state derivation. A log line does not imply a state transition. |

### 4.2 Entity Relationships

```
Node
 └── Agent (1..N per node)
      └── Run (1..N per agent, over time)
           ├── Event (1..N per run)
           ├── Log   (1..N per run)
           └── Command (0..N per run)

Task ──────────────────────► Run
(definition)                 (execution)
```

A Task is a template. A Run is an instance. An Agent is a worker. A Node is the host. Events record what happened. Commands record what was instructed. Logs record what the agent said.

---

## 5. Event Schema & Sourcing Rules

### 5.1 Canonical Event Envelope

Every event written to the control plane must conform to this envelope:

```typescript
interface ControlPlaneEvent {
  id:            string;        // UUID, generated by control plane on receipt
  type:          EventType;     // discriminated union — see 5.2
  entityType:    EntityType;    // 'agent' | 'run' | 'node' | 'command'
  entityId:      string;        // the id of the primary entity this event concerns
  timestamp:     string;        // ISO 8601, UTC
  payload:       unknown;       // typed by EventType — see 5.2
  source:        EventSource;   // 'agent' | 'gateway' | 'control-plane' | 'operator'
  correlationId: string | null; // general grouping/trace field — see field notes below
}
```

**Field notes:**

- `id` is always assigned by the control plane, never by the agent. This ensures uniqueness even if the agent sends duplicates.
- `source` distinguishes facts reported by the agent runtime from facts generated by the control plane itself (e.g., a heartbeat timeout).
- `correlationId` is a general grouping field, not a foreign key. It links related events together — for example, all events associated with a single Run share the same `correlationId` (the runId), but the field may also hold a commandId or a session-level trace identifier depending on the context. Do not enforce referential integrity on this field at the database level. If you need a strict typed reference to a specific Run, use a separate explicit field (e.g., `runId`) rather than relying on `correlationId` for that constraint.
- `payload` is typed by the `type` discriminant at the TypeScript level; in SQLite it is stored as JSON text.

### 5.2 Canonical Event Types

```typescript
type EventType =
  // Agent lifecycle
  | 'agent.connected'
  | 'agent.disconnected'
  | 'agent.heartbeat'
  | 'agent.degraded'
  // Run lifecycle
  | 'run.created'
  | 'run.dispatched'
  | 'run.started'
  | 'run.completing'
  | 'run.completed'
  | 'run.failed'
  | 'run.cancelled'
  // Command lifecycle
  | 'command.sent'
  | 'command.ack'
  | 'command.rejected'
  | 'command.completed';
```

Each event type has a corresponding typed payload. For example:

```typescript
interface RunFailedEvent extends ControlPlaneEvent {
  type: 'run.failed';
  payload: {
    exitCode:   number | null;
    errorMessage: string;
    stackTrace: string | null;
  };
}

interface AgentConnectedEvent extends ControlPlaneEvent {
  type: 'agent.connected';
  payload: {
    agentVersion:   string;
    capabilities:   string[];
    nodeId:         string;
  };
}
```

### 5.3 Events vs. Logs

Logs and Events are distinct record types that serve different purposes. Do not model Logs as a subtype or specialization of Events. The distinction matters for both storage design and conceptual clarity:

- **Events** are the canonical source of truth for state transitions and control-plane history. They are always structured, always typed, and always cause a state change or record a meaningful fact. The event log is what the control plane reasons over.
- **Logs** are agent output: high-cardinality, often unstructured lines emitted by a running agent during a Run. They are optimized for streaming to the UI and archival after the Run completes. A log line does not imply a state transition and is not used to derive Run or Agent status.

| Dimension | Event | Log |
|---|---|---|
| **Cardinality** | Dozens to hundreds per run | Thousands to millions per run |
| **Structure** | Always structured (typed payload) | Often unstructured (free text) |
| **Storage** | `events` table | `logs` table (separate by design) |
| **Retention** | Permanent | Configurable (default: permanent in V1) |
| **Primary use** | State derivation, auditing, causal history | Real-time observation, post-mortem reading |
| **Streaming** | Fan-out on write to SSE subscribers | Fan-out on write to SSE subscribers |
| **State implications** | Always has state meaning | Never directly implies a state change |

Logs may be associated with events through a shared `runId` — for example, a `run.started` event and the first log line both carry the same `runId`. But association by shared key is not the same as a subtype relationship. In V1, do not write a `log.line` event to the events table. Store log lines only in the `logs` table, indexed by `(runId, sequenceNumber)`. If an auditable record of log volume is ever needed (e.g., "logging stopped mid-run"), that is a control-plane-generated event (such as `run.log_stream_closed`), not a re-routing of log lines through the event table.

### 5.4 Architectural Rule: Event Sourcing Invariants

> **Design Rule — Event Log as Canonical Truth**
>
> This is not a preference. It is a hard architectural invariant for Mission Control V2.
>
> **Rule 1: All run and agent state must be derivable from events.**
> Given only the events table, it must be possible to reconstruct the full status, history, and context of every agent and every run. If a field in the `runs` table cannot be derived from events, it does not belong in the system. Logs are not part of this derivation — they are agent output, not state transitions.
>
> **Rule 2: No direct state mutation without a corresponding event.**
> If a run transitions from RUNNING to FAILED, two things must happen atomically: the event `run.failed` is written to the events table, and the `runs.status` field is updated to FAILED. The event is primary. The status field update is a derived projection, written for query convenience. Updating the status field without writing the event is forbidden.
>
> **Rule 3: Mutable projections are permitted for performance, but events are the source of truth.**
> The `runs`, `agents`, and `nodes` tables are projections. They can be rebuilt at any time by replaying the event log. They exist so that the UI can read current state with a simple `SELECT` rather than aggregating hundreds of events. When a projection disagrees with the event log, the event log wins.
>
> **Rule 4: Events are immutable and permanent.**
> Never UPDATE or DELETE event rows. If an event was written incorrectly, write a compensating event (e.g., `run.correction`) with an explanation. This preserves the complete audit trail and prevents the class of bugs where state cannot be reconstructed.

---

## 6. Command Model

### 6.1 Commands as a First-Class Entity

Commands are distinct from Events. The distinction is causal and directional:

- **Events** are facts: things that already happened. They flow from agent → control plane.
- **Commands** are instructions: things the control plane is asking an agent to do. They flow from control plane → agent.

Conflating commands and events creates a system where you cannot distinguish "the agent did X" from "the operator told the agent to do X." These are causally different and must be separately recorded.

### 6.2 Command Schema

```typescript
interface Command {
  id:          string;          // UUID
  type:        CommandType;     // discriminated union — see 6.3
  targetType:  'run' | 'agent'; // what the command targets
  targetId:    string;          // the id of the target run or agent
  payload:     unknown;         // typed by CommandType
  issuedBy:    string;          // operator id, 'system', or automation rule name
  issuedAt:    string;          // ISO 8601, UTC
  status:      CommandStatus;   // PENDING | SENT | ACK | REJECTED | COMPLETED
  resolvedAt:  string | null;   // when status reached a terminal state
  errorReason: string | null;   // if REJECTED, the reason
}

type CommandStatus = 'PENDING' | 'SENT' | 'ACK' | 'REJECTED' | 'COMPLETED';
```

### 6.3 Command Types

```typescript
type CommandType =
  | 'run.cancel'     // Cancel a running or pending run
  | 'run.retry'      // Retry a failed run (creates a new Run record)
  | 'run.pause'      // Request the agent pause execution
  | 'run.resume'     // Resume a paused run
  | 'agent.message'  // Send a free-form message to an agent (for interactive agents)
  | 'agent.spawn'    // Request the gateway spawn a new agent instance
  | 'agent.stop'     // Request graceful shutdown of an agent
  | 'agent.restart'  // Request a full restart of an agent process
```

### 6.4 Command Lifecycle

A Command is not an Event, but every state transition of a Command produces an Event:

```
Operator issues command
        │
        ▼
Command record created (status: PENDING)
        │  → Event: command.sent
        ▼
Control plane dispatches to gateway (status: SENT)
        │
        ├── Agent acknowledges → status: ACK
        │        │  → Event: command.ack
        │        ▼
        │   Agent executes
        │        │  → Event: command.completed
        │        ▼
        │   Command terminal (status: COMPLETED)
        │
        └── Agent rejects / unreachable → status: REJECTED
                 │  → Event: command.rejected
                 ▼
            Command terminal (status: REJECTED)
```

### 6.5 Commands vs. Events: Summary

| Dimension | Command | Event |
|---|---|---|
| **Direction** | Control plane → Agent | Agent / system → Control plane |
| **Tense** | Future / intent | Past / fact |
| **Mutability** | Status field mutates through lifecycle | Always immutable |
| **Failure mode** | Can be REJECTED or time out | Cannot fail — writing is the record |
| **Storage** | `commands` table | `events` table |
| **Retention** | Permanent | Permanent |

### 6.6 Implementation Note

In V1, Commands should be simple: create a row in the `commands` table, dispatch to the OpenClaw adapter, update status based on the adapter's response, and write the corresponding events. Do not build a queue or a retry system in V1. The Command status field is sufficient to surface failures to the operator.

---

## 7. Run Dispatch Model

### 7.1 Dispatch Options Evaluated

When an operator triggers a Run, the control plane must get work to the agent. There are three models:

**Option A: Control plane pushes directly to gateway**

The control plane calls the OpenClaw gateway API synchronously when a Run enters PENDING state.

- Simplest to implement.
- Tight coupling: if the gateway is unavailable, the push fails and the control plane must handle the error inline.
- Works well for a local, single-machine deployment where the gateway is always co-located.
- Requires robust error handling at the push site.

**Option B: Agents poll for work**

Agents periodically ask the control plane "do you have work for me?" The control plane maintains a queue and returns the next task when polled.

- Decoupled: the control plane doesn't need to know agent addresses.
- Natural backpressure: an agent that is busy simply doesn't poll.
- Adds latency (polling interval) and requires the control plane to maintain a work queue.
- Good model for distributed, multi-agent deployments but adds complexity for a single-machine setup.

**Option C: Queue-based dispatch**

Work is placed into a durable queue (e.g., SQLite-backed). Workers consume from the queue. The control plane writes to the queue; agents read from it.

- Most durable: if an agent crashes mid-run, the queue retains the work item.
- Most complex: requires queue semantics (claiming, acknowledgment, redelivery) to be implemented correctly.
- Adds a full subsystem that is not justified at V1 scale.

### 7.2 Recommendation for V1

**Use Option A: control plane pushes directly to the OpenClaw gateway.**

Rationale:

1. **Simplicity matches scale.** A single Mac mini with one or a few agents does not need queue infrastructure. The complexity of Option C solves problems you don't have yet.

2. **The OpenClaw adapter abstraction contains the coupling.** If the gateway is unreachable, the failure is localized to the dispatch call inside the adapter. The Run transitions to FAILED with an appropriate error event. The operator can retry manually.

3. **The event log provides the reliability guarantee you need.** The Run record with status FAILED and the associated `run.failed` event is a durable record of what went wrong. You do not lose work silently.

4. **Option B can be added in V2 with minimal disruption.** Because the dispatch logic is behind an `AgentGateway` interface, switching from push to poll is a change to the adapter implementation and the agent's connection protocol — not a change to the data model or the UI.

**V1 dispatch flow:**

```
1. Operator triggers Run via UI Launchpad
2. Control plane creates Run record (status: PENDING), writes run.created event
3. Control plane calls gateway.dispatch(runId, taskPayload)
4. On success: Run → DISPATCHING, writes run.dispatched event
5. Agent receives work, acknowledges: Run → RUNNING, writes run.started event
6. Agent completes or fails: Run → COMPLETED | FAILED, writes terminal event
7. On gateway call failure: Run → FAILED immediately, writes run.failed event with dispatch error
```

**Reliability note for V1:** The push model has one fragile edge: if the gateway call succeeds (step 4) but the agent crashes before acknowledging (step 5), the Run stays in DISPATCHING indefinitely. Mitigate with a simple watchdog: any Run in DISPATCHING for more than N seconds without a `run.started` event is marked FAILED. This does not require a queue; it requires a background interval check.

---

## 8. Lifecycle Model

### 8.1 Task → Run Lifecycle

1. Operator creates or selects a Task definition (name, schema, target agent).
2. Operator triggers a Run via the Launchpad, providing input params. Run enters PENDING state.
3. Control plane dispatches Run to the target Agent via OpenClaw gateway.
4. Run enters RUNNING state. Agent emits Events and Logs back to the control plane.
5. Run transitions to COMPLETED, FAILED, or CANCELLED. State is final and immutable.
6. Operator can view Run history, diff runs, and re-trigger a new Run from the same Task.

### 8.2 Run State Machine

| State | Meaning & Valid Transitions |
|---|---|
| **PENDING** | Task accepted by control plane; not yet dispatched to agent. → DISPATCHING, CANCELLED |
| **DISPATCHING** | Control plane is sending the task to the agent gateway. → RUNNING, FAILED |
| **RUNNING** | Agent has acknowledged and is executing the task. → COMPLETING, FAILED, CANCELLED |
| **COMPLETING** | Agent has signalled completion; control plane is finalizing. → COMPLETED, FAILED |
| **COMPLETED** | Terminal. Run succeeded. Immutable. |
| **FAILED** | Terminal. Run errored. Stores error message, stack trace if available. Immutable. |
| **CANCELLED** | Terminal. Operator or system cancelled the run. Stores cancellation source. Immutable. |

Implement transitions as a pure function:

```typescript
function transition(current: RunStatus, event: EventType): RunStatus | Error {
  // ...
}
```

Never allow direct status field mutations outside this function. All status changes go through it.

---

## 9. State Boundaries

### 9.1 What Belongs Where

| Belongs to Agent Runtime | Belongs to Control Plane |
|---|---|
| Current execution stack and memory | Run records (id, status, timestamps, input snapshot) |
| In-progress tool calls and LLM context | Event log (immutable, append-only) |
| Streaming output buffers | Log records (indexed by runId, sequence) |
| Model weights and prompt templates | Agent registry (name, version, capabilities, config) |
| Internal retry state | Operator actions (commands sent, timestamps, operator id) |
| Connection socket / process handle | Node records (hostname, last heartbeat, resource snapshots) |

### 9.2 The Critical Boundary Rule

> The control plane must never reach into the agent runtime to read state directly. It must receive state via events. If the agent crashes and the event log is complete up to the crash, the control plane has a complete picture. If the control plane holds state that is not in the event log, it has undefined behavior on agent restart.

---

## 10. UI Primitives

| Primitive | Purpose & Implementation Notes |
|---|---|
| **Dashboard** | Summary view: agents online/offline, active runs, recent errors, node health. Designed to answer "is everything okay?" in under 3 seconds. Use status badges (color + text), not charts. Charts are for metrics, not status. |
| **Agent View** | One page per Agent: connection status, last heartbeat, current run (if any), run history (last N), recent events, pending commands. No charts unless the agent emits structured metrics. Focus on "what is this agent doing / what has it done." |
| **Task Board** | A board or table of Task definitions with their recent Run summaries. Allows operator to trigger a new Run via the Launchpad (parameter form derived from Task input schema). Should show "last run status" inline. |
| **Log Stream** | Real-time SSE-based log view attached to a running Run. Must support: follow mode (auto-scroll), pause, level filter, search/highlight. Logs must be persisted to SQLite so they are available after the Run completes. |
| **Event Timeline** | Chronological list of Events, filterable by entity (agent, run, node, command) and event type. Used for debugging. Should be sortable newest-first and oldest-first. Each event should have a type badge, entity link, and timestamp. |
| **Run Detail** | Full context for one Run: status, input params, output (if any), duration, log stream (or log archive), events for this run, related commands. The equivalent of Dagster's Run page or Prefect's Flow Run page. |
| **Command Panel** | Per-agent and per-run panel showing pending and historical commands with their status (PENDING / ACK / COMPLETED / REJECTED). Exposes the command trigger buttons (cancel, retry, message) in context. |

---

## 11. Anti-Patterns to Avoid

### ⚠ Conflating Task Definition with Run State

**Problem:** The same entity stores both the definition (name, schema, config) and the execution state (status, timestamps, logs). Updating a run's status mutates the definition record.

**Consequence:** You cannot version task definitions independently of runs. Rerunning a task produces ambiguous history. Changing a task definition retroactively alters the apparent context of past runs. This is the most common mistake in early-stage orchestration systems.

---

### ⚠ Polling Instead of Event Streams

**Problem:** The UI polls the API on a timer (e.g., every 2 seconds) to refresh agent status and log content, rather than subscribing to a server-sent event stream.

**Consequence:** Polling introduces a latency floor, generates unnecessary backend load, creates "flicker" as UI re-renders on each poll, and scales poorly when many runs are active. SSE is the correct pattern for log streaming and status updates in a local-first system. It is simpler than WebSockets and has no connection overhead.

---

### ⚠ Coupling UI Directly to Runtime State

**Problem:** The UI queries the agent process directly (or a gateway that proxies to the agent) to display its state, rather than reading from the control plane's own event log.

**Consequence:** If the agent crashes, the UI becomes blank. There is no history. The control plane is effectively a pass-through proxy rather than an independent system. The event log model (control plane owns the log; agents emit to it) is the correct separation.

---

### ⚠ Ephemeral-Only State

**Problem:** Run history, events, and logs are stored in memory or in the agent process's own log files, with no control plane persistence layer.

**Consequence:** Operators cannot answer "what happened last night?" without SSHing into the machine and reading raw files. This is the single most common failure mode in locally-run agent setups. SQLite is sufficient and requires no infrastructure investment.

---

### ⚠ Overly Complex DAG Visualizations

**Problem:** The UI renders a node-link graph of task dependencies as the primary navigation and status view, even when the workflow is essentially linear.

**Consequence:** DAG visualizations require significant frontend investment and add cognitive overhead for operators who need to answer simple questions. Reserve DAG views for genuinely parallel, complex workflows. For sequential agent tasks, a timeline or list is clearer and cheaper to build.

---

### ⚠ Mixing Operator Actions with Agent Events

**Problem:** Events from the agent runtime (task started, tool called, error thrown) are stored in the same table/stream as operator actions (command sent, run cancelled, config changed), with no distinction by source.

**Consequence:** Debugging is harder when you cannot distinguish "the agent did this" from "the operator did this." These are causally different. The `source` field on the event envelope (Section 5.1) and the separate `commands` table (Section 6) are the correct mitigations.

---

### ⚠ No Explicit Connection / Heartbeat Model

**Problem:** The control plane assumes an agent is healthy if it last sent a log message within some threshold, rather than requiring an explicit heartbeat protocol.

**Consequence:** A healthy agent that stops producing output looks identical to a dead agent. You need a dedicated heartbeat (e.g., every 10 seconds) and a connection state machine (CONNECTED / DEGRADED / DISCONNECTED) that is separate from the Run state machine.

---

### ⚠ Commands as Undifferentiated Mutations

**Problem:** Operator actions (cancel run, retry run, send message) are implemented as direct state mutations via REST endpoints, with no command record and no corresponding event.

**Consequence:** The audit trail is broken. Operators cannot see who sent what command and when. Run state changes have no causal attribution. When debugging a failed run, you cannot tell whether the failure was autonomous (agent error) or operator-initiated (cancel). Commands must be first-class entities. See Section 6.

---

## 12. V1 Implementation Guidance

### 12.1 Database Schema — Build First

These five tables are the foundation. Build them before writing any backend service logic.

```sql
-- 1. Core entity tables (projections — state for fast reads)
CREATE TABLE agents (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  version       TEXT,
  status        TEXT NOT NULL DEFAULT 'DISCONNECTED', -- CONNECTED | DEGRADED | DISCONNECTED
  nodeId        TEXT,
  lastHeartbeat TEXT,
  capabilities  TEXT,  -- JSON array
  createdAt     TEXT NOT NULL
);

CREATE TABLE runs (
  id            TEXT PRIMARY KEY,
  taskId        TEXT NOT NULL,
  agentId       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'PENDING',
  inputSnapshot TEXT,  -- JSON snapshot of input params at dispatch time
  outputSummary TEXT,  -- JSON or plain text, written on completion
  errorMessage  TEXT,
  createdAt     TEXT NOT NULL,
  startedAt     TEXT,
  completedAt   TEXT
);

-- 2. Event log (source of truth — never mutated)
CREATE TABLE events (
  id            TEXT PRIMARY KEY,
  type          TEXT NOT NULL,
  entityType    TEXT NOT NULL,
  entityId      TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  payload       TEXT,  -- JSON
  source        TEXT NOT NULL,
  correlationId TEXT   -- grouping field; not a foreign key — may be a runId, commandId, or trace id
);
CREATE INDEX idx_events_entityId      ON events(entityId);
CREATE INDEX idx_events_correlationId ON events(correlationId);
CREATE INDEX idx_events_type          ON events(type);

-- 3. Logs (high-cardinality — separate table for query performance)
CREATE TABLE logs (
  id            TEXT PRIMARY KEY,
  runId         TEXT NOT NULL,
  sequenceNum   INTEGER NOT NULL,
  timestamp     TEXT NOT NULL,
  level         TEXT NOT NULL DEFAULT 'info',
  body          TEXT NOT NULL,
  FOREIGN KEY (runId) REFERENCES runs(id)
);
CREATE INDEX idx_logs_runId ON logs(runId, sequenceNum);

-- 4. Commands
CREATE TABLE commands (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  targetType  TEXT NOT NULL,
  targetId    TEXT NOT NULL,
  payload     TEXT,  -- JSON
  issuedBy    TEXT NOT NULL,
  issuedAt    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'PENDING',
  resolvedAt  TEXT,
  errorReason TEXT
);
```

### 12.2 Backend Services — Build in This Order

1. **Event write service.** In V1, events enter the control plane through a single, explicit path: the control plane itself writes events as a direct consequence of its own actions. When the control plane dispatches a run, it writes `run.dispatched`. When the heartbeat monitor detects a timeout, it writes `agent.disconnected`. When a command is issued, it writes `command.sent`. There is no general inbound event bus, webhook handler, or callback endpoint in V1 — the control plane is the author of all events.

   Gateway- or runtime-originated events (e.g., the agent reporting `run.started` or `run.failed` back to the control plane) are the one exception. These arrive via the OpenClaw adapter as direct responses or acknowledgments to dispatch and command calls, and are written to the events table inside the same code path that handles those responses. A general-purpose inbound event ingestion endpoint — where the agent streams arbitrary events to the control plane unprompted — is a V2 addition. Do not architect for it in V1. All other services depend on this write service being the single, auditable path through which events are created.

2. **Heartbeat monitor.** A background interval (10s) that checks last heartbeat timestamps. Marks agents DEGRADED at 30s, DISCONNECTED at 60s. Writes `agent.degraded` and `agent.disconnected` events.

3. **Dispatching watchdog.** A background interval (30s) that marks any Run stuck in DISPATCHING without a `run.started` event as FAILED. Writes `run.failed` with reason `dispatch_timeout`.

4. **OpenClaw gateway adapter.** The `AgentGateway` interface with one concrete implementation. Handles dispatch, command forwarding, and heartbeat reception.

5. **SSE log stream endpoint.** One endpoint per runId. On connection, replay all existing logs from SQLite in sequence order. Then fan out new log lines as they arrive. Use an in-process event emitter (e.g., Node.js `EventEmitter`) for fan-out.

6. **SSE state stream endpoint.** One multiplexed SSE endpoint per client session. Delivers all entity state changes (run status changes, agent connection changes) as they occur. The UI subscribes once and invalidates React Query caches on each message.

7. **Command dispatch endpoint.** `POST /commands` — validates the command, writes to the commands table, calls the gateway adapter, updates command status, and writes corresponding events.

### 12.3 Build Before UI

Do not build any UI until these backend contracts are stable:

- The event write service is implemented and all five core tables are provisioned and the schema is stable.
- Agent heartbeat and connection state machine are verified.
- SSE log streaming endpoint is returning data.
- At least two Run status transitions (PENDING → DISPATCHING → RUNNING → COMPLETED) are producing the correct events and projection updates.

This ordering means the first UI you build can be connected to a real, live data stream from day one. There is no need for a mocked API.

### 12.4 Explicitly Defer

The following are valuable but must not block V1:

- DAG visualization — not needed until multi-agent workflows exist.
- Evaluation / trace comparison — build after you have sufficient run history.
- Notification and alerting rules — add once the event log is proven and stable.
- Launchpad schema validation — start with a raw JSON textarea; add JSON Schema validation in V2.
- Deployment versioning — versioned Task definitions with diff view; valuable but not critical.
- Resource metrics (CPU/RAM) collection — SSE heartbeat with a resource snapshot is sufficient for V1.
- Multi-node support — defer until the single-machine model is stable.
- Role-based access control — add before any multi-operator or remote-access scenario.

---

## 13. Architectural Decisions to Lock In Early

These decisions must be made before writing application code. Changing them later is expensive.

1. **Event log as source of truth.** All Run and Agent state must be derivable from the event log. See Section 5.4 for the full invariants. Never update a status field without also writing an event.

2. **Task/Run split.** Task is a definition. Run is an execution. Two separate tables, always.

3. **Command as a first-class entity.** Commands are not events. They have their own table, their own lifecycle, and they produce events as their side effects. See Section 6.

4. **SSE for log streaming and state updates.** Do not build a polling endpoint. SSE is the minimal correct solution and is straightforward to implement in Next.js API routes.

5. **Heartbeat protocol.** Define the heartbeat payload and the CONNECTED / DEGRADED / DISCONNECTED state machine before connecting the first agent. The watchdog depends on it.

6. **OpenClaw adapter abstraction.** The adapter to the OpenClaw gateway must sit behind a TypeScript interface (`AgentGateway`). Access it through a simple factory or module-level service accessor rather than adding DI ceremony — the point is the abstraction boundary, not the injection mechanism. This keeps the gateway swappable for testing (via a `MockGateway`) and makes Option B dispatch (agent polling) a viable future migration without restructuring call sites.

7. **Immutable events and logs.** Never UPDATE or DELETE event or log rows. If you need to correct an event, write a compensating event.

8. **Typed event schema as a compile-time contract.** Define event types as a TypeScript discriminated union before writing the first event write handler. The event envelope (Section 5.1) is the contract that all code paths touching the events table must satisfy.

---

## 14. Recommended Tech Decisions

| Decision | Recommendation & Rationale |
|---|---|
| **Database** | `better-sqlite3` with WAL mode. Synchronous API simplifies event log writes. WAL mode allows concurrent reads (UI) while writes (event ingestion) are in progress. No connection pooling needed for a single-machine deployment. |
| **Log streaming** | Next.js API route returning `text/event-stream`. Write to SQLite simultaneously. No external message broker needed. |
| **State updates to UI** | One multiplexed SSE channel per client session. All entity state changes flow through it. React Query subscribes and invalidates caches on each message. Do not use polling anywhere. |
| **OpenClaw adapter** | A TypeScript `AgentGateway` interface with one concrete `OpenClawGateway` implementation. Access via a simple factory or module-level accessor — avoid DI framework ceremony unless complexity justifies it. The abstraction boundary is what matters: it enables a `MockGateway` for testing and keeps the dispatch model swappable. |
| **Event types** | TypeScript discriminated union: `type AgentEvent = AgentConnectedEvent \| RunStartedEvent \| LogLineEvent \| ...`. Enforced at compile time. Payload types are derived from the discriminant. |
| **Run status transitions** | A pure function: `transition(current: RunStatus, event: EventType): RunStatus \| Error`. Never allow direct status field mutations. All status changes go through this function and are reflected in both the events table and the runs projection. |
| **Command dispatch** | Synchronous call to `AgentGateway.sendCommand()` within a database transaction that writes the command record and the initial `command.sent` event atomically. Gateway response drives subsequent status updates. |
| **Frontend state** | React Query for cached API reads + SSE listener that invalidates queries on state change. Do not build a custom state machine in the frontend; trust the backend event log as the single source of truth. |

---

> **Key Takeaway**
>
> The best orchestration systems succeed because they commit to one architectural principle and build everything else around it. For Dagster it is the event log. For Temporal it is durable event history. For Mission Control V2, that principle is: *the event log is the canonical truth, and everything the operator sees is a derived view of it.* Get that right at V1, and the rest of the system has a foundation to build on. The Command model, the dispatch model, and the projection tables are all downstream of this one decision. Make it first.

---

## 15. Revisions Added

### Round 1 — Architectural Clarifications

**Command Model (Section 6 — new)**
Introduced Command as a first-class entity with a formal schema (`id`, `type`, `targetType`, `targetId`, `payload`, `issuedBy`, `issuedAt`, `status`). Defined the full command type registry (`run.cancel`, `run.retry`, `agent.message`, `agent.spawn`, `agent.stop`, and others). Clarified the causal distinction between Commands (intent, mutable lifecycle) and Events (facts, immutable). Added the Command lifecycle diagram showing how a Command produces Events as its side effects. Added the Command Panel as a new UI primitive. Added "Commands as Undifferentiated Mutations" as a new anti-pattern.

**Run Dispatch Model (Section 7 — new)**
Explicitly evaluated three dispatch models: push-to-gateway, agent polling, and queue-based. Made an opinionated recommendation for V1 (direct push via the `AgentGateway` adapter) with full rationale covering simplicity, the event log as reliability guarantee, and a clear V2 migration path to polling. Added the V1 dispatch flow sequence and a concrete note on the DISPATCHING → failure edge case with a watchdog mitigation.

**Formal Event Schema (Section 5 — expanded and formalized)**
Added the canonical event envelope with all fields (`id`, `type`, `entityType`, `entityId`, `timestamp`, `payload`, `source`, `correlationId`) including per-field design notes. Added a typed `EventType` registry with example payloads. Added a structured comparison table of Events vs. Logs. The event schema is now specified at the TypeScript-and-SQLite level.

**Event Sourcing Invariants (Section 5.4 — new)**
Strengthened the existing "event log as canonical truth" guidance into four explicit, named invariants: all state is derivable from events; no mutation without a corresponding event; projections are permitted but events win on conflict; events are permanent and immutable.

**V1 Implementation Guidance (Section 12 — new)**
Added a concrete implementation bridge: the full V1 SQLite schema, a numbered backend build order, explicit guidance on what to build before the UI, and a defer list.

**Entity Model updated (Section 4)**
Added Command to the entity list. Added the entity relationship diagram. Updated the Agent entity to include the CONNECTED / DEGRADED / DISCONNECTED state machine explicitly.

---

### Round 2 — Cleanup & Consistency Pass

**Events vs. Logs clarified (Sections 4.1, 5.3, 5.4)**
Removed the "Logs are a specialization of events" framing throughout. Logs are now described as a distinct record type optimized for streaming and archival — associated with events by shared `runId`, but not structurally subordinate to them. `log.line` removed from the `EventType` registry. Rule 1 of the event sourcing invariants updated to state that state is derivable from the events table alone; logs are not part of state derivation. Section 5.3 rewritten to make the conceptual and operational boundary explicit, including a concrete V1 directive: log lines go only to the `logs` table.

**Table count corrected (Sections 12.1, 12.3)**
"Four tables" corrected to "five tables" throughout. The schema defines `agents`, `runs`, `events`, `logs`, and `commands`.

**`correlationId` clarified as a grouping field (Sections 5.1, 12.1)**
Removed the implication that `correlationId` is a foreign key to `runs.id`. Updated field notes to describe it as a general grouping and trace identifier that may hold a runId, commandId, or session-level trace id depending on context. Removed the `FOREIGN KEY (correlationId) REFERENCES runs(id)` constraint from the SQL schema. Guidance added: use explicit typed fields (e.g., `runId`) when referential integrity is required.

**Adapter abstraction wording softened (Sections 13, 14)**
Removed "constructor-inject the interface everywhere." Revised to: keep the adapter behind a TypeScript interface, access it via a simple factory or module-level accessor, and avoid DI ceremony unless complexity justifies it. The abstraction boundary remains mandatory; the injection mechanism is not.

**V1 event ingestion model made explicit (Section 12.2)**
Renamed "Event ingestion service" to "Event write service." Clarified that in V1, the control plane is the sole author of events: events are written as a direct consequence of control-plane actions (dispatch, heartbeat timeout, command issue). Gateway-originated events (agent acknowledgments) arrive via the OpenClaw adapter response path and are written inline. A general inbound event streaming endpoint is explicitly deferred to V2. Section 13 decision 8 updated to use "event write handler" for consistency.
