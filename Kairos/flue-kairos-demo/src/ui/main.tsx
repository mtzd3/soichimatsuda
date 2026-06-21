import {
  FlueProvider,
  type UIMessagePart,
  useFlueAgent,
} from '@flue/react';
import { createFlueClient } from '@flue/sdk';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type DashboardState = {
  inventory: Array<{
    assetId: string;
    label: string;
    available: number;
    onOrder: number;
    reorderPoint: number;
    targetLevel: number;
    unitCostJpy: number;
  }>;
  proposals: Array<{
    id: string;
    assetId: string;
    quantity: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'executed';
    approvedBy: string | null;
    erpOrderId: string | null;
  }>;
  erpOrders: Array<{
    orderId: string;
    proposalId: string;
    assetId: string;
    quantity: number;
  }>;
  events: Array<{
    sequence: number;
    eventType: string;
    actor: string;
    eventHash: string;
    createdAt: string;
  }>;
  chain: { valid: boolean; checked: number; brokenAt?: number };
  architecture: Record<string, string>;
};

const client = createFlueClient({
  baseUrl: '/api/flue',
  fetch: window.fetch.bind(window),
});
const conversationId = 'manufacturing-tenant-demo';

function App() {
  const agent = useFlueAgent({ name: 'operations-guardian', id: conversationId });
  const [input, setInput] = useState('');
  const [state, setState] = useState<DashboardState>();
  const [error, setError] = useState<string>();
  const [busyAction, setBusyAction] = useState<string>();

  const refresh = useCallback(async () => {
    const response = await fetch('/api/kairos/state');
    if (!response.ok) throw new Error('Failed to load KairosAI state.');
    setState((await response.json()) as DashboardState);
  }, []);

  useEffect(() => {
    refresh().catch((cause) => setError(errorMessage(cause)));
    const timer = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return;
    setInput('');
    setError(undefined);
    try {
      await agent.sendMessage(trimmed);
      await refresh();
    } catch (cause) {
      setInput(trimmed);
      setError(errorMessage(cause));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    await send(input);
  }

  async function mutate(path: string, key: string) {
    setBusyAction(key);
    setError(undefined);
    try {
      const response = await fetch(path, { method: 'POST' });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Action failed.');
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusyAction(undefined);
    }
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">KairosAI × Flue</p>
          <h1>Governed Agent Runtime</h1>
          <p className="lede">
            Flue handles the agent harness. KairosAI keeps policy, approval, execution,
            and provenance in an application-owned sovereignty rail.
          </p>
        </div>
        <div className="hero-badge">
          <span className="pulse" />
          Local demo
          <small>No API key required</small>
        </div>
      </header>

      <section className="architecture" aria-label="Architecture">
        <ArchitectureNode title="Flue Agent" detail="Reasoning · tools · sessions" tone="cyan" />
        <Arrow label="proposal only" />
        <ArchitectureNode title="KairosAI Rail" detail="Policy · approval · provenance" tone="gold" />
        <Arrow label="approved action" />
        <ArchitectureNode title="Simulated ERP" detail="Idempotent write-back" tone="green" />
      </section>

      <div className="workspace">
        <section className="panel chat-panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">Agent runtime</p>
              <h2>Operations Guardian</h2>
            </div>
            <StatusPill status={agent.status} />
          </div>

          <div className="quick-actions">
            <button onClick={() => send('motor-Aの在庫を確認して、不足なら補充提案して')}>
              1. Inspect & propose
            </button>
            <button onClick={() => send('承認済みの補充提案を実行して')}>
              3. Execute approved
            </button>
            <button onClick={() => send('直近の監査証跡を説明して')}>
              Audit trail
            </button>
          </div>

          <div className="messages" aria-live="polite">
            {agent.messages.length === 0 && (
              <div className="empty-chat">
                <span>01</span>
                Ask the agent to inspect inventory. It may propose an action, but it cannot
                execute until a human approves it.
              </div>
            )}
            {agent.messages.map((message) => (
              <article className={`message ${message.role}`} key={message.id}>
                <strong>{message.role === 'user' ? 'Operator' : 'Guardian'}</strong>
                {message.parts.map((part) => (
                  <MessagePart key={partKey(part)} part={part} />
                ))}
              </article>
            ))}
          </div>

          <form onSubmit={submit}>
            <input
              aria-label="Agent message"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the governed agent to inspect or execute…"
              value={input}
            />
            <button className="send" disabled={!input.trim()} type="submit">
              Send
            </button>
          </form>
        </section>

        <aside className="right-column">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="kicker">Application state</p>
                <h2>Inventory</h2>
              </div>
              <button
                className="secondary"
                onClick={() => mutate('/api/kairos/reset', 'reset')}
              >
                Reset
              </button>
            </div>
            <div className="inventory-list">
              {state?.inventory.map((item) => {
                const low = item.available + item.onOrder < item.reorderPoint;
                return (
                  <div className="inventory-item" key={item.assetId}>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.assetId}</small>
                    </div>
                    <div className={`stock ${low ? 'low' : ''}`}>
                      {item.available}
                      <small>+{item.onOrder} ordered</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel policy-panel">
            <div className="panel-heading">
              <div>
                <p className="kicker">Human boundary</p>
                <h2>Policy Gate</h2>
              </div>
              <span className="lock">Approval required</span>
            </div>
            {!state?.proposals.length && (
              <p className="muted">No proposals. Ask the agent to inspect inventory.</p>
            )}
            {state?.proposals.map((proposal) => (
              <article className="proposal" key={proposal.id}>
                <div className="proposal-top">
                  <code>{proposal.id}</code>
                  <StatusPill status={proposal.status} />
                </div>
                <strong>
                  {proposal.quantity} × {proposal.assetId}
                </strong>
                <p>{proposal.reason}</p>
                {proposal.erpOrderId && <small>ERP: {proposal.erpOrderId}</small>}
                <div className="proposal-actions">
                  {proposal.status === 'pending' && (
                    <>
                      <button
                        disabled={busyAction === proposal.id}
                        onClick={() =>
                          mutate(
                            `/api/kairos/proposals/${proposal.id}/approve`,
                            proposal.id,
                          )
                        }
                      >
                        2. Human approve
                      </button>
                      <button
                        className="danger"
                        disabled={busyAction === proposal.id}
                        onClick={() =>
                          mutate(
                            `/api/kairos/proposals/${proposal.id}/reject`,
                            proposal.id,
                          )
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {proposal.status === 'approved' && (
                    <button
                      className="secondary"
                      onClick={() =>
                        mutate(
                          `/api/kairos/proposals/${proposal.id}/execute`,
                          proposal.id,
                        )
                      }
                    >
                      Console execute
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        </aside>
      </div>

      <section className="panel provenance">
        <div className="panel-heading">
          <div>
            <p className="kicker">Tamper-evident ledger</p>
            <h2>Provenance</h2>
          </div>
          <span className={`chain ${state?.chain.valid ? 'valid' : 'invalid'}`}>
            {state?.chain.valid ? 'Hash chain valid' : 'Hash chain invalid'} ·{' '}
            {state?.chain.checked ?? 0} events
          </span>
        </div>
        <div className="event-grid">
          {state?.events.slice(0, 12).map((event) => (
            <article className="event" key={event.sequence}>
              <span>#{event.sequence}</span>
              <strong>{event.eventType.replaceAll('_', ' ')}</strong>
              <small>{event.actor}</small>
              <code>{event.eventHash.slice(0, 12)}…</code>
            </article>
          ))}
        </div>
      </section>

      {error && <div className="error">{error}</div>}
    </main>
  );
}

function ArchitectureNode({
  title,
  detail,
  tone,
}: {
  title: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className={`architecture-node ${tone}`}>
      <span />
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="arrow">
      <small>{label}</small>
      <span>→</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return <span className={`status ${status}`}>{status}</span>;
}

function MessagePart({ part }: { part: UIMessagePart }) {
  if (part.type === 'text') return <p>{part.text}</p>;
  if (part.type === 'reasoning') {
    return (
      <details>
        <summary>Reasoning</summary>
        {part.text}
      </details>
    );
  }
  if (part.type === 'file') return <a href={part.url}>Attachment</a>;
  return (
    <div className={`tool-call ${part.state}`}>
      <span>tool</span>
      <code>{part.toolName}</code>
      <small>{part.state}</small>
    </div>
  );
}

function partKey(part: UIMessagePart): string {
  if (part.type === 'dynamic-tool') return `tool:${part.toolCallId}`;
  if (part.type === 'file') return `file:${part.mediaType}:${part.url}`;
  return `${part.type}:${part.text}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing React root.');

createRoot(root).render(
  <FlueProvider client={client}>
    <App />
  </FlueProvider>,
);
