import { Request, Response, NextFunction } from 'express';

// Dummy token for testing - in production this would be properly generated
const DUMMY_TOKEN = 'dummy-bearer-token-12345';

export interface AuthContext {
  isAuthenticated: boolean;
  token?: string;
  userId?: string;
}

export function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function validateToken(token: string): boolean {
  // Dummy validation - accepts any token that matches our dummy token
  // In production, this would validate JWT or check against a database
  return token === DUMMY_TOKEN;
}

export function authMiddleware(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);
  
  if (!token) {
    req.auth = { isAuthenticated: false };
    res.status(401).json({
      error: 'Authorization required',
      message: 'Missing Bearer token in Authorization header'
    });
    return;
  }
  
  if (!validateToken(token)) {
    req.auth = { isAuthenticated: false };
    res.status(401).json({
      error: 'Invalid token',
      message: 'The provided Bearer token is invalid'
    });
    return;
  }
  
  req.auth = {
    isAuthenticated: true,
    token,
    userId: 'dummy-user'
  };
  
  next();
}

export function optionalAuthMiddleware(req: Request & { auth?: AuthContext }, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);
  
  if (!token) {
    req.auth = { isAuthenticated: false };
    return next();
  }
  
  if (!validateToken(token)) {
    req.auth = { isAuthenticated: false };
    return next();
  }
  
  req.auth = {
    isAuthenticated: true,
    token,
    userId: 'dummy-user'
  };
  
  next();
}

export function generateDummyToken(): string {
  return DUMMY_TOKEN;
}