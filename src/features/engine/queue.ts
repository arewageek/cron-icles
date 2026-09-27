import { workers, tasks } from '../../db/queries';
import { QUEUE_MAX_RETRIES } from '../../constants';

export interface QueuePayload {
    idempotencyKey: string;
    targetWorkerId: string;
    payload: string;
}

export async function handleQueue(batch: MessageBatch<QueuePayload>, env: CloudflareBindings, ctx: ExecutionContext) {
    for (const message of batch.messages) {
        const { idempotencyKey, targetWorkerId, payload } = message.body;

        try {
            const worker = await workers.getById(env.DB, targetWorkerId);

            if (!worker) {
                console.error(`Worker ${targetWorkerId} not found. Failing task ${idempotencyKey}.`);
                await tasks.updateStatus(env.DB, idempotencyKey, 'FAILED');
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
                throw new Error(`Worker responded with ${response.status}`);
            }

            await tasks.updateStatus(env.DB, idempotencyKey, 'DISPATCHED');
            message.ack();

        } catch (error) {
            console.error(`Dispatch failed for task ${idempotencyKey}:`, error);

            // message.attempts is 1-indexed. After QUEUE_MAX_RETRIES attempts, mark as failed.
            if (message.attempts > QUEUE_MAX_RETRIES) {
                await tasks.updateStatus(env.DB, idempotencyKey, 'FAILED');
                message.ack();
            } else {
                message.retry();
            }
        }
    }
}
