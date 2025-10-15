# Clerk Authentication Implementation Guide

This guide explains how to manually integrate Clerk authentication into your AcademicFlow application.

## Prerequisites

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application in your Clerk dashboard
3. Get your API keys from the Clerk dashboard (Publishable Key and Secret Key)

## Step 1: Install Clerk Packages

The Clerk packages are already installed in your `package.json`:
- `@clerk/clerk-react` - Frontend React components and hooks
- `@clerk/express` - Backend Express middleware

If you need to install them again:
```bash
npm install @clerk/clerk-react @clerk/express
```

## Step 2: Set Environment Variables

### Development
Create or update `.env` file in the root directory:
```env
# Clerk Keys
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Frontend (for Vite)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Production (Replit Secrets)
Add these as secrets in your Replit environment:
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `VITE_CLERK_PUBLISHABLE_KEY`

## Step 3: Backend Integration

### 3.1 Restore Clerk Auth Middleware

Create or update `server/clerkAuth.ts`:

```typescript
import { clerkMiddleware, requireAuth, getAuth, clerkClient } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
  throw new Error("Missing Clerk API keys. Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY environment variables.");
}

export const clerkAuthMiddleware = clerkMiddleware();

export const requireAuthentication = requireAuth();

export function getUserId(req: Request): string | null {
  const { userId } = getAuth(req);
  return userId;
}

export async function getClerkUser(userId: string) {
  return await clerkClient.users.getUser(userId);
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const userId = getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};
```

### 3.2 Update Routes

In `server/routes.ts`:

```typescript
import { clerkAuthMiddleware, isAuthenticated, getUserId } from "./clerkAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add Clerk middleware before routes
  app.use(clerkAuthMiddleware);

  // Protect routes with isAuthenticated middleware
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
          role: null,
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add isAuthenticated to all protected routes
  // Example:
  // app.get("/api/notes", isAuthenticated, async (req, res) => { ... });
  // ...rest of your routes
}
```

### 3.3 Remove Session Middleware

In `server/index.ts`, remove the express-session middleware:

```typescript
// Remove these imports and middleware:
// import session from "express-session";
// app.use(session({ ... }));
```

## Step 4: Frontend Integration

### 4.1 Update Main Entry Point

In `client/src/main.tsx`:

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </StrictMode>
);
```

### 4.2 Update Auth Hook

In `client/src/hooks/useAuth.ts`:

```typescript
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { isSignedIn, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: isSignedIn,
  });

  return {
    user,
    clerkUser,
    isLoading: !isLoaded || userLoading,
    isAuthenticated: isSignedIn && !!user,
  };
}
```

### 4.3 Update Query Client

In `client/src/lib/queryClient.ts`:

```typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Store the getToken function globally so we can use it in requests
let clerkGetToken: (() => Promise<string | null>) | null = null;

export function setClerkGetToken(getToken: () => Promise<string | null>) {
  clerkGetToken = getToken;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  
  if (clerkGetToken) {
    const token = await clerkGetToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

// Update getQueryFn to include auth headers
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authHeaders = await getAuthHeaders();
    
    const res = await fetch(queryKey.join("/") as string, {
      headers: authHeaders,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
```

### 4.4 Update App Component

In `client/src/App.tsx`:

```typescript
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setClerkGetToken } from "./lib/queryClient";

function Router() {
  const { getToken } = useClerkAuth();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Set up Clerk token getter for API requests
  useEffect(() => {
    setClerkGetToken(getToken);
  }, [getToken]);

  // ...rest of your routing logic
}
```

### 4.5 Update Landing Page

In `client/src/pages/landing.tsx`:

```typescript
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#8B5CF6] text-white">
        {/* ...other content... */}
        
        <SignInButton mode="modal">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 border-white"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </SignInButton>
        
        {/* ...rest of landing page... */}
      </div>
    </div>
  );
}
```

### 4.6 Update Layout Component

In `client/src/components/layout.tsx`:

```typescript
import { UserButton } from "@clerk/clerk-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="px-6 py-3 mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            {/* ...navigation items... */}
            
            {/* Replace custom logout with UserButton */}
            <div className="flex items-center gap-3">
              {user?.role && (
                <span className="text-xs text-muted-foreground capitalize hidden sm:inline" data-testid="text-user-role">
                  {user.role}
                </span>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  );
}
```

## Step 5: Test Your Integration

1. Start your development server: `npm run dev`
2. Click "Get Started" on the landing page
3. Sign up with Clerk (email, Google, etc.)
4. Verify you're redirected to the role selection
5. Test protected routes and features

## Troubleshooting

### Common Issues:

1. **401 Unauthorized errors**
   - Check that Clerk keys are correctly set in environment variables
   - Verify ClerkProvider is wrapping your app
   - Ensure middleware is properly applied in server routes

2. **Token not being sent**
   - Make sure `setClerkGetToken` is called in App component
   - Check that auth headers are being added in queryClient

3. **User not syncing to database**
   - Verify the `/api/auth/user` route creates users from Clerk data
   - Check database connection and schema

4. **Development vs Production**
   - Use test keys (`pk_test_...`) for development
   - Use production keys (`pk_live_...`) for production
   - Update environment variables accordingly

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Express SDK](https://clerk.com/docs/references/backend/overview)
- [Clerk Dashboard](https://dashboard.clerk.com)

## Security Best Practices

1. Never commit API keys to version control
2. Use environment variables for all sensitive data
3. Rotate keys regularly in production
4. Enable multi-factor authentication in Clerk dashboard
5. Monitor Clerk dashboard for suspicious activity
6. Use webhooks for real-time user event handling
