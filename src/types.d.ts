/// <reference path="../worker-configuration.d.ts" />

interface CloudflareBindings {
    DB: D1Database;
    DISPATCH_QUEUE: Queue<import('./features/engine/queue').QueuePayload>;
    ADMIN_SECRET: string;
}

declare module 'cloudflare:workers' {
    export const env: CloudflareBindings;
    export const ctx: ExecutionContext;
}
