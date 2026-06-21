# KairosAI × Flue Governed Agent Demo

This demo shows how Flue can shorten the agent-runtime work while KairosAI keeps the sovereignty-critical control plane in application-owned code.

## What the demo proves

- Flue owns the agent harness, session, tool calls, and UI event stream.
- The agent can read authorized inventory and create a proposal.
- Creating a proposal does not write to ERP.
- A human must approve the proposal before execution.
- ERP write-back is idempotent.
- Every read, decision, approval, denial, and execution is written to a hash-chained provenance ledger.
- Flue persistence and KairosAI business state are separate databases.

## Run

```bash
npm install
npm run check
npm run demo
```

Open `http://localhost:3583`.

`npm run demo` builds the React UI and Flue server, then starts the
production-style local bundle. This avoids development-watch rebuilds caused
by SQLite WAL updates inside the project directory.

The built-in deterministic provider requires no API key. To use a real model instead:

```bash
export KAIROS_MODEL=openai/gpt-5.5
export OPENAI_API_KEY=...
npm run demo
```

Any model configured through Flue/Pi can be selected with `KAIROS_MODEL`.

## Demo sequence

1. Click **Inspect & propose**.
2. Confirm that a pending proposal appears and no ERP order exists.
3. Click **Human approve**.
4. Click **Execute approved** in the agent panel, or use **Console execute**.
5. Confirm the ERP order, inventory `onOrder`, and valid provenance hash chain.
6. Click **Audit trail** to have the Flue agent explain recent events.

## Architecture boundary

```text
Flue Agent
  - model / deterministic demo provider
  - continuing session
  - typed tools
  - streamed UI events
        |
        | proposal / bounded tool call
        v
KairosAI Governance Rail
  - tenant boundary
  - policy checks
  - human approval
  - idempotency
  - provenance hash chain
        |
        | approved write only
        v
Simulated ERP
```

Flue's SQLite database is stored at `data/flue.db`. KairosAI's application-owned demo state is stored separately at `data/kairos-demo.db`.

## Production gaps

This is a local proof of concept, not a production security boundary. Production work would still require:

- authenticated users and tenant binding at the HTTP route;
- Postgres or another HA application database;
- a production-supported database driver instead of Node's experimental
  built-in SQLite API;
- KMS-backed signing instead of a simple SHA-256 chain;
- real policy-as-code and separation of duties;
- durable outbox/inbox integration with the system of record;
- secret management, rate limits, observability redaction, and security testing;
- an approved model and deployment profile for each sovereignty tier.

## Flue version note

The demo targets Flue `1.0.0-beta`. Keep the runtime behind the KairosAI tool and HTTP contracts so it remains replaceable while the framework evolves.
