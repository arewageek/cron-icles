/// <reference path="../worker-configuration.d.ts" />

interface CloudflareBindings {
    DISPATCH_QUEUE: Queue<import('./features/engine/queue').QueuePayload>;
}

declare module 'cloudflare:workers' {
    export const env: CloudflareBindings;
    export const ctx: ExecutionContext;
}
