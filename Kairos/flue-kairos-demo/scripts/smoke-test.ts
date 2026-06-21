import {
  approveProposal,
  createReorderProposal,
  executeApprovedProposal,
  getDashboardState,
  inspectInventory,
  resetDemo,
  verifyHashChain,
} from '../src/lib/kairos-store.ts';

resetDemo();

const inventory = inspectInventory('motor-A');
assert(inventory.available === 18, 'Expected deterministic inventory baseline.');

const proposal = createReorderProposal({
  assetId: 'motor-A',
  quantity: 62,
  reason: 'Smoke test replenishment',
});
assert(proposal.status === 'pending', 'Proposal must begin pending.');

let denied = false;
try {
  executeApprovedProposal(proposal.id);
} catch (error) {
  denied = String(error).includes('approved');
}
assert(denied, 'Execution without human approval must be denied.');

const approved = approveProposal(proposal.id, 'smoke-test-reviewer');
assert(approved.status === 'approved', 'Human approval must update status.');

const executed = executeApprovedProposal(proposal.id, 'smoke-test-agent');
assert(executed.status === 'executed', 'Approved action must execute.');
assert(Boolean(executed.erpOrderId), 'Execution must produce an ERP order ID.');

const executedAgain = executeApprovedProposal(proposal.id, 'smoke-test-agent');
assert(
  executedAgain.erpOrderId === executed.erpOrderId,
  'Repeated execution must be idempotent.',
);

const state = getDashboardState();
assert(state.erpOrders.length === 1, 'Idempotent execution must create exactly one ERP order.');
assert(
  state.inventory.find((item) => item.assetId === 'motor-A')?.onOrder === 62,
  'Inventory must reflect one on-order quantity.',
);
assert(verifyHashChain().valid, 'Provenance hash chain must verify.');

console.log(
  JSON.stringify(
    {
      ok: true,
      proposalId: proposal.id,
      erpOrderId: executed.erpOrderId,
      provenanceEvents: state.chain.checked,
      hashChainValid: state.chain.valid,
    },
    null,
    2,
  ),
);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
