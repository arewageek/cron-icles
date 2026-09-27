import { Hono } from 'hono';
import { workersApi } from './features/workers/api';
import { schedulerApi } from './features/scheduler/api';
import { handleCron } from './features/engine/cron';
import { handleQueue, type QueuePayload } from './features/engine/queue';

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get('/', (c) => c.text('Cron-icles Scheduler is running.'));

app.route('/api/workers', workersApi);
app.route('/api/tasks', schedulerApi);

export default {
    fetch: app.fetch,

    scheduled: async (event: ScheduledEvent, env: CloudflareBindings, ctx: ExecutionContext) => {
        ctx.waitUntil(handleCron(event, env, ctx));
    },

    queue: async (batch: MessageBatch<QueuePayload>, env: CloudflareBindings, ctx: ExecutionContext) => {
        ctx.waitUntil(handleQueue(batch, env, ctx));
    }
};
