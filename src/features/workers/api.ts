import { Hono } from 'hono';
import { queries } from '../../db/queries';

export const workersApi = new Hono<{ Bindings: CloudflareBindings }>();

workersApi.post('/register', async (c) => {
    const body = await c.req.json();
    
    const id = typeof body.id === 'string' ? body.id : null;
    const name = typeof body.name === 'string' ? body.name : null;
    const endpointUrl = typeof body.endpointUrl === 'string' ? body.endpointUrl : null;
    const authSecret = typeof body.authSecret === 'string' ? body.authSecret : null;

    if (!id || !name || !endpointUrl || !authSecret) {
        return c.json({ error: 'Missing required fields: id, name, endpointUrl, authSecret' }, 400);
    }

    try {
        await queries.workers.create(c.env.DB, {
            id,
            name,
            endpointUrl,
            authSecret
        });

        return c.json({ message: 'Worker registered successfully', id }, 201);
    } catch (error) {
        console.error('Failed to register worker:', error);
        return c.json({ error: 'Failed to register worker, ID might already exist.' }, 500);
    }
});
