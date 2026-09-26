# Cron-icles 🕰️

**A Centralized Cloudflare Worker Scheduling Service**

Cron-icles (chronicles) is an independent, stateless Cloudflare Worker designed to manage scheduled jobs across an entire ecosystem of Cloudflare Workers. 

## The Problem
Cloudflare places strict limits on the number of Workers that can run scheduled jobs (Cron Triggers) within an account. As an ecosystem grows, hitting this limit prevents new services from executing time-based tasks.

## The Solution
Cron-icles acts as the definitive master scheduler. Instead of configuring Cron Triggers on individual workers, workers register themselves with Cron-icles and dynamically schedule tasks through it. When a scheduled time is reached, Cron-icles reliably dispatches a secure request containing the designated payload back to the target worker.

## Core Features
- **Centralized Scheduling:** Manage infinite scheduled jobs across unlimited workers from one central hub.
- **Worker Registration:** Secure whitelisting system ensuring only registered and authorized workers can schedule tasks.
- **Idempotency:** Robust task creation system ensuring no job is saved twice, preventing duplicate executions at the source.
- **Guaranteed Dispatch & Retry Logic:** Dispatches jobs securely to target workers and expects an acknowledgment. If a worker fails to respond, Cron-icles retries the dispatch until confirmed.
- **Queue-Based Processing:** Utilizes a queuing system to gracefully handle traffic spikes and dispatch massive bursts of scheduled events neatly and asynchronously.

## Documentation
For a deep dive into the business logic and technical architecture, please refer to the `.brain/` directory:
- [Business Logic & Vision (`.brain/vision.md`)](./.brain/vision.md)
- [Technical Architecture (`.brain/blueprint.md`)](./.brain/blueprint.md)
