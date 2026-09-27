# Cron-icles 🕰️

**A Centralized Cloudflare Worker Scheduling Service**

Cron-icles (chronicles) is an independent, stateless Cloudflare Worker designed to manage scheduled jobs across an entire ecosystem of Cloudflare Workers. 

## The Problem
Cloudflare places strict limits on the number of Workers that can run scheduled jobs (Cron Triggers) within an account. As an ecosystem grows, hitting this limit prevents new services from executing time-based tasks.

## The Solution
Cron-icles acts as the definitive master scheduler. Instead of configuring Cron Triggers on individual workers, workers register themselves with Cron-icles and dynamically schedule tasks through it. When a scheduled time is reached, Cron-icles reliably dispatches a secure HTTP request containing a custom payload back to the target worker.

## Core Features
- **Centralized Scheduling:** Manage infinite scheduled jobs across unlimited workers from one central hub.
- **Strict Security:** Registration requires an Admin Secret. Job dispatching is cryptographically verified via a shared Worker Secret.
- **Idempotency:** Robust task creation ensures no job is saved twice, preventing duplicate executions at the source.
- **Guaranteed Dispatch & Backpressure:** Utilizes Cloudflare Queues to gracefully handle traffic spikes and dispatch massive bursts of scheduled events.
- **Automatic Retries:** If a target worker fails to respond (5xx or network error), Cron-icles automatically retries up to 3 times with exponential backoff before logging a permanent failure.

---

## 🚀 Deployment Guide (For Humans)

Cron-icles is built to be deployed instantly into your own Cloudflare account.

### 1. Prerequisites
- Node.js (v18+)
- Cloudflare Account
- Wrangler CLI installed globally (`npm i -g wrangler`) and authenticated (`wrangler login`)

### 2. Infrastructure Setup

Clone the repository and install dependencies:
```bash
git clone https://github.com/arewageek/cron-icles.git
cd cron-icles
npm install
```

Create a D1 Database:
```bash
npx wrangler d1 create cron-icles-db
```
*Take note of the `database_id` output by this command. Open `wrangler.jsonc` and replace `"REPLACE_WITH_YOUR_D1_DATABASE_ID"` with your actual ID.*

Apply Database Migrations:
```bash
# This creates the necessary tables in your remote D1 database
npx wrangler d1 execute cron-icles-db --remote --file=./migrations/0000_init_cron_icles_schema.sql
```

### 3. Security Setup

You must define an `ADMIN_SECRET`. This secret is required to register new workers with Cron-icles. **Do not put this in plain text.**
```bash
npx wrangler secret put ADMIN_SECRET
```
*(Enter a strong, random alphanumeric string when prompted.)*

### 4. Deploy

Deploy the service to your Cloudflare account:
```bash
npm run deploy
```
*(Note the deployed URL, e.g., `https://cron-icles.<your-subdomain>.workers.dev`)*

---

## 🛠 API Integration Guide (For Client Workers)

Once Cron-icles is running, your other Workers (Clients) can integrate with it.

### Step 1: Register a Target Worker
Before a worker can schedule jobs, an Administrator must whitelist it.

**Request:**
`POST https://<cron-icles-url>/api/workers/register`
- **Header:** `X-Admin-Secret: <YOUR_ADMIN_SECRET>`
- **Content-Type:** `application/json`

**Payload:**
```json
{
  "id": "my-billing-service",
  "name": "Billing Service Worker",
  "webhookUrl": "https://billing.my-app.workers.dev/internal/cron-handler",
  "authSecret": "super-secret-billing-key-123"
}
```
*(The `authSecret` is used by the Client Worker to prove its identity when scheduling, and for Cron-icles to prove its identity when dispatching.)*

### Step 2: Schedule a Task
Your registered Client Worker can now schedule events.

**Request:**
`POST https://<cron-icles-url>/api/tasks/schedule`
- **Header:** `X-Worker-Secret: super-secret-billing-key-123`
- **Content-Type:** `application/json`

**Payload:**
```json
{
  "idempotencyKey": "uuid-v4-or-unique-string",
  "targetWorkerId": "my-billing-service",
  "executeAt": "2026-10-31T23:59:00.000Z",
  "payload": {
    "action": "send_invoice",
    "invoiceId": "INV-789"
  }
}
```
*(Note: `executeAt` MUST be a future ISO 8601 string. `payload` can be any JSON object.)*

### Step 3: Handle the Dispatch
When `executeAt` matures, Cron-icles will `POST` back to your worker's `webhookUrl`.

**Cron-icles Request to your Worker:**
- **Method:** `POST`
- **Headers:** 
  - `X-Cron-Icles-Auth: super-secret-billing-key-123`
  - `X-Idempotency-Key: uuid-v4-or-unique-string`
- **Body:** `{ "action": "send_invoice", "invoiceId": "INV-789" }`

**Your Worker's Responsibility:**
1. **Verify Authenticity:** Ensure `X-Cron-Icles-Auth` matches your secret. If not, return `401`.
2. **Handle Idempotency:** Use `X-Idempotency-Key` to ensure you don't process the exact same event twice (in case of network retries).
3. **Acknowledge:** Return a `200 OK` status. If you return a `5xx` or timeout, Cron-icles will automatically retry up to 3 times before failing the job.

---
*Built for the modern Cloudflare ecosystem.*
