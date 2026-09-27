import { tasks } from '../../db/queries';
import type { QueuePayload } from './queue';

export async function handleCron(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
    const matureTasks = await tasks.getMaturePending(env.DB);

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
        await env.DISPATCH_QUEUE.sendBatch(messages.slice(i, i + chunkSize));
    }

    const taskIds = matureTasks.map(t => t.idempotencyKey);
    await tasks.updateManyStatuses(env.DB, taskIds, 'QUEUED');
}
