---
name: cron-icles-integration
description: Guide for integrating a Cloudflare Worker client with a centralized Cron-icles scheduler service. Use this when the user wants to defer a task, schedule a future job, or handle scheduled cron events.
---

# Cron-icles Client Integration

You are an AI coding agent operating on a Cloudflare Worker project (the "Client Worker"). The user has requested to schedule future tasks, run delayed jobs, or implement cron functionality. Because of Cloudflare's limits on Cron Triggers, this organization uses **Cron-icles** as a centralized master scheduler.

Do NOT configure a `cron` trigger in the client's `wrangler.jsonc` unless explicitly told to bypass Cron-icles. Instead, you must integrate the Client Worker with the Cron-icles HTTP API.

## Core Concepts

Cron-icles acts as an external alarm clock. You tell it: *"I am Worker X. At Timestamp Y, send me back Payload Z."*

To achieve this, you must implement two flows in the Client Worker:
1. **The Outbound Scheduler:** Sending a secure HTTP `POST` to Cron-icles to schedule the job.
2. **The Inbound Webhook:** Exposing a secure HTTP route to receive the event when the time matures.

---

## 1. Outbound Scheduling

When you need to schedule a task in the future, construct an HTTP `POST` request to the Cron-icles instance.

### Prerequisites (Environment Variables)
The Client Worker must have the following environment variables configured (usually via `wrangler secret put`):
- `CRON_ICLES_URL`: The base URL of the Cron-icles service (e.g., `https://cron-icles.my-org.workers.dev`).
- `CRON_ICLES_WORKER_ID`: The registered ID of this Client Worker (e.g., `my-billing-worker`).
- `CRON_ICLES_AUTH_SECRET`: The shared secret used to authenticate with Cron-icles.

### The Schedule Request
Send a `POST` request to `${CRON_ICLES_URL}/api/tasks/schedule`.

**Required Headers:**
- `X-Worker-Secret`: Must match `CRON_ICLES_AUTH_SECRET`.
- `Content-Type`: `application/json`

**Payload Schema:**
```typescript
interface SchedulePayload {
  // A unique identifier for this specific task execution to prevent duplicates.
  // Generate a UUID or a deterministic hash.
  idempotencyKey: string; 
  
  // Must match CRON_ICLES_WORKER_ID
  targetWorkerId: string;
  
  // MUST be a future date in ISO 8601 format (e.g., "2026-12-31T23:59:00.000Z")
  executeAt: string;
  
  // Any JSON object containing the context the Client Worker will need when the task runs.
  payload: Record<string, unknown>;
}
```

### Example Implementation
```typescript
async function scheduleFutureTask(env: Env, userId: string, action: string, date: Date) {
  const response = await fetch(`${env.CRON_ICLES_URL}/api/tasks/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Worker-Secret': env.CRON_ICLES_AUTH_SECRET
    },
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      targetWorkerId: env.CRON_ICLES_WORKER_ID,
      executeAt: date.toISOString(),
      payload: { userId, action }
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to schedule task: ${await response.text()}`);
  }
}
```

---

## 2. Inbound Webhook Handling

Cron-icles will wake up at `executeAt` and send an HTTP `POST` back to the Client Worker's registered endpoint.

### Handling the Request
You must expose an endpoint (e.g., `POST /internal/cron-handler`).

**Security Requirements (CRITICAL):**
You MUST verify that the incoming request actually came from Cron-icles. Check the `X-Cron-Icles-Auth` header against `env.CRON_ICLES_AUTH_SECRET`. If it does not match or is missing, immediately return `401 Unauthorized`.

**Idempotency Handling:**
Cron-icles provides an `X-Idempotency-Key` header. Because network errors can cause Cron-icles to retry requests, you should ensure your logic is idempotent. If the action was already completed for that key, safely return `200 OK` without re-processing.

**Response Requirements:**
- Return `200 OK` (or any `2xx` status) upon successful processing. This tells Cron-icles to stop retrying.
- If you return `5xx` or the request times out, Cron-icles will automatically retry the dispatch up to 3 times with exponential backoff.

### Example Implementation (Hono)
```typescript
import { Hono } from 'hono';

const app = new Hono<{ Bindings: Env }>();

app.post('/internal/cron-handler', async (c) => {
  // 1. Verify Authenticity
  const authHeader = c.req.header('X-Cron-Icles-Auth');
  if (!authHeader || authHeader !== c.env.CRON_ICLES_AUTH_SECRET) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // 2. Extract Idempotency Key and Payload
  const idempotencyKey = c.req.header('X-Idempotency-Key');
  const payload = await c.req.json();

  // 3. Process the Task
  try {
    await processTaskLogic(payload.action, payload.userId);
    
    // 4. Acknowledge Success
    return c.json({ status: 'success' }, 200);
  } catch (error) {
    console.error(`Task ${idempotencyKey} failed:`, error);
    // Return 500 to trigger Cron-icles automatic retry logic
    return c.json({ error: 'Internal processing error' }, 500);
  }
});
```

## Summary Checklist for Agents
1. Did you check if the user provided `CRON_ICLES_URL`, `CRON_ICLES_WORKER_ID`, and `CRON_ICLES_AUTH_SECRET` in their environment?
2. Did you use an ISO 8601 string for `executeAt`?
3. Did you secure the inbound webhook endpoint with `X-Cron-Icles-Auth`?
4. Did you acknowledge successful executions with a `200` status?
