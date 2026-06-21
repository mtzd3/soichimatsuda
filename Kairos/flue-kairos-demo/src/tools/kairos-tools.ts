import { defineTool } from '@flue/runtime';
import * as v from 'valibot';
import {
  createReorderProposal,
  executeApprovedProposal,
  inspectInventory,
  listActiveProposals,
  listProvenanceEvents,
} from '../lib/kairos-store.ts';

export const inspectInventoryTool = defineTool({
  name: 'inspect_inventory',
  description:
    'Read inventory inside the tenant boundary. Use this before proposing a replenishment.',
  parameters: v.object({
    assetId: v.pipe(v.string(), v.description('Authorized asset ID, for example motor-A')),
  }),
  execute: async ({ assetId }) => JSON.stringify(inspectInventory(assetId)),
});

export const proposeReorderTool = defineTool({
  name: 'propose_reorder',
  description:
    'Create a governed reorder proposal. This never writes to ERP and always requires human approval.',
  parameters: v.object({
    assetId: v.string(),
    quantity: v.pipe(v.number(), v.integer(), v.minValue(1)),
    reason: v.string(),
  }),
  execute: async ({ assetId, quantity, reason }) =>
    JSON.stringify(createReorderProposal({ assetId, quantity, reason })),
});

export const listActiveProposalsTool = defineTool({
  name: 'list_active_proposals',
  description: 'List pending and human-approved proposals in the KairosAI governance rail.',
  parameters: v.object({}),
  execute: async () => JSON.stringify(listActiveProposals()),
});

export const executeApprovedReorderTool = defineTool({
  name: 'execute_approved_reorder',
  description:
    'Execute one reorder in the simulated ERP. Policy rejects proposals without human approval. Execution is idempotent.',
  parameters: v.object({
    proposalId: v.string(),
  }),
  execute: async ({ proposalId }) => JSON.stringify(executeApprovedProposal(proposalId)),
});

export const listProvenanceEventsTool = defineTool({
  name: 'list_provenance_events',
  description: 'Read the tamper-evident provenance events for audit explanation.',
  parameters: v.object({
    limit: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(30)), 12),
  }),
  execute: async ({ limit }) => JSON.stringify(listProvenanceEvents(limit)),
});

export const kairosTools = [
  inspectInventoryTool,
  proposeReorderTool,
  listActiveProposalsTool,
  executeApprovedReorderTool,
  listProvenanceEventsTool,
];
