# AcademicFlow - Comprehensive Technical Documentation

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Data Models & Database Schema](#data-models--database-schema)
4. [Authentication System](#authentication-system)
5. [Citation Generation Logic](#citation-generation-logic)
6. [PDF Upload & AWS S3 Storage](#pdf-upload--aws-s3-storage)
7. [AI Detection Logic](#ai-detection-logic)
8. [Auto-Saving Feature](#auto-saving-feature)
9. [AI Writing Assistant Features](#ai-writing-assistant-features)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [Environment Variables](#environment-variables)
12. [Deployment Configuration](#deployment-configuration)

---

## Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1** - Modern JavaScript library for building user interfaces
- **TypeScript 5.6.3** - Static typing for enhanced developer experience and code quality
- **Vite 5.4.20** - Next-generation frontend build tool for fast development and optimized production builds

#### Routing & State Management
- **Wouter 3.3.5** - Lightweight client-side routing library (~1.3KB, alternative to React Router)
- **TanStack Query 5.60.5** - Powerful data synchronization library for server state management
  - Automatic caching and background refetching
  - Optimistic updates
  - Query invalidation strategies

#### UI Framework & Components
- **Radix UI** - Unstyled, accessible component primitives
  - Accordion, Alert Dialog, Aspect Ratio, Avatar
  - Checkbox, Collapsible, Context Menu, Dialog
  - Dropdown Menu, Hover Card, Label, Menubar
  - Navigation Menu, Popover, Progress, Radio Group
  - Scroll Area, Select, Separator, Slider
  - Switch, Tabs, Toast, Toggle, Tooltip
- **Shadcn/ui** - Re-usable components built on Radix UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Tailwind CSS v4.1.3 (Vite Plugin)** - Next-gen Tailwind with CSS-first configuration
- **Framer Motion 11.13.1** - Production-ready animation library for React

#### Editor Components
- **React Quill 2.0.0** - Rich text editor based on Quill.js
  - Lazy-loaded for performance optimization
  - WYSIWYG editor for research notes
- **CodeMirror 6** (`@uiw/react-codemirror 4.25.2`) - Versatile code editor
  - Language support: JavaScript, Python, Java, C++, HTML, CSS
  - Syntax highlighting with One Dark theme
  - Real-time code editing with syntax validation

#### Icons & Visual Elements
- **Lucide React 0.453.0** - Beautiful & consistent icon set (1000+ icons)
- **React Icons 5.4.0** - Popular icon library including company logos

#### Form Handling
- **React Hook Form 7.55.0** - Performant form library with easy validation
- **Zod 3.24.2** - TypeScript-first schema validation
- **@hookform/resolvers 3.10.0** - Validation resolvers for React Hook Form
- **Drizzle Zod 0.7.0** - Type-safe schema generation from Drizzle ORM

#### Additional Frontend Libraries
- **React Dropzone 14.3.8** - File upload with drag & drop
- **React Day Picker 8.10.1** - Date picker component
- **React Resizable Panels 2.1.7** - Resizable layout panels
- **Recharts 2.15.2** - Composable charting library
- **Embla Carousel React 8.6.0** - Lightweight carousel library
- **Date-fns 3.6.0** - Modern date utility library
- **Class Variance Authority 0.7.1** - Variant-based component styling
- **clsx 2.1.1** - Utility for constructing className strings
- **Tailwind Merge 2.6.0** - Merge Tailwind CSS classes without conflicts

### Backend Technologies

#### Server Framework
- **Node.js 20** - JavaScript runtime environment
- **Express 4.21.2** - Fast, minimalist web framework
- **TypeScript 5.6.3** - Type safety on the server
- **TSX 4.20.5** - TypeScript execution and REPL for Node.js

#### Database & ORM
- **PostgreSQL** - Production-grade relational database (via Neon serverless)
- **@neondatabase/serverless 0.10.4** - Serverless PostgreSQL driver
  - WebSocket-based connections
  - Connection pooling
  - Edge runtime compatible
- **Drizzle ORM 0.39.1** - TypeScript ORM with zero overhead
  - Type-safe queries
  - Automatic migrations
  - Schema introspection
- **Drizzle Kit 0.31.4** - Migration toolkit for Drizzle ORM

#### Authentication & Session Management
- **Express Session 1.18.2** - Session middleware for Express
  - HTTP-only cookies
  - Secure session storage
  - 7-day session expiration
- **Cookie Session 2.1.1** - Cookie-based session middleware (alternative option)

**Authentication Packages (Installed, Not Yet Configured):**
- **@clerk/clerk-react 5.52.0** - React components for Clerk authentication
- **@clerk/express 1.7.38** - Express middleware for Clerk authentication

#### File Upload & Storage
- **Multer 2.0.2** - Middleware for handling `multipart/form-data` (file uploads)
  - Memory storage configuration
  - 10MB file size limit
  - PDF-only file filter
- **AWS SDK for JavaScript v3**
  - **@aws-sdk/client-s3 3.911.0** - S3 client for file storage operations
  - **@aws-sdk/s3-request-presigner 3.911.0** - Generate pre-signed URLs for secure downloads

#### AI Integration
- **OpenAI 6.3.0** - Official OpenAI API client
  - GPT-5 model integration (released August 7, 2025)
  - Structured JSON responses
  - Chat completions API

#### Build & Development Tools
- **ESBuild 0.25.0** - Extremely fast JavaScript bundler for server-side code
- **Vite Plugins**:
  - **@vitejs/plugin-react 4.7.0** - Official React plugin for Vite
  - **@replit/vite-plugin-cartographer 0.3.1** - Replit-specific development features
  - **@replit/vite-plugin-dev-banner 0.1.1** - Development environment banner
  - **@replit/vite-plugin-runtime-error-modal 0.0.3** - Runtime error overlay

#### Utility Libraries
- **Memoizee 0.4.17** - Complete memoization/cache solution
- **WebSocket (ws) 8.18.0** - WebSocket implementation for Node.js
- **BufferUtil 4.0.8** - Buffer utilities for WebSocket performance optimization

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  React + TypeScript + Vite + TanStack Query                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Pages      │ │  Components  │ │   Hooks      │        │
│  │  - Landing   │ │  - UI (shadcn)│ │  - useAuth  │        │
│  │  - Editor    │ │  - Modals    │ │  - useToast │        │
│  │  - Dashboard │ │  - Forms     │ │  - Custom   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                        SERVER LAYER                          │
│        Express + TypeScript + Session Middleware            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  │  /api/auth/* | /api/notes/* | /api/citations/*       │  │
│  │  /api/submissions/* | /api/faculty/* | /api/pdfs/*   │  │
│  └──────────────────────────────────────────────────────┘  │
│                            ↕                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Storage Layer (Drizzle ORM)             │  │
│  │  - DatabaseStorage class with CRUD operations        │  │
│  │  - Type-safe database queries                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
┌──────────────────┐ ┌──────────────┐ ┌────────────────────┐
│   PostgreSQL     │ │  OpenAI API  │ │   AWS S3 Storage   │
│  (Neon Serverless)│ │   (GPT-5)   │ │   (PDF Files)      │
└──────────────────┘ └──────────────┘ └────────────────────┘
```

### Directory Structure

```
.
├── client/                    # Frontend React application
│   └── src/
│       ├── components/        # Reusable UI components
│       │   ├── ui/           # shadcn/ui components
│       │   ├── citation-modal.tsx
│       │   ├── ai-assistant-modal.tsx
│       │   └── ...
│       ├── hooks/            # Custom React hooks
│       │   ├── useAuth.ts
│       │   └── use-toast.ts
│       ├── lib/              # Utility functions
│       │   ├── queryClient.ts
│       │   ├── authUtils.ts
│       │   └── utils.ts
│       ├── pages/            # Route pages
│       │   ├── landing.tsx
│       │   ├── editor.tsx
│       │   ├── notes.tsx
│       │   ├── student-dashboard.tsx
│       │   ├── faculty-dashboard.tsx
│       │   ├── pdf-sharing.tsx
│       │   ├── ai-detect.tsx
│       │   ├── citation-check.tsx
│       │   ├── submissions.tsx
│       │   └── shared-note.tsx
│       ├── App.tsx           # Root component with routing
│       ├── main.tsx          # Entry point
│       └── index.css         # Global styles
│
├── server/                   # Backend Node.js application
│   ├── lib/
│   │   └── s3.ts            # AWS S3 utilities
│   ├── types/
│   │   └── session.ts       # TypeScript session types
│   ├── db.ts                # Database connection
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # API route handlers
│   ├── storage.ts           # Database storage layer
│   └── vite.ts              # Vite dev server setup
│
├── shared/                   # Shared code between client/server
│   └── schema.ts            # Database schema & Zod validators
│
├── attached_assets/          # Static assets
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── tailwind.config.ts       # Tailwind CSS configuration
```

### Request Flow

1. **Client Request**: User interacts with React component
2. **TanStack Query**: Manages request state, caching, and data fetching
3. **API Request**: HTTP request sent to Express server
4. **Authentication Middleware**: Session validation
5. **Route Handler**: Request processing in `server/routes.ts`
6. **Storage Layer**: Database operations via Drizzle ORM
7. **External Services**: Calls to OpenAI API or AWS S3 if needed
8. **Response**: JSON response sent back to client
9. **UI Update**: React component re-renders with new data

---

## Data Models & Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
│─────────────────│
│ id (PK)         │◄──────┐
│ email (unique)  │       │
│ password        │       │
│ firstName       │       │
│ lastName        │       │
│ profileImageUrl │       │
│ role            │       │ One-to-Many
│ department      │       │
│ createdAt       │       │
│ updatedAt       │       │
└─────────────────┘       │
        ▲                 │
        │                 │
        │ One-to-Many     │
        │                 │
┌─────────────────┐       │
│     NOTES       │       │
│─────────────────│       │
│ id (PK)         │       │
│ userId (FK) ────┼───────┘
│ title           │
│ content         │
│ noteType        │
│ language        │
│ isPublic        │
│ shareToken      │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        ▲
        │ One-to-Many
        │
┌─────────────────┐
│   CITATIONS     │
│─────────────────│
│ id (PK)         │
│ noteId (FK) ────┤
│ inputText       │
│ formattedCitation│
│ citationStyle   │
│ createdAt       │
└─────────────────┘

┌─────────────────┐
│  SUBMISSIONS    │
│─────────────────│
│ id (PK)         │
│ studentId (FK) ─┼──────► users.id
│ facultyId (FK) ─┼──────► users.id
│ assignmentName  │
│ content         │
│ fileUrls[]      │
│ aiDetectionScore│
│ citationVerified│
│ grade           │
│ feedback        │
│ submittedAt     │
│ reviewedAt      │
└─────────────────┘

┌─────────────────┐
│      PDFS       │
│─────────────────│
│ id (PK)         │
│ userId (FK) ────┼──────► users.id
│ title           │
│ subject         │
│ description     │
│ s3Key           │
│ fileName        │
│ fileSize        │
│ isPublic        │
│ uploadedAt      │
└─────────────────┘
```

### Table Definitions

#### Users Table
Stores user authentication information and profile data.

```typescript
{
  id: string (UUID, Primary Key),
  email: string (Unique, Not Null),
  password: string (Not Null),
  firstName: string (Nullable),
  lastName: string (Nullable),
  profileImageUrl: string (Nullable),
  role: "student" | "faculty" (Nullable - set after first login),
  department: string (Nullable),
  createdAt: timestamp (Default: now()),
  updatedAt: timestamp (Default: now())
}
```

**Purpose**: Core user identity and authentication. Supports two distinct roles:
- **Students**: Can create notes, share PDFs, receive AI writing help
- **Faculty**: Can detect AI content, verify citations, review submissions

**Indexing**: 
- Primary key on `id`
- Unique index on `email` for authentication lookup

#### Notes Table
Stores user-created notes with support for research, code, and general content.

```typescript
{
  id: string (UUID, Primary Key),
  userId: string (Foreign Key → users.id),
  title: string (Max 500 chars, Not Null),
  content: text (Not Null, Default: ""),
  noteType: "research" | "code" | "general" (Default: "general"),
  language: string (Nullable - for code notes),
  isPublic: boolean (Default: false),
  shareToken: string (UUID, Unique, Nullable),
  createdAt: timestamp (Default: now()),
  updatedAt: timestamp (Default: now())
}
```

**Purpose**: Core content storage with three specialized types:
- **Research Notes**: Rich text with citation support
- **Code Notes**: Syntax-highlighted code in multiple languages
- **General Notes**: Plain text or mixed content

**Features**:
- Public/private visibility control
- Unique share tokens for secure link sharing
- Language specification for code syntax highlighting

**Cascade Behavior**: Delete cascade when user is deleted

#### Citations Table
Stores AI-generated citations linked to research notes.

```typescript
{
  id: string (UUID, Primary Key),
  noteId: string (Foreign Key → notes.id),
  inputText: text (Not Null - original input),
  formattedCitation: text (Not Null - AI-generated citation),
  citationStyle: "APA" | "MLA" | "IEEE" (Not Null),
  createdAt: timestamp (Default: now())
}
```

**Purpose**: Manage academic citations within research notes
- Supports three major citation styles (APA, MLA, IEEE)
- Preserves original input (DOI, URL, or description)
- Stores AI-generated formatted citation

**Generation Process**:
1. User provides input (DOI, URL, book title, or description)
2. OpenAI GPT-5 generates properly formatted citation
3. Citation stored and linked to note

**Cascade Behavior**: Delete cascade when note is deleted

#### Submissions Table
Tracks student assignments submitted for faculty review.

```typescript
{
  id: string (UUID, Primary Key),
  studentId: string (Foreign Key → users.id),
  facultyId: string (Foreign Key → users.id, Nullable),
  assignmentName: string (Max 500 chars, Not Null),
  content: text (Not Null),
  fileUrls: string[] (Array, Default: []),
  aiDetectionScore: integer (0-100, Nullable),
  citationVerified: boolean (Default: false),
  grade: string (Max 10 chars, Nullable),
  feedback: text (Nullable),
  submittedAt: timestamp (Default: now()),
  reviewedAt: timestamp (Nullable)
}
```

**Purpose**: Faculty-student workflow for assignment submission and review
- AI detection scoring (0-100 scale)
- Citation verification tracking
- Grading and feedback system
- Support for multiple file attachments (stored in S3)

**Relationships**:
- Student: Many submissions per student
- Faculty: Many submissions per faculty reviewer

**Cascade Behavior**: 
- Delete cascade when student is deleted
- Set null when faculty is deleted (preserves submission history)

#### PDFs Table
Stores metadata for student-shared PDF documents.

```typescript
{
  id: string (UUID, Primary Key),
  userId: string (Foreign Key → users.id),
  title: string (Max 500 chars, Not Null),
  subject: string (Max 200 chars, Not Null),
  description: text (Nullable),
  s3Key: string (Not Null - S3 object key),
  fileName: string (Not Null),
  fileSize: integer (Not Null - bytes),
  isPublic: boolean (Default: true),
  uploadedAt: timestamp (Default: now())
}
```

**Purpose**: Student resource sharing system
- Subject-based categorization for easy discovery
- File metadata for display (name, size)
- S3 integration for actual file storage
- Public/private visibility control

**S3 Integration**:
- Actual PDF files stored in AWS S3
- `s3Key` references the S3 object location
- Signed URLs generated for secure downloads

**Cascade Behavior**: Delete cascade when user is deleted

---

## Authentication System

### Current Implementation: Session-Based Authentication

The application uses Express Session with HTTP-only cookies for secure session management.

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Application                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Login/Signup Form                                │  │
│  │  - Email input                                    │  │
│  │  - Password input                                 │  │
│  │  - First name / Last name (optional)             │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ POST /api/auth/signup
                          │ POST /api/auth/login
                          ▼
┌─────────────────────────────────────────────────────────┐
│               Express Server with Session                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Express-Session Middleware                       │  │
│  │  - Secret: SESSION_SECRET                         │  │
│  │  - Cookie: HTTP-only, 7-day expiration           │  │
│  │  - Secure: true (production)                      │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Session Storage                                  │  │
│  │  - req.session.userId = user.id                  │  │
│  │  - Persisted across requests                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Session Configuration

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    httpOnly: true,                                  // Prevents XSS attacks
    maxAge: 1000 * 60 * 60 * 24 * 7                 // 7 days
  }
}));
```

**Security Features**:
- HTTP-only cookies prevent JavaScript access (XSS protection)
- Secure flag in production (HTTPS only)
- Secret-based signing prevents cookie tampering
- 7-day expiration for security/convenience balance

#### Authentication Flow

**1. User Signup**
```
POST /api/auth/signup
Body: { email, password, firstName?, lastName? }

Flow:
1. Validate email and password presence
2. Check if user already exists (by email)
3. Create new user in database
4. Set session.userId = user.id
5. Return sanitized user object (password removed)
```

**2. User Login**
```
POST /api/auth/login
Body: { email, password }

Flow:
1. Validate email and password presence
2. Find user by email
3. Check password match (plain text comparison - development only)
4. Set session.userId = user.id
5. Return sanitized user object
```

**3. Get Current User**
```
GET /api/auth/user
Authorization: Session cookie

Flow:
1. Check req.session.userId
2. Return 401 if not authenticated
3. Fetch user from database
4. Return sanitized user object
```

**4. Role Selection**
```
POST /api/auth/select-role
Body: { role: "student" | "faculty" }
Authorization: Session cookie

Flow:
1. Verify user is authenticated
2. Validate role value
3. Update user.role in database
4. Return updated user object
```

**5. Logout**
```
POST /api/auth/logout
Authorization: Session cookie

Flow:
1. Destroy session (req.session.destroy())
2. Clear cookie (res.clearCookie('connect.sid'))
3. Return success response
```

#### Protected Route Pattern

All API routes check authentication:

```typescript
const userId = req.session?.userId;
if (!userId) {
  return res.status(401).json({ message: "Unauthorized" });
}
```

#### Authorization Patterns

**User Ownership Check**:
```typescript
const note = await storage.getNoteById(id);
if (note.userId !== userId) {
  return res.status(403).json({ message: "Forbidden" });
}
```

**Role-Based Access**:
```typescript
const user = await storage.getUser(userId);
if (user?.role !== "faculty") {
  return res.status(403).json({ message: "Faculty access required" });
}
```

#### Client-Side Authentication

**useAuth Hook**:
```typescript
export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError: !!error,
  };
}
```

**Protected Page Pattern**:
```typescript
const { isAuthenticated, isLoading } = useAuth();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
  }
}, [isAuthenticated, isLoading]);
```

### Security Considerations

**Current Implementation (Development)**:
- ⚠️ Plain text password storage (NOT for production)
- ⚠️ Simple password comparison (NOT for production)
- ✅ HTTP-only cookies
- ✅ Session-based authentication
- ✅ CSRF protection via same-origin policy

**Production Requirements**:
- Implement password hashing (bcrypt/argon2)
- Add rate limiting for login attempts
- Implement HTTPS in production
- Consider migrating to Clerk (packages already installed)

---

## Citation Generation Logic

### Overview

The citation generation system uses OpenAI's GPT-5 model to automatically create properly formatted academic citations from various input types (DOI, URL, book titles, or descriptions).

### Supported Citation Styles

1. **APA** - American Psychological Association
2. **MLA** - Modern Language Association
3. **IEEE** - Institute of Electrical and Electronics Engineers

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (React)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  CitationModal Component                           │  │
│  │  - Input: Text (DOI/URL/Description)               │  │
│  │  - Style selector: APA/MLA/IEEE                    │  │
│  │  - Generate button                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          │
                          │ POST /api/citations/generate
                          ▼
┌──────────────────────────────────────────────────────────┐
│               Backend Citation Service                    │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Validation                                        │  │
│  │  - Verify user owns the note                      │  │
│  │  - Check OpenAI API availability                  │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                                │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  OpenAI GPT-5 Integration                         │  │
│  │  - System prompt: Citation generation expert      │  │
│  │  - User prompt: Input text + style                │  │
│  │  - Model: gpt-5                                   │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                                │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Database Storage (PostgreSQL)                     │  │
│  │  - Save citation with note relationship           │  │
│  │  - Store original input and formatted result      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### API Endpoint

**POST** `/api/citations/generate`

**Request Body**:
```typescript
{
  noteId: string,           // UUID of the note
  inputText: string,        // DOI, URL, or description
  citationStyle: "APA" | "MLA" | "IEEE"
}
```

**Response**:
```typescript
{
  id: string,                    // Citation UUID
  noteId: string,                // Associated note
  inputText: string,             // Original input
  formattedCitation: string,     // AI-generated citation
  citationStyle: string,         // Selected style
  createdAt: string              // Timestamp
}
```

### Implementation Details

#### Server-Side Logic (server/routes.ts)

```typescript
app.post("/api/citations/generate", async (req, res) => {
  const { noteId, inputText, citationStyle } = req.body;
  const userId = req.session?.userId;
  
  // 1. Authentication check
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // 2. Verify note ownership
  const note = await storage.getNoteById(noteId);
  if (!note || note.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // 3. Check OpenAI API availability
  if (!openai) {
    return res.status(503).json({ 
      message: "OpenAI API is not configured" 
    });
  }

  // 4. Generate citation using GPT-5
  const completion = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are a citation generator. Generate a properly formatted ${citationStyle} citation based on the user's input. The input might be a DOI, URL, book title, or description. Return ONLY the formatted citation, nothing else.`
      },
      {
        role: "user",
        content: `Generate a ${citationStyle} citation for: ${inputText}`
      }
    ]
  });

  // 5. Extract formatted citation
  const formattedCitation = completion.choices[0].message.content || "";

  // 6. Save to database
  const citation = await storage.createCitation({
    noteId,
    inputText,
    formattedCitation,
    citationStyle
  });

  // 7. Return citation
  res.json(citation);
});
```

### OpenAI Prompt Engineering

**System Prompt Strategy**:
- Clear role definition: "You are a citation generator"
- Explicit style requirement: ${citationStyle}
- Input flexibility: DOI, URL, title, or description
- Output constraint: "Return ONLY the formatted citation"

**Why This Works**:
1. **Specificity**: Clear instructions reduce hallucinations
2. **Constraint**: "Only" ensures no extra commentary
3. **Flexibility**: Handles various input types (DOI, URL, etc.)
4. **Style awareness**: Model trained on citation format patterns

### Citation Retrieval

**GET** `/api/citations/:noteId`

Fetches all citations for a specific note:

```typescript
app.get("/api/citations/:noteId", async (req, res) => {
  const { noteId } = req.params;
  const userId = req.session?.userId;
  
  // Verify authentication and ownership
  const note = await storage.getNoteById(noteId);
  if (!note || note.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Fetch all citations for note
  const citations = await storage.getCitationsByNoteId(noteId);
  res.json(citations);
});
```

### Frontend Integration

**Citation Modal Component**:

```typescript
const generateCitationMutation = useMutation({
  mutationFn: async (data: {
    noteId: string;
    inputText: string;
    citationStyle: string;
  }) => {
    return await apiRequest("POST", "/api/citations/generate", data);
  },
  onSuccess: () => {
    // Invalidate cache to refresh citations list
    queryClient.invalidateQueries({ 
      queryKey: ["/api/citations", noteId] 
    });
    toast({
      title: "Citation generated",
      description: "Citation has been added to your note."
    });
  }
});
```

### Database Schema

Citations are stored with the following structure:

```sql
CREATE TABLE citations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id VARCHAR NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  formatted_citation TEXT NOT NULL,
  citation_style VARCHAR NOT NULL CHECK (citation_style IN ('APA', 'MLA', 'IEEE')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Indexing Strategy**:
- Primary key on `id` for direct lookups
- Foreign key index on `note_id` for note-based queries
- Cascade delete ensures citations are removed with notes

### Error Handling

1. **Authentication Errors**: 401 if user not logged in
2. **Authorization Errors**: 403 if user doesn't own the note
3. **Service Unavailable**: 503 if OpenAI API not configured
4. **API Errors**: 500 if OpenAI API call fails

### Example Citation Outputs

**Input**: "10.1038/nature12373"
**APA Output**: "Smith, J., & Johnson, K. (2013). Study title. *Nature*, 500(7463), 123-127. https://doi.org/10.1038/nature12373"

**Input**: "Thinking Fast and Slow by Daniel Kahneman"
**MLA Output**: "Kahneman, Daniel. *Thinking, Fast and Slow*. Farrar, Straus and Giroux, 2011."

**Input**: "https://www.nytimes.com/2024/01/15/technology/ai-education.html"
**IEEE Output**: "[1] Author, \"Article Title,\" *The New York Times*, Jan. 15, 2024. [Online]. Available: https://www.nytimes.com/2024/01/15/technology/ai-education.html"

---

## PDF Upload & AWS S3 Storage

### Overview

The PDF sharing system allows students to upload academic PDFs (notes, textbooks, study materials) and share them with other students. Files are stored in AWS S3 with metadata tracked in PostgreSQL.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   Frontend (React)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PDF Upload Component                                │  │
│  │  - React Dropzone (drag & drop)                      │  │
│  │  - File validation (PDF only, 10MB max)             │  │
│  │  - Form: title, subject, description                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          │ POST /api/pdfs/upload
                          │ (multipart/form-data)
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   Express Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Multer Middleware                                    │  │
│  │  - Memory storage                                    │  │
│  │  - 10MB file size limit                              │  │
│  │  - PDF mimetype filter                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  S3 Upload Service (server/lib/s3.ts)               │  │
│  │  - Generate unique S3 key                            │  │
│  │  - Upload to AWS S3 bucket                           │  │
│  │  - Store metadata in PostgreSQL                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                    AWS S3 Bucket                            │
│  Storage: PDF files with unique keys                       │
│  Access: Pre-signed URLs for downloads                     │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  Table: pdfs (metadata only)                               │
│  - id, userId, title, subject, description                 │
│  - s3Key, fileName, fileSize, isPublic                     │
└────────────────────────────────────────────────────────────┘
```

### AWS S3 Configuration

#### Environment Variables

```bash
AWS_ACCESS_KEY_ID=<your-access-key>
AWS_SECRET_ACCESS_KEY=<your-secret-key>
AWS_REGION=<bucket-region>  # e.g., us-east-1
AWS_S3_BUCKET_NAME=<bucket-name>
```

#### S3 Client Setup (server/lib/s3.ts)

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;
```

### File Upload Process

#### 1. Multer Configuration

```typescript
const upload = multer({
  storage: multer.memoryStorage(),  // Store in memory buffer
  limits: {
    fileSize: 10 * 1024 * 1024,    // 10MB maximum
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);               // Accept PDF
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});
```

**Why Memory Storage?**
- Files are small (10MB limit)
- Immediate processing and upload to S3
- No disk I/O overhead
- Automatic cleanup after request

#### 2. Upload Endpoint

**POST** `/api/pdfs/upload`

```typescript
app.post("/api/pdfs/upload", upload.single('file'), async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Get uploaded file from multer
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Parse form data
  const { title, subject, description } = req.body;

  // Generate unique S3 key
  const s3Key = `pdfs/${userId}/${Date.now()}-${file.originalname}`;

  // Upload to S3
  await uploadToS3({
    key: s3Key,
    body: file.buffer,              // File buffer from multer
    contentType: file.mimetype,
  });

  // Save metadata to database
  const pdf = await storage.createPdf({
    userId,
    title,
    subject,
    description,
    s3Key,
    fileName: file.originalname,
    fileSize: file.size,
    isPublic: true,
  });

  res.json(pdf);
});
```

#### 3. S3 Upload Function

```typescript
export async function uploadToS3({ key, body, contentType }: UploadParams): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;  // Return S3 key for database storage
}
```

**S3 Key Structure**: `pdfs/{userId}/{timestamp}-{originalFilename}`
- Namespace isolation by user
- Timestamp prevents filename collisions
- Original filename preserved for downloads

### File Download Process

#### 1. Generate Pre-Signed URL

Pre-signed URLs provide temporary, secure access to S3 objects without exposing AWS credentials.

```typescript
export async function getSignedDownloadUrl(
  key: string, 
  expiresIn: number = 3600  // 1 hour default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}
```

#### 2. Download Endpoint

**GET** `/api/pdfs/:id/download`

```typescript
app.get("/api/pdfs/:id/download", async (req, res) => {
  const { id } = req.params;
  
  // Fetch PDF metadata
  const pdf = await storage.getPdfById(id);
  if (!pdf) {
    return res.status(404).json({ message: "PDF not found" });
  }

  // Check access (public or owner)
  const userId = req.session?.userId;
  if (!pdf.isPublic && pdf.userId !== userId) {
    return res.status(403).json({ message: "Access denied" });
  }

  // Generate pre-signed URL (1 hour expiration)
  const downloadUrl = await getSignedDownloadUrl(pdf.s3Key, 3600);

  // Return URL for client to download
  res.json({ downloadUrl });
});
```

**Security Features**:
- Pre-signed URLs expire after 1 hour
- Access control based on `isPublic` flag
- Owner always has access to their files
- URLs can't be guessed (signed with AWS secret)

### File Deletion Process

```typescript
export async function deleteFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}
```

**DELETE** `/api/pdfs/:id`

```typescript
app.delete("/api/pdfs/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.session?.userId;
  
  // Verify ownership
  const pdf = await storage.getPdfById(id);
  if (!pdf || pdf.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Delete from S3
  await deleteFromS3(pdf.s3Key);

  // Delete metadata from database
  await storage.deletePdf(id);

  res.json({ success: true });
});
```

### Frontend Integration

#### File Upload with React Dropzone

```typescript
const uploadMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    const response = await fetch("/api/pdfs/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/pdfs"] });
    toast({ title: "PDF uploaded successfully" });
  }
});

// Handle file drop
const onDrop = useCallback((acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", title);
  formData.append("subject", subject);
  formData.append("description", description);
  
  uploadMutation.mutate(formData);
}, [title, subject, description]);
```

### Database Schema

```sql
CREATE TABLE pdfs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT,
  s3_key VARCHAR NOT NULL,        -- S3 object key
  file_name VARCHAR NOT NULL,     -- Original filename
  file_size INTEGER NOT NULL,     -- Size in bytes
  is_public BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### Cost Optimization

1. **File Size Limit**: 10MB maximum reduces storage costs
2. **Pre-Signed URLs**: No proxying through server (bandwidth savings)
3. **Lifecycle Policies** (recommended): Auto-delete old files after X days
4. **Compression** (future): Compress PDFs before upload

### Error Handling

1. **File Too Large**: 413 error if file exceeds 10MB
2. **Wrong File Type**: 400 error if not PDF
3. **S3 Upload Failure**: 500 error with retry logic (future)
4. **Missing Credentials**: 503 error if AWS not configured

---

## AI Detection Logic

### Overview

The AI Detection system analyzes text submissions to determine the likelihood of AI-generated content. It combines OpenAI's GPT-5 analysis with pattern-based fallback detection.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│                Faculty Dashboard (React)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Detection Interface                              │  │
│  │  - Text input area (min 50 chars)                    │  │
│  │  - "Analyze" button                                  │  │
│  │  - Results display with score & indicators           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          │ POST /api/faculty/detect-ai
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   Express Server                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Role Check: Faculty Only                            │  │
│  │  - Verify user.role === "faculty"                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│               ┌──────────┴──────────┐                       │
│               │                     │                       │
│               ▼                     ▼                       │
│  ┌─────────────────────┐  ┌──────────────────────────┐    │
│  │  OpenAI GPT-5       │  │  Fallback Detection      │    │
│  │  (if configured)    │  │  (pattern-based)         │    │
│  │                     │  │                          │    │
│  │  - 7 AI indicators  │  │  - Sentence analysis     │    │
│  │  - Confidence score │  │  - Generic phrases       │    │
│  │  - JSON response    │  │  - Personal voice check  │    │
│  └─────────────────────┘  └──────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pattern Analysis Enhancement                        │  │
│  │  - Sentence length statistics                        │  │
│  │  - AI-common phrase detection                        │  │
│  │  - Personal pronoun usage                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Two-Tier Detection System

#### Tier 1: OpenAI GPT-5 Analysis (Primary)

When OpenAI API is configured, the system uses GPT-5 for sophisticated AI detection.

**Endpoint**: POST `/api/faculty/detect-ai`

**Request**:
```typescript
{
  content: string  // Text to analyze (min 50 characters)
}
```

**OpenAI Prompt Engineering**:

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-5",
  messages: [
    {
      role: "system",
      content: `You are an expert AI content detector. Analyze the given text and determine the likelihood it was written by AI (like ChatGPT, GPT-4, Claude, etc.).

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text.

Analyze these specific indicators:
1. Sentence Structure Uniformity: AI text often has very consistent sentence lengths and patterns
2. Vocabulary Patterns: Check for overly formal academic language or generic phrases like "it is important to note", "furthermore", "in conclusion", "delve into", "robust", "comprehensive"
3. Personal Voice: Lack of personal pronouns (I, me, my) or personal anecdotes suggests AI
4. Error Patterns: Perfect grammar with no typos is suspicious (humans make mistakes)
5. Depth of Knowledge: Superficial coverage of topics with generic examples suggests AI
6. Creativity: Lack of unique metaphors, jokes, or unconventional thinking suggests AI
7. Repetition: AI often repeats similar phrases or sentence structures

Return your analysis as a JSON object with this EXACT structure:
{
  "aiScore": <number 0-100>,
  "confidence": "<HIGH|MEDIUM|LOW>",
  "reasoning": "<brief explanation>",
  "indicators": [<array of specific indicators found>],
  "humanLikelihood": <number 0-100>
}`
    },
    {
      role: "user",
      content: `Analyze this text for AI-generated content:\n\n${content}\n\nRemember: Respond ONLY with valid JSON.`
    }
  ],
  response_format: { type: "json_object" }
});
```

**Why GPT-5 for Detection?**
1. **Meta-Learning**: AI models can recognize their own patterns
2. **Contextual Understanding**: Detects subtle writing style inconsistencies
3. **Latest Training**: GPT-5 knows modern AI writing patterns
4. **JSON Mode**: Structured responses for reliable parsing

#### Tier 2: Pattern-Based Fallback Detection

When OpenAI API is unavailable, a comprehensive pattern analysis system activates.

**Analysis Functions**:

```typescript
function analyzeTextPatterns(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const words = text.split(/\s+/);
  
  // 1. Sentence length statistics
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => 
    sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  
  // 2. AI-common phrases detection
  const aiPhrases = [
    'it is important to note',
    'furthermore',
    'in conclusion',
    'however, it is worth noting',
    'delve into',
    'robust',
    'comprehensive',
    'leverage',
    'paramount',
    'multifaceted'
  ];
  
  const phrasesFound = aiPhrases.filter(phrase => 
    text.toLowerCase().includes(phrase)
  );
  
  // 3. Personal voice detection
  const personalPronouns = (text.match(/\b(I|my|me|we|us|our)\b/gi) || []).length;
  const personalVoiceScore = (personalPronouns / words.length) * 100;
  
  return {
    averageSentenceLength: Math.round(avgLength * 10) / 10,
    sentenceLengthVariation: variance < 10 ? 'LOW' : variance < 30 ? 'MEDIUM' : 'HIGH',
    genericPhraseCount: phrasesFound.length,
    genericPhrasesFound: phrasesFound,
    personalPronounUsage: personalVoiceScore > 2,
    personalVoiceScore: Math.round(personalVoiceScore * 100) / 100
  };
}
```

**Scoring Algorithm**:

```typescript
function fallbackDetection(text: string) {
  const patterns = analyzeTextPatterns(text);
  
  let score = 0;
  const indicators = [];
  
  // Uniform sentence lengths (+30 points)
  if (patterns.sentenceLengthVariation === 'LOW') {
    score += 30;
    indicators.push('Highly uniform sentence lengths');
  }
  
  // Generic AI phrases (+25 points)
  if (patterns.genericPhraseCount >= 3) {
    score += 25;
    indicators.push(`Found ${patterns.genericPhraseCount} AI-common phrases`);
  }
  
  // Lacks personal voice (+20 points)
  if (!patterns.personalPronounUsage) {
    score += 20;
    indicators.push('Lacks personal voice and pronouns');
  }
  
  // Long complex sentences (+15 points)
  if (patterns.averageSentenceLength > 20) {
    score += 15;
    indicators.push('Consistently long, complex sentences');
  }
  
  // Perfect formatting (+10 points)
  if (!text.match(/\s{2,}/) && !text.match(/\.\./)) {
    score += 10;
    indicators.push('Perfect formatting with no typos');
  }
  
  return {
    aiScore: Math.min(score, 100),
    likelihood: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW',
    confidence: 'LOW',
    indicators: indicators,
    details: {
      ...patterns,
      reasoning: 'Using fallback pattern detection (OpenAI API unavailable)'
    }
  };
}
```

### Response Format

**Success Response**:
```typescript
{
  aiScore: number,              // 0-100 likelihood score
  likelihood: string,           // "HIGH" | "MEDIUM" | "LOW"
  confidence: string,           // "HIGH" | "MEDIUM" | "LOW"
  indicators: string[],         // List of detected AI indicators
  details: {
    averageSentenceLength: number,
    sentenceLengthVariation: string,
    genericPhraseCount: number,
    genericPhrasesFound: string[],
    personalPronounUsage: boolean,
    personalVoiceScore: number,
    reasoning: string,
    humanLikelihood: number     // Only with GPT-5
  }
}
```

**Example Response (High AI Likelihood)**:
```json
{
  "aiScore": 87,
  "likelihood": "HIGH",
  "confidence": "HIGH",
  "indicators": [
    "Highly uniform sentence structure",
    "Excessive use of transition phrases",
    "Lack of personal anecdotes or experiences",
    "Generic academic vocabulary"
  ],
  "details": {
    "averageSentenceLength": 22.4,
    "sentenceLengthVariation": "LOW",
    "genericPhraseCount": 5,
    "genericPhrasesFound": ["furthermore", "it is important to note", "comprehensive"],
    "personalPronounUsage": false,
    "personalVoiceScore": 0.3,
    "reasoning": "Text exhibits multiple AI writing patterns including uniform structure, generic phrasing, and lack of personal voice",
    "humanLikelihood": 13
  }
}
```

### Integration with Submissions

AI detection scores can be saved with student submissions:

```typescript
// Update submission with AI score
app.patch("/api/submissions/:id", async (req, res) => {
  const { aiDetectionScore } = req.body;
  
  const submission = await storage.updateSubmission(id, {
    aiDetectionScore,
    reviewedAt: new Date()
  });
  
  res.json(submission);
});
```

### Frontend Display

```typescript
const DetectionResults = ({ result }) => (
  <div>
    <div className="score">
      AI Likelihood: {result.likelihood} ({result.aiScore}%)
    </div>
    <div className="confidence">
      Confidence: {result.confidence}
    </div>
    <div className="indicators">
      <h3>Detected Indicators:</h3>
      <ul>
        {result.indicators.map((indicator, i) => (
          <li key={i}>{indicator}</li>
        ))}
      </ul>
    </div>
    <div className="details">
      <p>Average Sentence Length: {result.details.averageSentenceLength} words</p>
      <p>Sentence Variation: {result.details.sentenceLengthVariation}</p>
      <p>Generic Phrases: {result.details.genericPhraseCount}</p>
      <p>Personal Voice: {result.details.personalVoiceScore}%</p>
    </div>
  </div>
);
```

### Accuracy & Limitations

**Strengths**:
- Multi-indicator analysis (7 factors)
- Dual-tier system (AI + pattern-based)
- Detailed explanations for transparency
- Works without OpenAI API (fallback mode)

**Limitations**:
- Not 100% accurate (no AI detector is)
- Can produce false positives for formal academic writing
- Cannot detect sophisticated AI + human editing
- Should be used as one data point, not sole evidence

**Best Practices**:
1. Use as supplementary evidence, not primary
2. Review full submission context
3. Combine with citation verification
4. Consider student's writing history
5. Have conversations with students about results

---

## Auto-Saving Feature

### Overview

The auto-saving system automatically persists note changes to the database without requiring manual saves, providing a seamless writing experience similar to Google Docs or Notion.

### Architecture

```
┌────────────────────────────────────────────────────────────┐
│              Editor Component (React)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Types in Editor                                │  │
│  │  - Title input                                       │  │
│  │  - Content editor (Quill/CodeMirror)                │  │
│  │  - Note type selector                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ onChange event                   │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React State Updates                                 │  │
│  │  - setTitle(newTitle)                                │  │
│  │  - setContent(newContent)                            │  │
│  │  - setNoteType(newType)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ Triggers useEffect               │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Debounced Auto-Save (useEffect)                     │  │
│  │  - Wait 1 second after last change                   │  │
│  │  - Compare with original note data                   │  │
│  │  - Trigger mutation if changed                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ PATCH /api/notes/:id             │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  TanStack Query Mutation                             │  │
│  │  - updateMutation.mutate()                           │  │
│  │  - Optimistic updates (optional)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP PATCH
                          ▼
┌────────────────────────────────────────────────────────────┐
│                   Express Server                            │
│  PATCH /api/notes/:id                                      │
│  - Validate user ownership                                 │
│  - Update database via Drizzle ORM                         │
│  - Set updatedAt timestamp                                 │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                PostgreSQL Database                          │
│  UPDATE notes SET                                          │
│    title = ?, content = ?, note_type = ?,                  │
│    updated_at = NOW()                                      │
│  WHERE id = ?                                              │
└────────────────────────────────────────────────────────────┘
```

### Implementation Details

#### Frontend Auto-Save Logic

**File**: `client/src/pages/editor.tsx`

```typescript
export default function Editor() {
  // State management
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<"research" | "code" | "general">("general");
  const [language, setLanguage] = useState("javascript");
  const [isPublic, setIsPublic] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fetch current note data
  const { data: note } = useQuery<Note>({
    queryKey: ["/api/notes", noteId],
    enabled: !!noteId,
  });

  // Initialize state from fetched note
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setNoteType(note.noteType);
      setLanguage(note.language || "javascript");
      setIsPublic(note.isPublic);
    }
  }, [note]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Note>) => {
      return await apiRequest("PATCH", `/api/notes/${noteId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] });
      setLastSaved(new Date());  // Update "last saved" timestamp
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        // Handle authentication errors
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  // Auto-save with debounce
  useEffect(() => {
    if (!note) return;  // Don't save if note hasn't loaded
    
    const timer = setTimeout(() => {
      // Check if any field has changed
      const hasChanges = 
        title !== note.title || 
        content !== note.content || 
        noteType !== note.noteType || 
        language !== note.language || 
        isPublic !== note.isPublic;
      
      if (hasChanges) {
        updateMutation.mutate({ 
          title, 
          content, 
          noteType, 
          language, 
          isPublic 
        });
      }
    }, 1000);  // 1 second debounce

    // Cleanup timer on unmount or state change
    return () => clearTimeout(timer);
  }, [title, content, noteType, language, isPublic]);

  return (
    <div>
      {/* Show last saved time */}
      {lastSaved && (
        <p className="text-sm text-muted-foreground">
          Last saved: {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </p>
      )}
      
      {/* Editor UI... */}
    </div>
  );
}
```

### Key Concepts

#### 1. Debouncing

**Why 1 Second?**
- **Too Short** (100-300ms): Excessive API calls, poor performance
- **Too Long** (5+ seconds): Feels unresponsive, risk of data loss
- **1 Second**: Sweet spot for perceived responsiveness

**How It Works**:
```typescript
const timer = setTimeout(() => {
  // Save logic
}, 1000);

return () => clearTimeout(timer);  // Cancel if user types again
```

Every keystroke:
1. Cancels previous timer
2. Starts new 1-second timer
3. Only saves after 1 second of no typing

#### 2. Change Detection

```typescript
const hasChanges = 
  title !== note.title || 
  content !== note.content || 
  noteType !== note.noteType || 
  language !== note.language || 
  isPublic !== note.isPublic;

if (hasChanges) {
  updateMutation.mutate({ title, content, noteType, language, isPublic });
}
```

**Why Check for Changes?**
- Avoid unnecessary API calls
- Reduce database writes
- Prevent infinite update loops

#### 3. Dependencies Array

```typescript
useEffect(() => {
  // Auto-save logic
}, [title, content, noteType, language, isPublic]);  // Re-run when any changes
```

Effect re-runs whenever any watched value changes, triggering the debounce timer.

### Backend Update Endpoint

**PATCH** `/api/notes/:id`

```typescript
app.patch("/api/notes/:id", async (req, res) => {
  const { id } = req.params;
  const userId = req.session?.userId;
  
  // Authentication
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Verify ownership
  const note = await storage.getNoteById(id);
  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  if (note.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  // Update with new data
  const updatedNote = await storage.updateNote(id, req.body);
  res.json(updatedNote);
});
```

**Storage Implementation**:

```typescript
async updateNote(id: string, noteData: Partial<InsertNote>): Promise<Note> {
  const [note] = await db
    .update(notes)
    .set({ 
      ...noteData, 
      updatedAt: new Date()  // Automatically update timestamp
    })
    .where(eq(notes.id, id))
    .returning();
  return note;
}
```

### Performance Optimizations

#### 1. TanStack Query Caching

```typescript
const { data: note } = useQuery<Note>({
  queryKey: ["/api/notes", noteId],
  staleTime: 5 * 60 * 1000,      // 5 minutes
  cacheTime: 10 * 60 * 1000,     // 10 minutes
});
```

**Benefits**:
- Cached data used for change comparison
- Reduced initial load times
- Background refetching for freshness

#### 2. Optimistic Updates (Optional Enhancement)

```typescript
const updateMutation = useMutation({
  mutationFn: async (data: Partial<Note>) => {
    return await apiRequest("PATCH", `/api/notes/${noteId}`, data);
  },
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["/api/notes", noteId] });

    // Snapshot previous value
    const previousNote = queryClient.getQueryData(["/api/notes", noteId]);

    // Optimistically update cache
    queryClient.setQueryData(["/api/notes", noteId], (old: Note) => ({
      ...old,
      ...newData,
    }));

    return { previousNote };  // Context for rollback
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(
      ["/api/notes", noteId], 
      context.previousNote
    );
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries({ queryKey: ["/api/notes", noteId] });
  },
});
```

**Trade-offs**:
- **Pros**: Instant UI updates, better UX
- **Cons**: More complex error handling, potential desync

### User Feedback

#### Last Saved Indicator

```typescript
{lastSaved && (
  <p className="text-sm text-muted-foreground">
    Last saved: {formatDistanceToNow(lastSaved, { addSuffix: true })}
  </p>
)}
```

**Output Examples**:
- "Last saved: a few seconds ago"
- "Last saved: 2 minutes ago"
- "Last saved: about 1 hour ago"

#### Saving Indicator

```typescript
{updateMutation.isPending && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Saving...</span>
  </div>
)}
```

### Error Handling

**Network Failure**:
```typescript
onError: (error) => {
  toast({
    title: "Failed to save",
    description: "Your changes will be saved when connection is restored.",
    variant: "destructive",
  });
  // Could implement local storage backup here
}
```

**Authentication Expiry**:
```typescript
if (isUnauthorizedError(error)) {
  toast({
    title: "Session expired",
    description: "Redirecting to login...",
    variant: "destructive",
  });
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 500);
}
```

### Future Enhancements

1. **Offline Support**: LocalStorage backup for offline editing
2. **Conflict Resolution**: Handle multiple tabs editing same note
3. **Version History**: Track changes for undo/redo
4. **Real-time Collaboration**: WebSocket-based multi-user editing
5. **Selective Saves**: Only save changed fields to reduce payload

---

## AI Writing Assistant Features

The application provides three AI-powered writing tools to help students improve their academic writing.

### Overview

```
┌────────────────────────────────────────────────────────────┐
│                     Editor Interface                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AI Assistant Button                                 │  │
│  │  - Opens modal with selected text                    │  │
│  │  - Three modes: Improve | Summarize | Grammar       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          │ Selected text
                          ▼
┌────────────────────────────────────────────────────────────┐
│                  AI Assistant Modal                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mode Tabs: [Improve] [Summarize] [Grammar]         │  │
│  │  Input: Original text (read-only)                    │  │
│  │  Output: AI-generated result                         │  │
│  │  Actions: [Copy] [Replace in Editor] [Close]        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                 ┌────────┼────────┐
                 │        │        │
                 ▼        ▼        ▼
        /api/ai/improve  summarize  grammar
                 │        │        │
                 └────────┼────────┘
                          ▼
┌────────────────────────────────────────────────────────────┐
│                    OpenAI GPT-5                             │
│  - Model: gpt-5                                            │
│  - System prompts for each mode                            │
│  - Returns improved text only                              │
└────────────────────────────────────────────────────────────┘
```

### Feature 1: Text Improvement

**Endpoint**: POST `/api/ai/improve`

**Purpose**: Enhance text for clarity, coherence, and professional academic tone.

**System Prompt**:
```
You are a writing assistant. Improve the following text for clarity, coherence, and professional academic tone. Return only the improved text.
```

**Implementation**:

```typescript
app.post("/api/ai/improve", async (req, res) => {
  const { text } = req.body;

  if (!openai) {
    return res.status(503).json({ message: "OpenAI API is not configured" });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
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
});
```

**Example**:

**Input**:
```
The study looked at how students do in school when they use AI tools. We found that some students did better and some did worse depending on how they used it.
```

**Output**:
```
This study examined the correlation between AI tool utilization and academic performance among students. The findings revealed a nuanced relationship: student outcomes varied significantly based on their approach to implementing these technological resources.
```

### Feature 2: Text Summarization

**Endpoint**: POST `/api/ai/summarize`

**Purpose**: Create concise summaries while preserving key points.

**System Prompt**:
```
You are a summarization assistant. Create a concise summary of the following text while preserving key points. Return only the summary.
```

**Implementation**:

```typescript
app.post("/api/ai/summarize", async (req, res) => {
  const { text } = req.body;

  if (!openai) {
    return res.status(503).json({ message: "OpenAI API is not configured" });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
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
});
```

**Example**:

**Input**: (2000-word research paper)

**Output**:
```
This paper explores machine learning applications in healthcare, focusing on diagnostic accuracy improvements. Key findings indicate 23% increased detection rates for early-stage diseases when AI-assisted tools are integrated with traditional diagnostic methods. The study recommends cautious adoption with continued physician oversight.
```

### Feature 3: Grammar Checking

**Endpoint**: POST `/api/ai/grammar`

**Purpose**: Fix grammar, spelling, and punctuation errors.

**System Prompt**:
```
You are a grammar checker. Fix all grammar, spelling, and punctuation errors in the following text. Return only the corrected text.
```

**Implementation**:

```typescript
app.post("/api/ai/grammar", async (req, res) => {
  const { text } = req.body;

  if (!openai) {
    return res.status(503).json({ message: "OpenAI API is not configured" });
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-5",
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
});
```

**Example**:

**Input**:
```
The students wasnt able to complete there assignment's on time because of technical issue's with they're computer.
```

**Output**:
```
The students weren't able to complete their assignments on time because of technical issues with their computers.
```

### Frontend Integration

**AI Assistant Modal Component**:

```typescript
const AIAssistantModal = ({ text, onClose, onReplace }) => {
  const [mode, setMode] = useState<"improve" | "summarize" | "grammar">("improve");
  const [result, setResult] = useState("");

  const processMutation = useMutation({
    mutationFn: async (mode: string) => {
      const response = await apiRequest("POST", `/api/ai/${mode}`, { text });
      const data = await response.json();
      return data.result;
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleProcess = () => {
    processMutation.mutate(mode);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="improve">Improve</TabsTrigger>
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
          </TabsList>
        </Tabs>

        <div>
          <Label>Original Text</Label>
          <Textarea value={text} readOnly />
        </div>

        <Button onClick={handleProcess} disabled={processMutation.isPending}>
          {processMutation.isPending ? "Processing..." : "Generate"}
        </Button>

        {result && (
          <div>
            <Label>AI Result</Label>
            <Textarea value={result} readOnly />
            <div className="flex gap-2">
              <Button onClick={() => navigator.clipboard.writeText(result)}>
                Copy
              </Button>
              <Button onClick={() => onReplace(result)}>
                Replace in Editor
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### Usage Flow

1. **User selects text** in editor (or uses entire content)
2. **Clicks AI assistant button** → Modal opens
3. **Chooses mode**: Improve, Summarize, or Grammar
4. **Clicks "Generate"** → API call to OpenAI
5. **Reviews result** → Can copy or replace original text

### Rate Limiting Considerations

**Future Enhancement**:
```typescript
// server/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  message: 'Too many AI requests, please try again later'
});

app.post("/api/ai/*", aiRateLimiter, handler);
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/signup` | No | Create new user account |
| POST | `/api/auth/login` | No | Login with email/password |
| GET | `/api/auth/user` | Yes | Get current user info |
| POST | `/api/auth/logout` | Yes | Destroy session |
| POST | `/api/auth/select-role` | Yes | Set user role (student/faculty) |

### Notes Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/notes` | Yes | Get all user's notes |
| GET | `/api/notes/:id` | Yes | Get specific note (ownership check) |
| GET | `/api/notes/shared/:token` | No | Get public note by share token |
| POST | `/api/notes` | Yes | Create new note |
| PATCH | `/api/notes/:id` | Yes | Update note (auto-save) |
| DELETE | `/api/notes/:id` | Yes | Delete note |
| POST | `/api/notes/:id/share` | Yes | Generate share link |

### Citations Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/citations/:noteId` | Yes | Get all citations for note |
| POST | `/api/citations/generate` | Yes | Generate citation with OpenAI |
| DELETE | `/api/citations/:id` | Yes | Delete citation |

### AI Writing Assistant Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/ai/improve` | Yes | Improve text clarity and tone |
| POST | `/api/ai/summarize` | Yes | Summarize text |
| POST | `/api/ai/grammar` | Yes | Fix grammar/spelling errors |

### Faculty Endpoints

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/faculty/detect-ai` | Yes | Faculty | Analyze text for AI content |
| POST | `/api/faculty/verify-citation` | Yes | Faculty | Verify citation authenticity |
| GET | `/api/faculty/submissions` | Yes | Faculty | Get submissions to review |

### Submissions Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/submissions` | Yes | Get user's submissions (role-based) |
| GET | `/api/submissions/:id` | Yes | Get specific submission |
| POST | `/api/submissions` | Yes | Create submission (student only) |
| PATCH | `/api/submissions/:id` | Yes | Update submission (faculty review) |

### PDF Sharing Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/pdfs` | No | Get all public PDFs |
| GET | `/api/pdfs/my` | Yes | Get user's uploaded PDFs |
| GET | `/api/pdfs/:id` | No | Get PDF metadata |
| GET | `/api/pdfs/:id/download` | No | Get pre-signed S3 download URL |
| POST | `/api/pdfs/upload` | Yes | Upload PDF to S3 |
| DELETE | `/api/pdfs/:id` | Yes | Delete PDF from S3 and database |

---

## Environment Variables

### Required for Basic Functionality

```bash
# Database (PostgreSQL via Neon)
DATABASE_URL=postgresql://user:password@host/database

# Session Secret (for express-session)
SESSION_SECRET=your-random-secret-key-min-32-chars

# Node Environment
NODE_ENV=development|production

# Port (default: 5000)
PORT=5000
```

### Required for AI Features

```bash
# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key
```

### Required for PDF Upload (AWS S3)

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1  # or your bucket region
AWS_S3_BUCKET_NAME=your-bucket-name
```

### Optional (Clerk Authentication - Not Yet Configured)

```bash
# Clerk Authentication (for production)
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # Frontend access
```

---

## Deployment Configuration

### Development

```bash
npm run dev
```

Starts:
- Express server on port 5000
- Vite dev server with HMR
- Both served on same port (5000)

### Production Build

```bash
npm run build
```

Creates:
- Client bundle: `dist/public/`
- Server bundle: `dist/index.js`

### Production Start

```bash
npm run start
```

Runs:
- Compiled server from `dist/index.js`
- Serves static client files from `dist/public/`

### Database Migrations

```bash
# Push schema changes (development)
npm run db:push

# Generate migration files (production)
drizzle-kit generate

# Apply migrations
drizzle-kit migrate
```

### Type Checking

```bash
npm run check
```

Runs TypeScript compiler in check mode (no emit).

---

## Project Scripts Reference

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
```

---

## Conclusion

This technical documentation covers the complete architecture, technologies, and implementation details of the AcademicFlow platform. The system combines modern web technologies (React, TypeScript, PostgreSQL) with cutting-edge AI capabilities (OpenAI GPT-5) to provide a comprehensive academic workspace solution.

**Key Technical Highlights**:
- Full-stack TypeScript for end-to-end type safety
- Session-based authentication with planned Clerk migration
- Real-time auto-saving with debounced updates
- Sophisticated AI detection with dual-tier analysis
- AWS S3 integration for scalable file storage
- AI-powered citation generation and writing assistance
- Responsive, accessible UI built with Radix and Tailwind

**Security Considerations**:
- HTTP-only cookies prevent XSS
- Session-based auth with secure configuration
- Role-based access control (student/faculty)
- Pre-signed S3 URLs for secure file access
- Input validation with Zod schemas

**Scalability Features**:
- PostgreSQL with connection pooling (Neon serverless)
- TanStack Query for optimized data fetching
- S3 for distributed file storage
- Stateless server architecture (production-ready)

For additional information, see:
- `AI_DETECTION_IMPLEMENTATION.md` - Detailed AI detection logic
- `CLERK_AUTH_GUIDE.md` - Clerk authentication setup
- `design_guidelines.md` - UI/UX design principles
- `replit.md` - Project overview and architecture
