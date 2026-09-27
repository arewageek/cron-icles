import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { registeredWorkers, scheduledTasks, type TaskStatus } from './schema';

export type WorkerRecord = typeof registeredWorkers.$inferSelect;
export type TaskRecord = typeof scheduledTasks.$inferSelect;

const MATURE_TASK_BATCH_LIMIT = 500;

function db(d1: D1Database) {
    return drizzle(d1);
}

export const workers = {
    async create(d1: D1Database, worker: Omit<WorkerRecord, 'createdAt'>): Promise<void> {
        await db(d1).insert(registeredWorkers).values(worker);
    },

    async getById(d1: D1Database, id: string): Promise<WorkerRecord | null> {
        const result = await db(d1)
            .select()
            .from(registeredWorkers)
            .where(eq(registeredWorkers.id, id))
            .limit(1);
        return result[0] ?? null;
    }
};

export const tasks = {
    async createIfNew(d1: D1Database, task: Omit<TaskRecord, 'createdAt' | 'updatedAt' | 'status'>): Promise<boolean> {
        const result = await db(d1)
            .insert(scheduledTasks)
            .values({ ...task, status: 'PENDING' })
            .onConflictDoNothing()
            .run();
        return result.meta.changes > 0;
    },

    async getMaturePending(d1: D1Database): Promise<TaskRecord[]> {
        return db(d1)
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

    async updateStatus(d1: D1Database, idempotencyKey: string, status: TaskStatus): Promise<void> {
        await db(d1)
            .update(scheduledTasks)
            .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(scheduledTasks.idempotencyKey, idempotencyKey));
    },

    async updateManyStatuses(d1: D1Database, idempotencyKeys: string[], status: TaskStatus): Promise<void> {
        if (idempotencyKeys.length === 0) return;
        await db(d1)
            .update(scheduledTasks)
            .set({ status, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(inArray(scheduledTasks.idempotencyKey, idempotencyKeys));
    }
};
