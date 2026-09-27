import { Hono } from 'hono';
import { workers } from '../../db/queries';

export const workersApi = new Hono<{ Bindings: CloudflareBindings }>();

function isValidUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
}

workersApi.post('/register', async (c) => {
    if (!c.env.ADMIN_SECRET) {
        return c.json({ error: 'Server configuration error: ADMIN_SECRET is not set.' }, 500);
    }

    const adminSecret = c.req.header('X-Admin-Secret');
    if (!adminSecret || adminSecret !== c.env.ADMIN_SECRET) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    let body: Record<string, unknown>;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: 'Invalid JSON payload' }, 400);
    }

    const id = typeof body.id === 'string' ? body.id.trim() : null;
    const name = typeof body.name === 'string' ? body.name.trim() : null;
    const endpointUrl = typeof body.endpointUrl === 'string' ? body.endpointUrl.trim() : null;
    const authSecret = typeof body.authSecret === 'string' ? body.authSecret.trim() : null;

    if (!id || !name || !endpointUrl || !authSecret) {
        return c.json({ error: 'Missing required fields: id, name, endpointUrl, authSecret' }, 400);
    }

    if (!isValidUrl(endpointUrl)) {
        return c.json({ error: 'endpointUrl must be a valid HTTP or HTTPS URL' }, 400);
    }

    try {
        await workers.create(c.env.DB, { id, name, endpointUrl, authSecret });
        return c.json({ message: 'Worker registered successfully', id }, 201);
    } catch (error) {
        console.error('Failed to register worker:', error);
        return c.json({ error: 'A worker with this ID already exists.' }, 409);
    }
});
