import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  goal: text("goal").notNull(),
  backstory: text("backstory").notNull(),
  tasks: jsonb("tasks").$type<string[]>().notNull(),
  order: integer("order").notNull().default(0),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  order: true,
}).extend({
  name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  role: z.string().min(1, "Role is required").max(200, "Role must be less than 200 characters"),
  goal: z.string().min(1, "Goal is required").max(1000, "Goal must be less than 1000 characters"),
  backstory: z.string().min(1, "Backstory is required").max(2000, "Backstory must be less than 2000 characters"),
  tasks: z.array(z.string().min(1, "Task cannot be empty").max(500, "Each task must be less than 500 characters"))
    .min(1, "At least one task is required")
    .max(50, "Maximum 50 tasks allowed per agent"),
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const executions = pgTable("executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull(),
  agentName: text("agent_name").notNull(),
  status: text("status").notNull(),
  result: text("result"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExecutionSchema = createInsertSchema(executions).omit({
  id: true,
  createdAt: true,
});

export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type Execution = typeof executions.$inferSelect;
