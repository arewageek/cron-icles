import { queries } from '../../db/queries';

export interface QueuePayload {
    idempotencyKey: string;
    targetWorkerId: string;
    payload: string;
}

export async function handleQueue(batch: MessageBatch<QueuePayload>, env: CloudflareBindings, ctx: ExecutionContext) {
    const MAX_RETRIES = 3;

    for (const message of batch.messages) {
        const { idempotencyKey, targetWorkerId, payload } = message.body;

        try {
            const worker = await queries.workers.getById(env.DB, targetWorkerId);
            
            if (!worker) {
                console.error(`Target worker ${targetWorkerId} not found for task ${idempotencyKey}.`);
                await queries.tasks.updateStatus(env.DB, idempotencyKey, 'FAILED');
                message.ack();
                continue;
            }

            const response = await fetch(worker.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Cron-Icles-Auth': worker.authSecret,
                    'X-Idempotency-Key': idempotencyKey
                },
                body: payload
            });

            if (!response.ok) {
                throw new Error(`Worker returned status: ${response.status}`);
            }

            await queries.tasks.updateStatus(env.DB, idempotencyKey, 'DISPATCHED');
            message.ack();

        } catch (error) {
            console.error(`Failed to dispatch task ${idempotencyKey}:`, error);

            if (message.attempts >= MAX_RETRIES) {
                console.error(`Max retries reached for task ${idempotencyKey}. Marking as FAILED.`);
                await queries.tasks.updateStatus(env.DB, idempotencyKey, 'FAILED');
                message.ack();
            } else {
                message.retry();
            }
        }
    }
}
