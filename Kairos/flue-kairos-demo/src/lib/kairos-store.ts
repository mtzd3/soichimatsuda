import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'executed';

export type InventoryItem = {
  assetId: string;
  label: string;
  available: number;
  onOrder: number;
  reorderPoint: number;
  targetLevel: number;
  unitCostJpy: number;
};

export type Proposal = {
  id: string;
  assetId: string;
  quantity: number;
  reason: string;
  status: ProposalStatus;
  proposedBy: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  executedAt: string | null;
  erpOrderId: string | null;
};

export type ProvenanceEvent = {
  sequence: number;
  eventType: string;
  proposalId: string | null;
  actor: string;
  payload: Record<string, unknown>;
  previousHash: string;
  eventHash: string;
  createdAt: string;
};

const dataDirectory = new URL('../../data/', import.meta.url);
mkdirSync(dataDirectory, { recursive: true });
const databasePath = new URL('kairos-demo.db', dataDirectory);
const db = new DatabaseSync(databasePath.pathname);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS inventory (
    asset_id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    available INTEGER NOT NULL,
    on_order INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL,
    target_level INTEGER NOT NULL,
    unit_cost_jpy INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL REFERENCES inventory(asset_id),
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL,
    proposed_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    approved_at TEXT,
    approved_by TEXT,
    executed_at TEXT,
    erp_order_id TEXT
  );

  CREATE TABLE IF NOT EXISTS erp_orders (
    order_id TEXT PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    proposal_id TEXT NOT NULL UNIQUE REFERENCES proposals(id),
    asset_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS provenance_events (
    sequence INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    proposal_id TEXT,
    actor TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    event_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL
  );
`);

seedIfEmpty();

export function resetDemo(): ReturnType<typeof getDashboardState> {
  transaction(() => {
    db.exec(`
      DELETE FROM provenance_events;
      DELETE FROM erp_orders;
      DELETE FROM proposals;
      DELETE FROM inventory;
      DELETE FROM sqlite_sequence WHERE name = 'provenance_events';
    `);
    seedInventory();
    appendEvent({
      eventType: 'demo_reset',
      actor: 'system',
      payload: { reason: 'Deterministic demo baseline restored' },
    });
  });
  return getDashboardState();
}

export function inspectInventory(assetId: string): InventoryItem {
  const item = getInventoryItem(assetId);
  if (!item) throw new Error(`Asset ${assetId} is outside the authorized demo boundary.`);
  appendEvent({
    eventType: 'inventory_read',
    actor: 'flue-agent',
    payload: { assetId, available: item.available, onOrder: item.onOrder },
  });
  return item;
}

export function createReorderProposal(input: {
  assetId: string;
  quantity: number;
  reason: string;
  proposedBy?: string;
}): Proposal {
  const item = getInventoryItem(input.assetId);
  if (!item) throw new Error(`Policy denied: unknown asset ${input.assetId}.`);
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error('Policy denied: quantity must be a positive integer.');
  }

  const effectiveStock = item.available + item.onOrder;
  const suggestedQuantity = Math.max(0, item.targetLevel - effectiveStock);
  if (effectiveStock >= item.reorderPoint) {
    throw new Error('Policy denied: inventory is not below the reorder point.');
  }
  if (input.quantity > suggestedQuantity) {
    throw new Error(`Policy denied: quantity exceeds the calculated shortage of ${suggestedQuantity}.`);
  }
  if (input.quantity * item.unitCostJpy > 1_000_000) {
    throw new Error('Policy denied: proposal value exceeds the ¥1,000,000 demo limit.');
  }

  const existing = db
    .prepare(
      `SELECT * FROM proposals
       WHERE asset_id = ? AND status IN ('pending', 'approved')
       ORDER BY created_at DESC LIMIT 1`,
    )
    .get(input.assetId) as Record<string, unknown> | undefined;
  if (existing) return mapProposal(existing);

  const proposal: Proposal = {
    id: `prop_${randomUUID().slice(0, 8)}`,
    assetId: input.assetId,
    quantity: input.quantity,
    reason: input.reason,
    status: 'pending',
    proposedBy: input.proposedBy ?? 'flue-agent',
    createdAt: new Date().toISOString(),
    approvedAt: null,
    approvedBy: null,
    executedAt: null,
    erpOrderId: null,
  };

  transaction(() => {
    db.prepare(
      `INSERT INTO proposals
       (id, asset_id, quantity, reason, status, proposed_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      proposal.id,
      proposal.assetId,
      proposal.quantity,
      proposal.reason,
      proposal.status,
      proposal.proposedBy,
      proposal.createdAt,
    );
    appendEvent({
      eventType: 'proposal_created',
      proposalId: proposal.id,
      actor: proposal.proposedBy,
      payload: {
        assetId: proposal.assetId,
        quantity: proposal.quantity,
        reason: proposal.reason,
        policy: {
          effectiveStock,
          reorderPoint: item.reorderPoint,
          targetLevel: item.targetLevel,
          maxValueJpy: 1_000_000,
        },
      },
    });
  });
  return proposal;
}

