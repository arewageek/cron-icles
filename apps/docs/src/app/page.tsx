import React from 'react';
import { 
  ClockIcon, 
  ShieldCheckIcon, 
  ArrowPathRoundedSquareIcon, 
  ArrowsRightLeftIcon, 
  CommandLineIcon, 
  CpuChipIcon, 
  KeyIcon, 
  CircleStackIcon, 
  QueueListIcon 
} from '@heroicons/react/24/outline';
import { CodeBlock } from '../components/CodeBlock';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-100 selection:text-primary-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1.5 rounded-lg shadow-sm">
              <ClockIcon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Cron-icles</span>
          </div>
          <nav className="ml-auto hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#overview" className="hover:text-primary-600 transition-colors">Overview</a>
            <a href="#deployment" className="hover:text-primary-600 transition-colors">Deployment</a>
            <a href="#integration" className="hover:text-primary-600 transition-colors">Integration</a>
            <a href="https://github.com/arewageek/cron-icles" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-28 flex flex-col gap-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Getting Started</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                <li><a href="#overview" className="hover:text-primary-600 transition-colors">Introduction</a></li>
                <li><a href="#core-features" className="hover:text-primary-600 transition-colors">Core Features</a></li>
                <li><a href="#architecture" className="hover:text-primary-600 transition-colors">Architecture</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Operator Guide</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                <li><a href="#deployment" className="hover:text-primary-600 transition-colors">Deployment Setup</a></li>
                <li><a href="#security" className="hover:text-primary-600 transition-colors">Security Configuration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Developer Guide</h3>
              <ul className="flex flex-col gap-2.5 text-sm text-slate-600">
                <li><a href="#integration" className="hover:text-primary-600 transition-colors">Client Integration</a></li>
                <li><a href="#outbound-scheduling" className="hover:text-primary-600 transition-colors">Outbound Scheduling</a></li>
                <li><a href="#inbound-webhook" className="hover:text-primary-600 transition-colors">Inbound Webhook Handling</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <article className="prose prose-slate prose-headings:font-semibold prose-a:text-primary-600 hover:prose-a:text-primary-700 max-w-none">
            
            {/* Hero Section */}
            <div id="overview" className="not-prose mb-16">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                The Master Scheduler for Cloudflare Workers
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl">
                Cron-icles is an independent, stateless Cloudflare Worker designed to manage scheduled jobs across an entire ecosystem of microservices, bypassing platform limits on Cron Triggers.
              </p>
            </div>

            <hr className="my-12 border-slate-200" />

            <h2 id="the-problem">The Problem & Solution</h2>
            <p>
              Cloudflare places strict limits on the number of Workers that can run scheduled jobs (Cron Triggers) within a single account. As a microservice ecosystem grows, hitting this limit prevents new services from executing time-based or recurring background tasks.
            </p>
            <p>
              <strong>Cron-icles</strong> solves this by abstracting the scheduling layer into a single, highly reliable independent service. It acts as the definitive master clock. Instead of configuring Cron Triggers on individual workers, workers register themselves with Cron-icles and dynamically schedule tasks through its HTTP API.
            </p>

            <h2 id="core-features">Core Features</h2>
            <div className="not-prose grid sm:grid-cols-2 gap-6 my-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <QueueListIcon className="w-8 h-8 text-slate-900 mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-slate-900 mb-2">Centralized Scheduling</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Manage infinite scheduled jobs across unlimited workers from one central hub, freeing up account limits.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ShieldCheckIcon className="w-8 h-8 text-slate-900 mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-slate-900 mb-2">Strict Security</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Registration requires an Admin Secret. Job dispatching is cryptographically verified via a shared Worker Secret.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ArrowPathRoundedSquareIcon className="w-8 h-8 text-slate-900 mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-slate-900 mb-2">Idempotency Guaranteed</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Robust task creation ensures no job is saved twice, preventing duplicate executions at the source.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <ArrowsRightLeftIcon className="w-8 h-8 text-slate-900 mb-4" strokeWidth={1.5} />
                <h3 className="font-semibold text-slate-900 mb-2">Guaranteed Dispatch</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Utilizes Cloudflare Queues with exponential backoff retries to gracefully handle traffic spikes and network failures.</p>
              </div>
            </div>

            <h2 id="architecture">Architecture</h2>
            <p>
              Cron-icles operates entirely on Cloudflare's serverless infrastructure:
            </p>
            <ul>
              <li><strong>Framework:</strong> Hono (Ultra-fast web framework).</li>
              <li><strong>Database (D1):</strong> Stores the Worker Registry and pending tasks. Used for rapid, SQL-based maturity querying and idempotency checks.</li>
              <li><strong>Queueing (Cloudflare Queues):</strong> When the Cron Trigger fires every minute, mature tasks are offloaded to a Queue for asynchronous, backpressure-managed HTTP dispatching.</li>
            </ul>

            <hr className="my-12 border-slate-200" />

            <h2 id="deployment">Operator Guide: Deployment Setup</h2>
            <p>
              Cron-icles is built to be deployed instantly into your own Cloudflare account. It serves as an infrastructure primitive for your organization.
            </p>

            <h3>1. Prerequisites</h3>
            <ul>
              <li>Node.js (v18+)</li>
              <li>Cloudflare Account</li>
              <li>Wrangler CLI installed globally and authenticated</li>
            </ul>

            <h3>2. Infrastructure Provisioning</h3>
            <p>First, clone the repository and create the required D1 database:</p>
            <CodeBlock 
              language="bash"
              code="npx wrangler d1 create cron-icles-db"
            />
            <p>
              Take note of the <code>database_id</code> output by this command. Open <code>apps/worker/wrangler.jsonc</code> and replace the existing ID in the <code>d1_databases</code> section with your actual ID.
            </p>
            <p>Then, apply the database schema migrations to the remote D1 instance:</p>
            <CodeBlock 
              language="bash"
              code="npx wrangler d1 execute cron-icles-db --remote --file=./migrations/0000_init_cron_icles_schema.sql"
            />

            <h3 id="security">3. Security Configuration</h3>
            <p>
              You must define an <code>ADMIN_SECRET</code>. This secret is required to register new client workers with Cron-icles. <strong>Never commit this to version control.</strong>
            </p>
            <CodeBlock 
              language="bash"
              code="npx wrangler secret put ADMIN_SECRET"
            />

            <h3>4. Deployment</h3>
            <p>Deploy the service to your Cloudflare account using Turborepo:</p>
            <CodeBlock 
              language="bash"
              code="npm run deploy"
            />

            <hr className="my-12 border-slate-200" />

            <h2 id="integration">Developer Guide: Client Integration</h2>
            <p>
              Once Cron-icles is running, your other Workers (Clients) can integrate with it.
            </p>

            <h3>Step 1: Register a Target Worker</h3>
            <p>Before a worker can schedule jobs, an Administrator must whitelist it via the API.</p>
            
            <CodeBlock 
              language="json"
              title="POST /api/workers/register"
              subtitle="Header: X-Admin-Secret: <YOUR_ADMIN_SECRET>"
              code={`{
  "id": "my-billing-service",
  "name": "Billing Service Worker",
  "webhookUrl": "https://billing.my-app.workers.dev/internal/cron-handler",
  "authSecret": "super-secret-billing-key-123"
}`}
            />
            <p className="text-sm text-slate-500">
              <em>Note: The <code>authSecret</code> is used by the Client Worker to prove its identity when scheduling, and for Cron-icles to prove its identity when dispatching back.</em>
            </p>

            <h3 id="outbound-scheduling">Step 2: Schedule a Task (Outbound)</h3>
            <p>Your registered Client Worker can now schedule events.</p>
            
            <CodeBlock 
              language="json"
              title="POST /api/tasks/schedule"
              subtitle="Header: X-Worker-Secret: super-secret-billing-key-123"
              code={`{
  "idempotencyKey": "uuid-v4-or-unique-string",
  "targetWorkerId": "my-billing-service",
  "executeAt": "2026-10-31T23:59:00.000Z",
  "payload": {
    "action": "send_invoice",
    "invoiceId": "INV-789"
  }
}`}
            />

            <h3 id="inbound-webhook">Step 3: Handle the Dispatch (Inbound)</h3>
            <p>When <code>executeAt</code> matures, Cron-icles will POST back to your worker's <code>webhookUrl</code>.</p>
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm not-prose my-6">
              <h4 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <CommandLineIcon className="w-5 h-5 text-slate-900" strokeWidth={2} />
                Your Worker's Responsibility
              </h4>
              <ul className="space-y-5">
                <li className="flex gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 h-fit">
                    <KeyIcon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm mb-1">Verify Authenticity</strong>
                    <span className="text-slate-600 text-sm leading-relaxed">Ensure <code>X-Cron-Icles-Auth</code> matches your secret. If not, return <code>401</code>.</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 h-fit">
                    <CircleStackIcon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm mb-1">Handle Idempotency</strong>
                    <span className="text-slate-600 text-sm leading-relaxed">Use <code>X-Idempotency-Key</code> to ensure you don't process the exact same event twice (in case of network retries).</span>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 h-fit">
                    <CpuChipIcon className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
                  </div>
                  <div>
                    <strong className="block text-slate-900 text-sm mb-1">Acknowledge Processing</strong>
                    <span className="text-slate-600 text-sm leading-relaxed">Return a <code>200 OK</code> status. If you return a <code>5xx</code> or timeout, Cron-icles will automatically retry up to 3 times before failing the job permanently.</span>
                  </div>
                </li>
              </ul>
            </div>

            <p>
              <strong>Example Hono Implementation:</strong>
            </p>
            <CodeBlock 
              language="typescript"
              code={`app.post('/internal/cron-handler', async (c) => {
  const authHeader = c.req.header('X-Cron-Icles-Auth');
  if (!authHeader || authHeader !== c.env.CRON_ICLES_AUTH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const idempotencyKey = c.req.header('X-Idempotency-Key');
  const payload = await c.req.json();

  try {
    await processTaskLogic(payload.action, payload.userId);
    return c.json({ status: 'success' }, 200);
  } catch (error) {
    // Return 500 to trigger Cron-icles automatic retry logic
    return c.json({ error: 'Internal processing error' }, 500);
  }
});`}
            />

          </article>
        </main>
      </div>
    </div>
  );
}
