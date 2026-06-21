import { registerProvider } from '@flue/runtime';
import { flue } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import {
  approveProposal,
  executeApprovedProposal,
  getDashboardState,
  rejectProposal,
  resetDemo,
} from './lib/kairos-store.ts';

if (!process.env.KAIROS_MODEL) {
  registerProvider('kairos-demo', {
    api: 'kairos-demo',
    baseUrl: '',
  });
}

const app = new Hono();

app.use('*', async (context, next) => {
  const started = performance.now();
  await next();
  const duration = Math.round(performance.now() - started);
  context.header('X-Kairos-Duration-Ms', String(duration));
});

app.get('/api/kairos/state', (context) => context.json(getDashboardState()));

app.post('/api/kairos/reset', (context) => context.json(resetDemo()));

app.post('/api/kairos/proposals/:id/approve', (context) => {
  try {
    return context.json(approveProposal(context.req.param('id')));
  } catch (error) {
    return context.json({ error: errorMessage(error) }, 409);
  }
});

app.post('/api/kairos/proposals/:id/reject', (context) => {
  try {
    return context.json(rejectProposal(context.req.param('id')));
  } catch (error) {
    return context.json({ error: errorMessage(error) }, 409);
  }
});

app.post('/api/kairos/proposals/:id/execute', (context) => {
  try {
    return context.json(executeApprovedProposal(context.req.param('id'), 'human-console'));
  } catch (error) {
    return context.json({ error: errorMessage(error) }, 409);
  }
});

app.route('/api/flue', flue());
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
