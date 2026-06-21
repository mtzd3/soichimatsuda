import {
  fauxAssistantMessage,
  fauxText,
  fauxToolCall,
  registerFauxProvider,
} from '@earendil-works/pi-ai';
import { createAgent, type AgentRouteHandler } from '@flue/runtime';
import { kairosTools } from '../tools/kairos-tools.ts';

export const route: AgentRouteHandler = async (_context, next) => next();

const instructions = `
You are the KairosAI Operations Guardian for one authorized manufacturing tenant.

Operating rules:
- Use inspect_inventory before proposing replenishment.
- proposal creation is allowed, but it is not an ERP write.
- Never claim that a proposal has executed unless execute_approved_reorder succeeds.
- Human approval is mandatory before ERP execution.
- Explain policy denials plainly.
- Preserve provenance: use the audit tool when asked why an action occurred.
- You are bounded to the asset IDs exposed by trusted application tools.
`;

export default createAgent(() => {
  const configuredModel = process.env.KAIROS_MODEL;
  if (configuredModel) {
    return {
      model: configuredModel,
      thinkingLevel: 'low' as const,
      instructions,
      tools: kairosTools,
    };
  }

  const faux = registerFauxProvider({
    api: 'kairos-demo',
    provider: 'kairos-demo',
    models: [{ id: 'operations-guardian' }],
  });
  const responder = createDeterministicResponder();
  faux.setResponses(Array.from({ length: 80 }, () => responder));

  return {
    model: 'kairos-demo/operations-guardian',
    instructions,
    tools: kairosTools,
  };
});

function createDeterministicResponder() {
  return (context: {
    messages: Array<{
      role: string;
      content: unknown;
      toolName?: string;
      isError?: boolean;
    }>;
  }) => {
    const last = context.messages.at(-1);
    if (!last) return fauxAssistantMessage(fauxText('How can I help with governed operations?'));

    if (last.role === 'toolResult') {
      const text = extractText(last.content);
      if (last.isError) {
        return fauxAssistantMessage(
          fauxText(`The governance rail rejected that action: ${text}`),
        );
      }
      if (last.toolName === 'inspect_inventory') {
        const inventory = safeJson(text) as {
          assetId: string;
          label: string;
          available: number;
          onOrder: number;
          reorderPoint: number;
          targetLevel: number;
        };
        const quantity = Math.max(0, inventory.targetLevel - inventory.available - inventory.onOrder);
        if (quantity === 0 || inventory.available + inventory.onOrder >= inventory.reorderPoint) {
          return fauxAssistantMessage(
            fauxText(
              `${inventory.label} has sufficient effective stock. No proposal was created.`,
            ),
          );
        }
        return fauxAssistantMessage(
          fauxToolCall('propose_reorder', {
            assetId: inventory.assetId,
            quantity,
            reason: `Available stock ${inventory.available} is below reorder point ${inventory.reorderPoint}; restore target level ${inventory.targetLevel}.`,
          }),
          { stopReason: 'toolUse' },
        );
      }
      if (last.toolName === 'propose_reorder') {
        const proposal = safeJson(text) as { id: string; assetId: string; quantity: number };
        return fauxAssistantMessage(
          fauxText(
            `Created proposal ${proposal.id} for ${proposal.quantity} units of ${proposal.assetId}. No ERP write occurred. A human must approve it in the Policy Gate panel.`,
          ),
        );
      }
      if (last.toolName === 'list_active_proposals') {
        const proposals = safeJson(text) as Array<{ id: string; status: string }>;
        const approved = proposals.find((proposal) => proposal.status === 'approved');
        if (!approved) {
          const pending = proposals.find((proposal) => proposal.status === 'pending');
          return fauxAssistantMessage(
            fauxText(
              pending
                ? `Proposal ${pending.id} is still pending. Execution is blocked until a human approves it.`
                : 'There are no active proposals to execute.',
            ),
          );
        }
        return fauxAssistantMessage(
          fauxToolCall('execute_approved_reorder', { proposalId: approved.id }),
          { stopReason: 'toolUse' },
        );
      }
      if (last.toolName === 'execute_approved_reorder') {
        const proposal = safeJson(text) as { id: string; erpOrderId: string };
        return fauxAssistantMessage(
          fauxText(
            `Executed approved proposal ${proposal.id}. Simulated ERP order ${proposal.erpOrderId} was created with an idempotency key and provenance event.`,
          ),
        );
      }
      if (last.toolName === 'list_provenance_events') {
        const events = safeJson(text) as Array<{ sequence: number; eventType: string; actor: string }>;
        const summary = events
          .slice(0, 6)
          .map((event) => `#${event.sequence} ${event.eventType} by ${event.actor}`)
          .join('\n');
        return fauxAssistantMessage(
          fauxText(`Recent provenance events:\n${summary}`),
        );
      }
    }

    const prompt = extractText(last.content);
    if (/監査|証跡|provenance|audit/i.test(prompt)) {
      return fauxAssistantMessage(
        fauxToolCall('list_provenance_events', { limit: 12 }),
        { stopReason: 'toolUse' },
      );
    }
    if (/実行|発注して|execute/i.test(prompt)) {
      return fauxAssistantMessage(
        fauxToolCall('list_active_proposals', {}),
        { stopReason: 'toolUse' },
      );
    }
    if (/在庫|補充|不足|reorder|inventory/i.test(prompt)) {
      return fauxAssistantMessage(
        fauxToolCall('inspect_inventory', { assetId: 'motor-A' }),
        { stopReason: 'toolUse' },
      );
    }
    return fauxAssistantMessage(
      fauxText(
        'I can inspect inventory, create a governed replenishment proposal, execute it only after human approval, and explain the provenance trail.',
      ),
    );
  };
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return JSON.stringify(content);
  return content
    .map((block) => {
      if (block && typeof block === 'object' && 'text' in block) {
        return String((block as { text: unknown }).text);
      }
      return JSON.stringify(block);
    })
    .join('');
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
