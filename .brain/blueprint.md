# Technical Blueprint: Cron-icles

## 1. Technical Stack & Architecture
- **Framework**: [Hono](https://hono.dev/) - A small, fast, and ultrafast web framework for Cloudflare Workers.
- **Runtime**: Cloudflare Workers (Stateless).
- **Storage/Database**: Cloudflare D1 (Serverless SQL Database) for maintaining the Worker Registry, querying task maturities, and tracking idempotent task creations.
- **Queuing System**: Cloudflare Queues for asynchronous job dispatching, load smoothing, and automatic retries.
- **Cron Triggers**: Cloudflare Worker Scheduled events (e.g., `* * * * *`) acting as the heartbeat for Cron-icles to check for mature tasks.
- **State**: Strictly **Stateless**. All state regarding registered workers, pending jobs, and idempotency keys is persisted in Cloudflare infrastructure (D1/Queues).

## 2. Core Application Flows

### Flow 1: Worker Registration
1. **Admin Action**: An internal system or administrator registers a new worker (providing its secure endpoint, name, and an authentication secret).
2. **Storage**: Cron-icles saves this securely in its Registry (e.g., D1).
3. **Outcome**: The target worker is now authorized to send scheduling requests and receive dispatched events.

### Flow 2: Task Scheduling (Idempotent)
1. **Request**: A registered worker sends a `POST /schedule` request to Cron-icles containing:
   - `target_worker_id`
   - `execute_at` (Timestamp)
   - `payload` (JSON object)
   - `idempotency_key` (UUID/String)
2. **Authentication**: Cron-icles verifies the requesting worker is registered and authenticated.
3. **Idempotency Check**: Cron-icles queries the database for the `idempotency_key`. 
   - If it exists, return `200 OK` (Already scheduled/Processed).
   - If not, proceed.
4. **Storage**: The job is saved into the database with a `status: PENDING`.
5. **Response**: Cron-icles returns a success acknowledgment to the worker.

### Flow 3: The Heartbeat (Maturity Check)
1. **Trigger**: A Cloudflare Cron Trigger fires every minute (or highly frequent interval).
2. **Query**: Cron-icles queries the database for all tasks where `execute_at <= CURRENT_TIME` and `status == PENDING`.
3. **Queueing**: For each mature task, Cron-icles pushes the task data into a **Cloudflare Queue** and updates the database `status` to `QUEUED` (or deletes it if state doesn't need to be tracked long-term, though tracking is safer for audit).

### Flow 4: Queue Consumption & Dispatch (Retry Logic)
1. **Trigger**: The Cloudflare Queue invokes the Cron-icles Queue Consumer handler.
2. **Dispatch**: Cron-icles constructs a secure HTTP request containing the `payload` and sends it to the target worker's registered endpoint.
3. **Acknowledgment (ACK)**:
   - **Success (2xx)**: The target worker processed the event. The message is acknowledged, removed from the Queue, and the DB status is updated to `DISPATCHED`.
   - **Failure/Timeout**: The target worker did not respond correctly. Cron-icles throws an error, causing the Cloudflare Queue to automatically **retry** the message based on configured retry policies (e.g., exponential backoff).
   - **Max Retries Exceeded**: If the message hits the maximum allowed retries defined in the Queue settings, it is captured (via Dead Letter Queue or direct catch) and its status in D1 is updated to `FAILED` for administrative review.

## 3. Security & Resilience Standards
- **Service-to-Service Authentication**: All outgoing dispatches must be signed or include a shared secret so the receiving worker knows the request genuinely came from Cron-icles.
- **At-Least-Once Delivery**: The system relies on Cloudflare Queues for retry logic. Target workers MUST implement their own idempotency to handle potential duplicate dispatches from Cron-icles.
- **Statelessness**: The Cron-icles worker must not hold any in-memory state between requests. Everything must be strictly DB/Queue-driven to survive horizontal scaling and worker lifecycle restarts.

## 4. Database Schema Concept (High-Level)
*Assuming D1 (SQL) for robust querying:*

**Table: `registered_workers`**
- `id` (PK)
- `name`
- `endpoint_url`
- `auth_secret`
- `created_at`

**Table: `scheduled_tasks`**
- `idempotency_key` (PK)
- `target_worker_id` (FK)
- `execute_at` (Timestamp)
- `payload` (JSON)
- `status` (PENDING | QUEUED | DISPATCHED | FAILED)
- `created_at`
