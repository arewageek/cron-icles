import { env } from 'cloudflare:workers';
import { tasks } from '../../db/queries';
import type { QueuePayload } from './queue';

export async function handleCron(event: ScheduledEvent) {
    const matureTasks = await tasks.getMaturePending();

    if (matureTasks.length === 0) return;

    const messages = matureTasks.map(task => ({
        body: {
            idempotencyKey: task.idempotencyKey,
            targetWorkerId: task.targetWorkerId,
            payload: task.payload
        } as QueuePayload
    }));

    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
        const chunkMessages = messages.slice(i, i + chunkSize);
        const chunkTaskIds = matureTasks.slice(i, i + chunkSize).map(t => t.idempotencyKey);

        await env.DISPATCH_QUEUE.sendBatch(chunkMessages);
        await tasks.updateManyStatuses(chunkTaskIds, 'QUEUED');
    }
}
