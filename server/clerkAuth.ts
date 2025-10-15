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
