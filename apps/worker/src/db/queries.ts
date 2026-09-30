import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { registeredWorkers, scheduledTasks, type TaskStatus } from './schema';

export type WorkerRecord = typeof registeredWorkers.$inferSelect;
export type TaskRecord = typeof scheduledTasks.$inferSelect;

const MATURE_TASK_BATCH_LIMIT = 500;

function db() {
    return drizzle(env.cron_icles);
}

export const workers = {
    async create(worker: Omit<WorkerRecord, 'createdAt'>): Promise<void> {
        await db().insert(registeredWorkers).values(worker);
    },

    async getById(id: string): Promise<WorkerRecord | null> {
        const result = await db()
            .select()
            .from(registeredWorkers)
            .where(eq(registeredWorkers.id, id))
            .limit(1);
        return result[0] ?? null;
    }
};

export const tasks = {
    async createIfNew(task: Omit<TaskRecord, 'createdAt' | 'updatedAt' | 'status'>): Promise<boolean> {
        const result = await db()
            .insert(scheduledTasks)
            .values({ ...task, status: 'PENDING' })
            .onConflictDoNothing()
            .run();
        return result.meta.changes > 0;
    },

    async getMaturePending(): Promise<TaskRecord[]> {
        return db()
            .select()
            .from(scheduledTasks)
            .where(
                and(
                    eq(scheduledTasks.status, 'PENDING'),
                    sql`unixepoch(${scheduledTasks.executeAt}) <= unixepoch()`
                )
            )
            .limit(MATURE_TASK_BATCH_LIMIT);
    },

    async updateStatus(idempotencyKey: string, status: TaskStatus): Promise<void> {
        await db()
            .update(scheduledTasks)
            .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(scheduledTasks.idempotencyKey, idempotencyKey));
    },

    async updateManyStatuses(idempotencyKeys: string[], status: TaskStatus): Promise<void> {
        if (idempotencyKeys.length === 0) return;
        await db()
            .update(scheduledTasks)
            .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(inArray(scheduledTasks.idempotencyKey, idempotencyKeys));
    }
};
