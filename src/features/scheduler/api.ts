import { Hono } from 'hono';
import { workers, tasks } from '../../db/queries';

export const schedulerApi = new Hono<{ Bindings: CloudflareBindings }>();

schedulerApi.post('/schedule', async (c) => {
    const callerSecret = c.req.header('X-Worker-Secret');
    if (!callerSecret) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    let body: Record<string, unknown>;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: 'Invalid JSON payload' }, 400);
    }

    const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : null;
    const targetWorkerId = typeof body.targetWorkerId === 'string' ? body.targetWorkerId.trim() : null;
    const rawExecuteAt = typeof body.executeAt === 'string' ? body.executeAt.trim() : null;
    const payload = body.payload && typeof body.payload === 'object' ? JSON.stringify(body.payload) : null;

    if (!idempotencyKey || !targetWorkerId || !rawExecuteAt || !payload) {
        return c.json({ error: 'Missing required fields: idempotencyKey, targetWorkerId, executeAt, payload' }, 400);
    }

    const date = new Date(rawExecuteAt);
    if (isNaN(date.getTime())) {
        return c.json({ error: 'Invalid executeAt format. Use ISO 8601 string.' }, 400);
    }

    if (date.getTime() <= Date.now()) {
        return c.json({ error: 'executeAt must be a future date.' }, 400);
    }

    const executeAt = date.toISOString();

    const worker = await workers.getById(c.env.DB, targetWorkerId);
    if (!worker) {
        return c.json({ error: 'Target worker is not registered.' }, 404);
    }

    if (callerSecret !== worker.authSecret) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const isNew = await tasks.createIfNew(c.env.DB, {
        idempotencyKey,
        targetWorkerId,
        executeAt,
        payload
    });

    if (!isNew) {
        return c.json({ message: 'Task already scheduled.' }, 200);
    }

    return c.json({ message: 'Task scheduled successfully.' }, 201);
});
