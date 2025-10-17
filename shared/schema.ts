import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Stores user authentication and profile data
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["student", "faculty"] }), // Nullable - set via role selection after first login
  department: varchar("department"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  notes: many(notes),
  submissionsAsStudent: many(submissions, { relationName: "studentSubmissions" }),
  submissionsAsFaculty: many(submissions, { relationName: "facultySubmissions" }),
  pdfs: many(pdfs),
}));

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Notes table
export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull().default(""),
  noteType: varchar("note_type", { enum: ["research", "code", "general"] }).notNull().default("general"),
  language: varchar("language"), // for code notes (e.g., "javascript", "python")
  isPublic: boolean("is_public").notNull().default(false),
  shareToken: varchar("share_token").unique(), // UUID for sharing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notesRelations = relations(notes, ({ one, many }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  citations: many(citations),
}));

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Citations table
export const citations = pgTable("citations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  noteId: varchar("note_id").notNull().references(() => notes.id, { onDelete: 'cascade' }),
  inputText: text("input_text").notNull(), // Original input (DOI, URL, or description)
  formattedCitation: text("formatted_citation").notNull(), // Generated citation
  citationStyle: varchar("citation_style", { enum: ["APA", "MLA", "IEEE"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const citationsRelations = relations(citations, ({ one }) => ({
  note: one(notes, {
    fields: [citations.noteId],
    references: [notes.id],
  }),
}));

export const insertCitationSchema = createInsertSchema(citations).omit({
  id: true,
  createdAt: true,
});

export type InsertCitation = z.infer<typeof insertCitationSchema>;
export type Citation = typeof citations.$inferSelect;

// Submissions table (for faculty to review student work)
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  facultyId: varchar("faculty_id").references(() => users.id, { onDelete: 'set null' }),
  assignmentName: varchar("assignment_name", { length: 500 }).notNull(),
  content: text("content").notNull(),
  fileUrls: text("file_urls").array().notNull().default(sql`ARRAY[]::text[]`),
  aiDetectionScore: integer("ai_detection_score"), // 0-100
  citationVerified: boolean("citation_verified").default(false),
  grade: varchar("grade", { length: 10 }),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const submissionsRelations = relations(submissions, ({ one }) => ({
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
    relationName: "studentSubmissions",
  }),
  faculty: one(users, {
    fields: [submissions.facultyId],
    references: [users.id],
    relationName: "facultySubmissions",
  }),
}));

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// PDFs table - Stores PDF documents shared by students
export const pdfs = pgTable("pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 500 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description"),
  s3Key: varchar("s3_key").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const pdfsRelations = relations(pdfs, ({ one }) => ({
  user: one(users, {
    fields: [pdfs.userId],
    references: [users.id],
  }),
}));

export const insertPdfSchema = createInsertSchema(pdfs).omit({
  id: true,
  uploadedAt: true,
});

export type InsertPdf = z.infer<typeof insertPdfSchema>;
export type Pdf = typeof pdfs.$inferSelect;
