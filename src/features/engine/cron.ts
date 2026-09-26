import { queries } from '../../db/queries';
import { QueuePayload } from './queue';

export async function handleCron(event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) {
    const matureTasks = await queries.tasks.getMaturePendingTasks(env.DB);
    
    if (matureTasks.length === 0) {
        return;
    }

    const messages = matureTasks.map(task => ({
        body: {
            idempotencyKey: task.idempotencyKey,
            targetWorkerId: task.targetWorkerId,
            payload: task.payload
        } as QueuePayload
    }));

    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
        const chunk = messages.slice(i, i + chunkSize);
        await env.DISPATCH_QUEUE.sendBatch(chunk);
    }

    const taskIds = matureTasks.map(t => t.idempotencyKey);
    await queries.tasks.updateStatuses(env.DB, taskIds, 'QUEUED');
}
