import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { clerkAuthMiddleware, isAuthenticated, getUserId } from "./clerkAuth";
import { insertNoteSchema, insertCitationSchema, insertSubmissionSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Clerk middleware - must be added before routes
  app.use(clerkAuthMiddleware);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user exists in our database
      let user = await storage.getUser(userId);
      
      // If user doesn't exist, sync from Clerk
      if (!user) {
        const { getClerkUser } = await import("./clerkAuth");
        const clerkUser = await getClerkUser(userId);
        
        user = await storage.upsertUser({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || null,
          firstName: clerkUser.firstName || null,
          lastName: clerkUser.lastName || null,
          profileImageUrl: clerkUser.imageUrl || null,
          role: null, // Will be set via role selection
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Role selection endpoint
  app.post("/api/auth/select-role", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { role } = req.body;
      
      if (!role || !["student", "faculty"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        role,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error selecting role:", error);
      res.status(500).json({ message: "Failed to select role" });
    }
  });

  // Notes routes
  app.get("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const notes = await storage.getNotesByUserId(userId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      // Check if user owns the note
      if (note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(note);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.get("/api/notes/shared/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const note = await storage.getNoteByShareToken(token);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found or not public" });
      }

      res.json(note);
    } catch (error) {
      console.error("Error fetching shared note:", error);
      res.status(500).json({ message: "Failed to fetch shared note" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const noteData = insertNoteSchema.parse({ ...req.body, userId });
      
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedNote = await storage.updateNote(id, req.body);
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteNote(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Share note endpoint
  app.post("/api/notes/:id/share", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { isPublic } = req.body;
      
      const note = await storage.getNoteById(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const shareToken = note.shareToken || randomUUID();
      const updatedNote = await storage.updateNote(id, {
        isPublic,
        shareToken,
      });

      res.json({
        shareUrl: isPublic ? `${req.protocol}://${req.hostname}/shared/${shareToken}` : null,
      });
    } catch (error) {
      console.error("Error sharing note:", error);
      res.status(500).json({ message: "Failed to share note" });
    }
  });

  // Citations routes
  app.get("/api/citations/:noteId", isAuthenticated, async (req, res) => {
    try {
      const { noteId } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.getNoteById(noteId);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }

      if (note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const citations = await storage.getCitationsByNoteId(noteId);
      res.json(citations);
    } catch (error) {
      console.error("Error fetching citations:", error);
      res.status(500).json({ message: "Failed to fetch citations" });
    }
  });

  app.post("/api/citations/generate", isAuthenticated, async (req, res) => {
    try {
      const { noteId, inputText, citationStyle } = req.body;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const note = await storage.getNoteById(noteId);
      if (!note || note.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Generate citation using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a citation generator. Generate a properly formatted ${citationStyle} citation based on the user's input. The input might be a DOI, URL, book title, or description. Return ONLY the formatted citation, nothing else.`,
          },
          {
            role: "user",
            content: `Generate a ${citationStyle} citation for: ${inputText}`,
          },
        ],
      });

      const formattedCitation = completion.choices[0].message.content || "";

      const citation = await storage.createCitation({
        noteId,
        inputText,
        formattedCitation,
        citationStyle,
      });

      res.json(citation);
    } catch (error) {
      console.error("Error generating citation:", error);
      res.status(500).json({ message: "Failed to generate citation" });
    }
  });

  // AI Writing Assistant routes
  app.post("/api/ai/improve", isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a writing assistant. Improve the following text for clarity, coherence, and professional academic tone. Return only the improved text.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const result = completion.choices[0].message.content || "";
      res.json({ result });
    } catch (error) {
      console.error("Error improving text:", error);
      res.status(500).json({ message: "Failed to improve text" });
    }
  });

  app.post("/api/ai/summarize", isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a summarization assistant. Create a concise summary of the following text while preserving key points. Return only the summary.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const result = completion.choices[0].message.content || "";
      res.json({ result });
    } catch (error) {
      console.error("Error summarizing text:", error);
      res.status(500).json({ message: "Failed to summarize text" });
    }
  });

  app.post("/api/ai/grammar", isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a grammar checker. Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text.",
          },
          {
            role: "user",
            content: text,
          },
        ],
      });

      const result = completion.choices[0].message.content || "";
      res.json({ result });
    } catch (error) {
      console.error("Error checking grammar:", error);
      res.status(500).json({ message: "Failed to check grammar" });
    }
  });

  // Faculty-only routes
  app.post("/api/faculty/detect-ai", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (user?.role !== "faculty") {
        return res.status(403).json({ message: "Faculty access required" });
      }

      const { content } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI content detector. Analyze the following text and determine the likelihood (0-100%) that it was AI-generated. Also provide specific indicators. Respond in JSON format: {"score": number, "indicators": string[]}`,
          },
          {
            role: "user",
            content,
          },
        ],
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"score": 0, "indicators": []}');
      res.json(result);
    } catch (error) {
      console.error("Error detecting AI:", error);
      res.status(500).json({ message: "Failed to detect AI" });
    }
  });

  app.post("/api/faculty/verify-citations", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (user?.role !== "faculty") {
        return res.status(403).json({ message: "Faculty access required" });
      }

      const { content, style } = req.body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a citation verifier. Extract all ${style} citations from the text and verify their authenticity. Respond in JSON format: {"results": [{"citation": string, "status": "verified"|"suspicious"|"fake", "details": string}]}`,
          },
          {
            role: "user",
            content,
          },
        ],
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"results": []}');
      res.json(result);
    } catch (error) {
      console.error("Error verifying citations:", error);
      res.status(500).json({ message: "Failed to verify citations" });
    }
  });

  // Submissions routes
  app.get("/api/submissions", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let submissions;
      if (user.role === "faculty") {
        submissions = await storage.getSubmissionsByFacultyId(userId);
      } else {
        submissions = await storage.getSubmissionsByStudentId(userId);
      }

      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get("/api/submissions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const submission = await storage.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Check if user has access (student who submitted or assigned faculty)
      if (submission.studentId !== userId && submission.facultyId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  app.post("/api/submissions", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        studentId: userId,
      });
      
      const submission = await storage.createSubmission(submissionData);
      res.json(submission);
    } catch (error) {
      console.error("Error creating submission:", error);
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  app.patch("/api/submissions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await storage.getUser(userId);
      
      const submission = await storage.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      // Only faculty can update submissions (for grading)
      if (user?.role !== "faculty" || submission.facultyId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const updatedSubmission = await storage.updateSubmission(id, {
        ...req.body,
        reviewedAt: new Date(),
      });
      res.json(updatedSubmission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
