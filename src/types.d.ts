import type { QueuePayload } from './features/engine/queue';

declare global {
    interface CloudflareBindings {
        DB: D1Database;
        DISPATCH_QUEUE: Queue<QueuePayload>;
        ADMIN_SECRET: string;
    }
}