export function approveProposal(id: string, actor = 'human-reviewer'): Proposal {
  return transaction(() => {
    const proposal = requireProposal(id);
    if (proposal.status === 'approved' || proposal.status === 'executed') return proposal;
    if (proposal.status !== 'pending') {
      throw new Error(`Only pending proposals can be approved. Current status: ${proposal.status}`);
    }
    const approvedAt = new Date().toISOString();
    db.prepare(
      `UPDATE proposals
       SET status = 'approved', approved_at = ?, approved_by = ?
       WHERE id = ?`,
    ).run(approvedAt, actor, id);
    appendEvent({
      eventType: 'proposal_approved',
      proposalId: id,
      actor,
      payload: { approvedAt },
    });
    return requireProposal(id);
  });
}

export function rejectProposal(id: string, actor = 'human-reviewer'): Proposal {
  return transaction(() => {
    const proposal = requireProposal(id);
    if (proposal.status !== 'pending') {
      throw new Error(`Only pending proposals can be rejected. Current status: ${proposal.status}`);
    }
    db.prepare(`UPDATE proposals SET status = 'rejected' WHERE id = ?`).run(id);
    appendEvent({
      eventType: 'proposal_rejected',
      proposalId: id,
      actor,
      payload: { reason: 'Human reviewer rejected the proposed action' },
    });
    return requireProposal(id);
  });
}

