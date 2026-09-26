# Product Vision: Cron-icles

## 1. Project Overview
**Cron-icles (chronicles)** is a highly specialized, centralized job-scheduling service built on Cloudflare Workers. 

**The Problem:** Cloudflare limits the number of individual Workers that can run Cron Triggers. In a microservice-heavy environment, an organization can quickly exhaust this limit, restricting their ability to execute time-based or recurring background tasks on new or specialized workers.

**The Solution:** Cron-icles abstracts the scheduling layer into a single, highly reliable independent service. It serves as the master clock for the entire ecosystem. Other workers do not rely on their own Cron Triggers; instead, they communicate with Cron-icles to schedule future tasks.

## 2. Core Business Logic & Workflows

### A. The Registration & Authorization System
To prevent abuse and ensure security, Cron-icles operates a strict closed-door policy.
- **The Logic:** A worker cannot simply ping Cron-icles and ask it to remember a task. The worker must first be officially registered and whitelisted within the Cron-icles ecosystem. 
- **The Why:** This guarantees that only trusted internal microservices can consume the scheduling resources and execute payloads, preventing malicious actors from triggering unauthorized background tasks.

### B. The Scheduling & Idempotency System
Registered workers send requests to Cron-icles to schedule a future event.
- **The Logic:** Every schedule request must be absolutely idempotent. Cron-icles verifies the uniqueness of the scheduling request (likely via an idempotency key) before saving it.
- **The Why:** Network latency, client retries, or systemic hiccups could cause a worker to send the same schedule request twice. Idempotency guarantees that a single intended task is only recorded—and thus executed—exactly once on the Cron-icles side.

### C. The Dispatch & Execution System
When the clock strikes the scheduled time, Cron-icles springs into action.
- **The Logic:** Cron-icles packages the target's original payload and sends a secure HTTP/RPC request to the target worker. 
- **The Why:** The target worker receives the exact context it needs to perform its task, entirely unaware of *how* it was scheduled, only that it is time to execute.

### D. The Resilience & Retry System
Network requests fail. A dispatched event might not reach the target worker, or the worker might be temporarily down.
- **The Logic:** Cron-icles requires an acknowledgment (ACK) response from the target worker upon successful delivery. If no ACK is received (timeout, 5xx error), Cron-icles queues the dispatch for a retry. **Crucially, retries are not indefinite.** If a task fails after a maximum number of retry attempts, it is permanently marked as a "failed job" and saved for administrative review.
- **The Why:** We must guarantee "at-least-once" delivery without causing infinite retry loops that could clog the queue. The target worker is ultimately responsible for ignoring duplicate deliveries during retries, but Cron-icles ensures the message is delivered diligently before eventually giving up and logging the failure.

### E. The Queue Management System
At any given second, thousands of scheduled jobs might mature simultaneously.
- **The Logic:** Rather than attempting to fire thousands of outbound HTTP requests synchronously (which would choke the worker and exceed limits), Cron-icles places mature jobs into an asynchronous Queue.
- **The Why:** Queues provide backpressure, automatic retries, and neat, controlled processing, ensuring the system remains completely stable regardless of scale.

## 3. Target Audience
- **Internal Microservices:** The direct consumers are other Cloudflare Workers within the organization's ecosystem that require deferred or recurring execution.
- **System Administrators/Developers:** The secondary audience who manages the worker registry, monitors queues, and observes system health.

## 4. Open Source & Future Ecosystem
Cron-icles is built with the intent of being **open-source**. 
- **The Vision:** Any developer hitting Cloudflare's Cron Trigger limits should be able to instantly deploy Cron-icles into their own Cloudflare account.
- **Agentic Documentation:** Post-development, a highly comprehensive documentation suite and a specialized **Agent Skill** will be written. This ensures that both humans and AI agents can effortlessly set up Cron-icles and understand precisely how to configure other client workers to query the scheduler, schedule jobs, and parse statuses correctly.