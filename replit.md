# AcademicFlow - Modern Academic Workspace

## Overview

AcademicFlow is a modern, minimal academic workspace platform designed for university students and faculty. The application enables users to share notes and code, generate citations, and leverage AI-powered tools for academic writing and integrity verification. The platform supports two distinct user roles with tailored features:

**Students:** Create and share notes/code, generate academic citations, receive AI-powered writing assistance, and share subject PDFs with other students.

**Faculty:** Detect AI-generated content and verify citation accuracy.

The application follows a clean, professional design philosophy inspired by Notion and Linear, emphasizing minimal interfaces with purposeful animations and clear visual hierarchy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool for fast development and optimized production builds
- Wouter for client-side routing (lightweight alternative to React Router)
- React Query (TanStack Query) for server state management and data fetching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Shadcn/ui component library (New York style variant) for consistent UI patterns
- Custom theming system with CSS variables supporting light/dark modes
- Lucide icons for modern iconography

**Code Editor Integration:**
- CodeMirror 6 for syntax-highlighted code editing
- Support for multiple languages: JavaScript, Python, Java, C++, HTML, CSS
- One Dark theme for code syntax highlighting
- React Quill for rich text editing (lazy-loaded for performance)

**Design System:**
- Primary color: Indigo (#4F46E5)
- Typography: Inter font family with JetBrains Mono for code
- Consistent spacing scale and border radius system
- Hover and active elevation states for interactive elements

### Backend Architecture

**Server Framework:**
- Node.js with Express.js for REST API endpoints
- TypeScript for type safety across the stack
- Session-based authentication using express-session
- Custom middleware for request logging and error handling

**API Structure:**
- RESTful endpoints organized by feature domain
- `/api/auth/*` - Authentication and user management
- `/api/notes/*` - Note CRUD operations
- `/api/citations/*` - Citation generation and management
- `/api/faculty/*` - Faculty-specific features (AI detection, citation verification)
- `/api/pdfs/*` - PDF file upload, listing, and download (student feature)

**Authentication Strategy:**
- **Current:** Simple name-based authentication for quick development
  - Express-session with secure HTTP-only cookies
  - User role selection on first login (student/faculty)
  - Session persistence with 7-day expiration
- **Future:** Clerk integration ready (packages installed, guide available)
  - See `CLERK_AUTH_GUIDE.md` for manual implementation steps
  - Clerk packages (`@clerk/clerk-react`, `@clerk/express`) already installed

**AI Integration:**
- **OpenAI GPT-5 API** integration for AI-powered features (latest model released August 7, 2025)
- **Text Improvement & Summarization:** AI-powered content enhancement
- **Grammar Correction:** Automated grammar and spelling checks
- **Enhanced AI Content Detection (Faculty):**
  - Pattern-based analysis with 7 key indicators
  - Fallback detection when API unavailable
  - Comprehensive scoring (0-100) with likelihood levels
  - Detailed metrics: sentence analysis, generic phrase detection, personal voice analysis
  - Response includes: aiScore, likelihood, confidence, indicators, and detailed patterns
  - See `AI_DETECTION_IMPLEMENTATION.md` for complete documentation
- **Citation Verification:** AI-powered citation authenticity checking

### Data Storage

**Database System:**
- PostgreSQL via Neon serverless database
- Drizzle ORM for type-safe database operations
- Connection pooling via @neondatabase/serverless with WebSocket support

**Schema Design:**

**Users Table:**
- Stores user profile information
- Supports role-based access (student/faculty)
- Optional department assignment
- Designed with Clerk integration in mind (email, firstName, lastName, profileImageUrl fields)

**Notes Table:**
- Supports multiple note types: research, code, general
- Language specification for code notes
- Public/private visibility toggle
- Unique share tokens for public note sharing
- Soft cascading deletes via foreign key to users

**Citations Table:**
- Linked to notes for citation management
- Supports multiple citation styles (APA, MLA, IEEE)
- Stores original input and generated citation

**Submissions Table:**
- Student-faculty relationship tracking
- AI detection scoring
- Citation verification status
- Grading and feedback support

**PDFs Table:**
- Stores PDF document metadata for student file sharing
- Links to user who uploaded the file
- Subject categorization for easy discovery
- S3 key reference for file storage
- File metadata (name, size) for display
- Public/private visibility control

**Relations:**
- One-to-many: User → Notes
- One-to-many: User → Submissions (as student)
- One-to-many: User → Submissions (as faculty reviewer)
- One-to-many: Note → Citations
- One-to-many: User → PDFs

### External Dependencies

**Authentication Service:**
- **Current Implementation:** Express-session with name-based authentication
  - Simple name input on landing page
  - Session-based user tracking
  - No external auth service required for development
- **Clerk Ready for Production:**
  - Packages installed: `@clerk/clerk-react`, `@clerk/express`
  - Comprehensive implementation guide: `CLERK_AUTH_GUIDE.md`
  - Environment variables needed (not yet configured):
    - `CLERK_PUBLISHABLE_KEY`
    - `CLERK_SECRET_KEY`
    - `VITE_CLERK_PUBLISHABLE_KEY`

**Database Service:**
- Neon PostgreSQL serverless database
- Environment variable: `DATABASE_URL`
- WebSocket-based connections for serverless compatibility

**AI Service:**
- OpenAI API for text processing and analysis
- Environment variable: `OPENAI_API_KEY`
- Features: text improvement, summarization, grammar checking, AI detection

**File Storage:**
- **AWS S3** integration for PDF file storage
- Environment variables configured:
  - `AWS_ACCESS_KEY_ID` - S3 access key
  - `AWS_SECRET_ACCESS_KEY` - S3 secret key
  - `AWS_REGION` - S3 bucket region
  - `AWS_S3_BUCKET_NAME` - S3 bucket name
- Multer configured for file upload handling (10MB limit, PDF only)
- S3 utility service (`server/lib/s3.ts`) for upload/download/delete operations
- Signed URLs for secure temporary download access

**Development Tools:**
- Replit-specific plugins for development environment
- Vite plugins: runtime error modal, cartographer, dev banner
- Development-only features conditionally loaded

**Build & Development:**
- ESBuild for server-side bundling
- Vite for client-side bundling with TypeScript support
- Path aliases configured for clean imports (`@/*`, `@shared/*`, `@assets/*`)
- TypeScript strict mode enabled across the project

**Migration System:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Push command available for quick schema updates