import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const registeredWorkers = sqliteTable('registered_workers', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    endpointUrl: text('endpoint_url').notNull(),
    authSecret: text('auth_secret').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const scheduledTasks = sqliteTable('scheduled_tasks', {
    idempotencyKey: text('idempotency_key').primaryKey(),
    targetWorkerId: text('target_worker_id')
        .notNull()
        .references(() => registeredWorkers.id, { onDelete: 'cascade' }),
    executeAt: text('execute_at').notNull(),
    payload: text('payload').notNull(),
    status: text('status').notNull().default('PENDING'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