export function executeApprovedProposal(id: string, actor = 'flue-agent'): Proposal {
  return transaction(() => {
    const proposal = requireProposal(id);
    if (proposal.status === 'executed') return proposal;
    if (proposal.status !== 'approved') {
      appendEvent({
        eventType: 'execution_denied',
        proposalId: id,
        actor,
        payload: { status: proposal.status, reason: 'Human approval is required' },
      });
      throw new Error('Policy denied: the proposal must be approved by a human before execution.');
    }

    const idempotencyKey = `reorder:${proposal.id}`;
    const existingOrder = db
      .prepare(`SELECT order_id FROM erp_orders WHERE idempotency_key = ?`)
      .get(idempotencyKey) as { order_id: string } | undefined;
    const orderId = existingOrder?.order_id ?? `erp_${randomUUID().slice(0, 8)}`;
    const executedAt = new Date().toISOString();

    if (!existingOrder) {
      db.prepare(
        `INSERT INTO erp_orders
         (order_id, idempotency_key, proposal_id, asset_id, quantity, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        orderId,
        idempotencyKey,
        proposal.id,
        proposal.assetId,
        proposal.quantity,
        executedAt,
      );
      db.prepare(`UPDATE inventory SET on_order = on_order + ? WHERE asset_id = ?`).run(
        proposal.quantity,
        proposal.assetId,
      );
    }

    db.prepare(
      `UPDATE proposals
       SET status = 'executed', executed_at = ?, erp_order_id = ?
       WHERE id = ?`,
    ).run(executedAt, orderId, id);
    appendEvent({
      eventType: 'action_executed',
      proposalId: id,
      actor,
      payload: {
        orderId,
        idempotencyKey,
        assetId: proposal.assetId,
        quantity: proposal.quantity,
        externalSystem: 'simulated-erp',
      },
    });
    return requireProposal(id);
  });
}

export function listActiveProposals(): Proposal[] {
  const rows = db
    .prepare(
      `SELECT * FROM proposals
       WHERE status IN ('pending', 'approved')
       ORDER BY created_at DESC`,
    )
    .all() as Record<string, unknown>[];
  return rows.map(mapProposal);
}

export function listProvenanceEvents(limit = 30): ProvenanceEvent[] {
  const rows = db
    .prepare(`SELECT * FROM provenance_events ORDER BY sequence DESC LIMIT ?`)
    .all(limit) as Record<string, unknown>[];
  return rows.map(mapEvent);
}

export function verifyHashChain(): { valid: boolean; checked: number; brokenAt?: number } {
  const rows = db
    .prepare(`SELECT * FROM provenance_events ORDER BY sequence ASC`)
    .all() as Record<string, unknown>[];
  let previousHash = 'GENESIS';
  for (const row of rows) {
    const event = mapEvent(row);
    const expected = hashEvent({
      previousHash,
      eventType: event.eventType,
      proposalId: event.proposalId,
      actor: event.actor,
      payloadJson: stableStringify(event.payload),
      createdAt: event.createdAt,
    });
    if (event.previousHash !== previousHash || event.eventHash !== expected) {
      return { valid: false, checked: rows.length, brokenAt: event.sequence };
    }
    previousHash = event.eventHash;
  }
  return { valid: true, checked: rows.length };
}

export function getDashboardState() {
  const inventory = db
    .prepare(`SELECT * FROM inventory ORDER BY asset_id`)
    .all()
    .map((row) => mapInventory(row as Record<string, unknown>));
  const proposals = db
    .prepare(`SELECT * FROM proposals ORDER BY created_at DESC`)
    .all()
    .map((row) => mapProposal(row as Record<string, unknown>));
  const erpOrders = db
    .prepare(`SELECT * FROM erp_orders ORDER BY created_at DESC`)
    .all() as Record<string, unknown>[];
  return {
    inventory,
    proposals,
    erpOrders: erpOrders.map((row) => ({
      orderId: String(row.order_id),
      proposalId: String(row.proposal_id),
      assetId: String(row.asset_id),
      quantity: Number(row.quantity),
      createdAt: String(row.created_at),
    })),
    events: listProvenanceEvents(24),
    chain: verifyHashChain(),
    architecture: {
      agentRuntime: 'Flue',
      governance: 'KairosAI Policy / Human Review / Provenance',
      systemOfRecord: 'Application-owned SQLite demo DB',
    },
  };
}

function seedIfEmpty() {
  const count = db.prepare(`SELECT COUNT(*) AS count FROM inventory`).get() as { count: number };
  if (count.count === 0) resetDemo();
}

function seedInventory() {
  const insert = db.prepare(
    `INSERT INTO inventory
     (asset_id, label, available, on_order, reorder_point, target_level, unit_cost_jpy)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  insert.run('motor-A', 'Servo Motor A', 18, 0, 30, 80, 8_000);
  insert.run('bearing-B', 'Precision Bearing B', 95, 0, 40, 100, 1_200);
  insert.run('sensor-C', 'Thermal Sensor C', 12, 0, 20, 50, 4_500);
}

function getInventoryItem(assetId: string): InventoryItem | undefined {
  const row = db.prepare(`SELECT * FROM inventory WHERE asset_id = ?`).get(assetId) as
    | Record<string, unknown>
    | undefined;
  return row ? mapInventory(row) : undefined;
}

function requireProposal(id: string): Proposal {
  const row = db.prepare(`SELECT * FROM proposals WHERE id = ?`).get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) throw new Error(`Proposal ${id} was not found.`);
  return mapProposal(row);
}

function appendEvent(input: {
  eventType: string;
  actor: string;
  proposalId?: string;
  payload: Record<string, unknown>;
}) {
  const last = db
    .prepare(`SELECT event_hash FROM provenance_events ORDER BY sequence DESC LIMIT 1`)
    .get() as { event_hash: string } | undefined;
  const previousHash = last?.event_hash ?? 'GENESIS';
  const createdAt = new Date().toISOString();
  const payloadJson = stableStringify(input.payload);
  const eventHash = hashEvent({
    previousHash,
    eventType: input.eventType,
    proposalId: input.proposalId ?? null,
    actor: input.actor,
    payloadJson,
    createdAt,
  });
  db.prepare(
    `INSERT INTO provenance_events
     (event_type, proposal_id, actor, payload_json, previous_hash, event_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.eventType,
    input.proposalId ?? null,
    input.actor,
    payloadJson,
    previousHash,
    eventHash,
    createdAt,
  );
}

function hashEvent(input: {
  previousHash: string;
  eventType: string;
  proposalId: string | null;
  actor: string;
  payloadJson: string;
  createdAt: string;
}) {
  return createHash('sha256')
    .update(
      [
        input.previousHash,
        input.eventType,
        input.proposalId ?? '',
        input.actor,
        input.payloadJson,
        input.createdAt,
      ].join('|'),
    )
    .digest('hex');
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function transaction<T>(callback: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = callback();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function mapInventory(row: Record<string, unknown>): InventoryItem {
  return {
    assetId: String(row.asset_id),
    label: String(row.label),
    available: Number(row.available),
    onOrder: Number(row.on_order),
    reorderPoint: Number(row.reorder_point),
    targetLevel: Number(row.target_level),
    unitCostJpy: Number(row.unit_cost_jpy),
  };
}

function mapProposal(row: Record<string, unknown>): Proposal {
  return {
    id: String(row.id),
    assetId: String(row.asset_id),
    quantity: Number(row.quantity),
    reason: String(row.reason),
    status: String(row.status) as ProposalStatus,
    proposedBy: String(row.proposed_by),
    createdAt: String(row.created_at),
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    approvedBy: row.approved_by ? String(row.approved_by) : null,
    executedAt: row.executed_at ? String(row.executed_at) : null,
    erpOrderId: row.erp_order_id ? String(row.erp_order_id) : null,
  };
}

function mapEvent(row: Record<string, unknown>): ProvenanceEvent {
  return {
    sequence: Number(row.sequence),
    eventType: String(row.event_type),
    proposalId: row.proposal_id ? String(row.proposal_id) : null,
    actor: String(row.actor),
    payload: JSON.parse(String(row.payload_json)) as Record<string, unknown>,
    previousHash: String(row.previous_hash),
    eventHash: String(row.event_hash),
    createdAt: String(row.created_at),
  };
}
