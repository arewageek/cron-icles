import { drizzle } from 'drizzle-orm/d1';
import { eq, lte, and, inArray, sql } from 'drizzle-orm';
import { registeredWorkers, scheduledTasks } from './schema';

export type WorkerRecord = typeof registeredWorkers.$inferSelect;
export type TaskRecord = typeof scheduledTasks.$inferSelect;

export const queries = {
    workers: {
        async create(db: D1Database, worker: Omit<WorkerRecord, 'createdAt'>): Promise<void> {
            const dbInstance = drizzle(db);
            await dbInstance.insert(registeredWorkers).values(worker);
        },
        async getById(db: D1Database, id: string): Promise<WorkerRecord | null> {
            const dbInstance = drizzle(db);
            const result = await dbInstance
                .select()
                .from(registeredWorkers)
                .where(eq(registeredWorkers.id, id))
                .limit(1);
            return result[0] || null;
        }
    },
    tasks: {
        async createIfNew(db: D1Database, task: Omit<TaskRecord, 'createdAt' | 'updatedAt' | 'status'>): Promise<boolean> {
            const dbInstance = drizzle(db);
            try {
                const result = await dbInstance
                    .insert(scheduledTasks)
                    .values({
                        ...task,
                        status: 'PENDING'
                    })
                    .onConflictDoNothing();
                
                return result.meta.changes > 0;
            } catch (error) {
                console.error('Error creating task:', error);
                return false;
            }
        },
        async getMaturePendingTasks(db: D1Database): Promise<TaskRecord[]> {
            const dbInstance = drizzle(db);
            return await dbInstance
                .select()
                .from(scheduledTasks)
                .where(
                    and(
                        eq(scheduledTasks.status, 'PENDING'),
                        lte(scheduledTasks.executeAt, sql`CURRENT_TIMESTAMP`)
                    )
                );
        },
        async updateStatus(db: D1Database, idempotencyKey: string, status: TaskRecord['status']): Promise<void> {
            const dbInstance = drizzle(db);
            await dbInstance
                .update(scheduledTasks)
                .set({ 
                    status, 
                    updatedAt: sql`CURRENT_TIMESTAMP` 
                })
                .where(eq(scheduledTasks.idempotencyKey, idempotencyKey));
        },
        async updateStatuses(db: D1Database, idempotencyKeys: string[], status: TaskRecord['status']): Promise<void> {
            const dbInstance = drizzle(db);
            if (idempotencyKeys.length === 0) return;
            await dbInstance
                .update(scheduledTasks)
                .set({ 
                    status, 
                    updatedAt: sql`CURRENT_TIMESTAMP` 
                })
                .where(inArray(scheduledTasks.idempotencyKey, idempotencyKeys));
        }
    }
};
