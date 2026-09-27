import { workers, tasks } from '../../db/queries';
import { QUEUE_MAX_RETRIES } from '../../constants';

export interface QueuePayload {
    idempotencyKey: string;
    targetWorkerId: string;
    payload: string;
}

export async function handleQueue(batch: MessageBatch<QueuePayload>) {
    for (const message of batch.messages) {
        const { idempotencyKey, targetWorkerId, payload } = message.body;

        try {
            const worker = await workers.getById(targetWorkerId);

            if (!worker) {
                console.error(`Worker ${targetWorkerId} not found. Failing task ${idempotencyKey}.`);
                await tasks.updateStatus(idempotencyKey, 'FAILED');
                message.ack();
                continue;
            }

            const response = await fetch(worker.webhookUrl, {
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

            await tasks.updateStatus(idempotencyKey, 'DISPATCHED');
            message.ack();

        } catch (error) {
            console.error(`Dispatch failed for task ${idempotencyKey}:`, error);

            if (message.attempts > QUEUE_MAX_RETRIES) {
                await tasks.updateStatus(idempotencyKey, 'FAILED');
                message.ack();
            } else {
                message.retry();
            }
        }
    }
}
