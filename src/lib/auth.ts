import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types';
import { logger } from './logger';

// Enforce JWT_SECRET environment variable for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for production');
}
// Type assertion after validation
const VALIDATED_JWT_SECRET: string = JWT_SECRET;
const JWT_EXPIRY = '7d'; // Token expires in 7 days

// Define the token payload type
export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export function generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, VALIDATED_JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify JWT token
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, VALIDATED_JWT_SECRET);
    return decoded as TokenPayload;
  } catch (error) {
    logger.auth('Token verification failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role-based middleware for API routes
export function withRoleCheck(requiredRoles: UserRole[]) {
  return async (req: Request): Promise<{ user: TokenPayload } | Response> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
      }
      
      const token = authHeader.split(' ')[1];
      const user = verifyToken(token);
      
      if (!user) {
        return Response.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
      }
      
      if (!hasRole(user.role, requiredRoles)) {
        return Response.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }
      
      return { user };
    } catch (error) {
      logger.error('Authentication middleware error', error instanceof Error ? error : new Error('Unknown authentication error'));
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
} 