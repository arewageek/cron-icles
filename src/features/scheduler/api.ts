import { Hono } from 'hono';
import { queries } from '../../db/queries';

export const schedulerApi = new Hono<{ Bindings: CloudflareBindings }>();

schedulerApi.post('/schedule', async (c) => {
    const body = await c.req.json();

    const idempotencyKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey : null;
    const targetWorkerId = typeof body.targetWorkerId === 'string' ? body.targetWorkerId : null;
    const executeAt = typeof body.executeAt === 'string' ? body.executeAt : null;
    const payload = body.payload ? JSON.stringify(body.payload) : null;

    if (!idempotencyKey || !targetWorkerId || !executeAt || !payload) {
        return c.json({ error: 'Missing required fields: idempotencyKey, targetWorkerId, executeAt, payload' }, 400);
    }

    const date = new Date(executeAt);
    if (isNaN(date.getTime())) {
        return c.json({ error: 'Invalid executeAt format. Use ISO 8601 string.' }, 400);
    }

    const worker = await queries.workers.getById(c.env.DB, targetWorkerId);
    if (!worker) {
        return c.json({ error: 'Target worker is not registered' }, 404);
    }

    const isNew = await queries.tasks.createIfNew(c.env.DB, {
        idempotencyKey,
        targetWorkerId,
        executeAt,
        payload
    });

    if (!isNew) {
        return c.json({ message: 'Task already scheduled (idempotent success)' }, 200);
    }

    return c.json({ message: 'Task scheduled successfully' }, 201);
});
