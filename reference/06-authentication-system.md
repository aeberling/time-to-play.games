# Authentication & User Management System

## Overview

Time to Play uses a flexible authentication system that prioritizes accessibility: players can start as guests immediately and optionally convert to registered accounts later. This document details the complete authentication flow, security measures, and implementation.

## Authentication Strategies

### Strategy 1: Guest Authentication

**Purpose**: Remove barriers to entry. Players can start playing immediately without registration.

**How It Works**:
1. User visits site for first time
2. Client requests guest account: `POST /api/auth/guest`
3. Server generates:
   - Unique user ID (CUID)
   - Guest token (cryptographically random)
   - Display name (e.g., "Guest_7342")
4. Server creates User record with `isGuest=true`
5. Server issues JWT with 7-day expiration
6. JWT stored in HTTP-only cookie
7. User can immediately join/create games

**Guest Token Structure**:
```typescript
interface GuestToken {
  userId: string;
  guestToken: string; // Used for account conversion
  isGuest: true;
  displayName: string;
  exp: number; // 7 days from creation
}
```

**Limitations**:
- 7-day expiration (after which account and stats are lost)
- No password recovery
- No cross-device sync
- Limited to one browser/device

---

### Strategy 2: Registered User Authentication

**Purpose**: Long-term accounts with full features.

**How It Works**:
1. User provides email + password
2. Server validates:
   - Email format and uniqueness
   - Password strength (min 8 chars, 1 uppercase, 1 number)
3. Server hashes password with bcrypt (cost factor 12)
4. Server creates User record with `isGuest=false`
5. Server issues JWT with 30-day refresh token
6. JWT stored in HTTP-only cookie

**JWT Structure**:
```typescript
interface RegisteredToken {
  userId: string;
  email: string;
  username?: string;
  displayName: string;
  isGuest: false;
  exp: number; // 15 minutes (access token)
}
```

**Benefits**:
- Permanent account
- Stats preserved forever
- Cross-device access
- Password recovery via email

---

### Strategy 3: Guest → Registered Conversion

**Purpose**: Convert existing guest account to registered account, preserving stats.

**How It Works**:
1. Guest user clicks "Create Account"
2. Client sends: `POST /api/auth/register` with current guest JWT
3. Server validates guest token
4. Server checks email availability
5. Server updates existing User record:
   - Sets `isGuest=false`
   - Adds email and password hash
   - Optionally adds username
   - Clears `guestToken`
6. **All existing game history and stats are preserved** (same user ID)
7. Server issues new JWT as registered user

**Database Transaction**:
```typescript
await prisma.$transaction(async (tx) => {
  // Validate guest token
  const user = await tx.user.findUnique({
    where: { guestToken },
    include: { stats: true }
  });

  if (!user || !user.isGuest) {
    throw new Error('Invalid guest token');
  }

  // Update to registered user
  const updatedUser = await tx.user.update({
    where: { id: user.id },
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 12),
      username,
      isGuest: false,
      guestToken: null
    }
  });

  // Stats automatically preserved (same user ID)
  return updatedUser;
});
```

---

## JWT Implementation

### Token Types

**Access Token** (short-lived):
- Expiration: 15 minutes
- Used for all authenticated requests
- Stored in HTTP-only cookie: `auth_token`
- Cannot be accessed by JavaScript

**Refresh Token** (long-lived):
- Expiration: 30 days (registered), 7 days (guest)
- Used to obtain new access tokens
- Stored in HTTP-only cookie: `refresh_token`
- Rotated on each use

### Token Generation

```typescript
import jwt from 'jsonwebtoken';

function generateAccessToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isGuest: user.isGuest
    },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

function generateRefreshToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      tokenVersion: user.tokenVersion // For invalidation
    },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: user.isGuest ? '7d' : '30d' }
  );
}
```

### Token Verification Middleware

```typescript
// middleware/auth.ts
import { NextRequest } from 'next/server';

export async function verifyAuth(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token) {
    return { authenticated: false, user: null };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return { authenticated: false, user: null };
    }

    // Check if guest token expired
    if (user.isGuest && isExpired(user.createdAt, 7)) {
      // Auto-delete expired guest accounts
      await prisma.user.delete({ where: { id: user.id } });
      return { authenticated: false, user: null };
    }

    return { authenticated: true, user };
  } catch (error) {
    // Token invalid or expired
    return { authenticated: false, user: null };
  }
}
```

### Token Refresh Flow

```typescript
// app/api/auth/refresh/route.ts
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return Response.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as RefreshTokenPayload;

    // Get user and verify token version
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      // Token has been invalidated
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Set cookies
    const response = Response.json({ success: true });
    response.cookies.set('auth_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    });
    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: user.isGuest ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

---

## Security Measures

### Password Security

**Hashing**:
```typescript
import bcrypt from 'bcrypt';

// Hashing (during registration/password change)
const passwordHash = await bcrypt.hash(password, 12); // Cost factor 12

// Verification (during login)
const isValid = await bcrypt.compare(password, user.passwordHash);
```

**Password Requirements**:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (optional but recommended)

**Validation**:
```typescript
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');
```

### Cookie Security

All auth cookies use these settings:
```typescript
{
  httpOnly: true,        // Cannot be accessed by JavaScript
  secure: true,          // HTTPS only (production)
  sameSite: 'lax',      // CSRF protection
  path: '/',
  domain: '.time-to-play.games' // Allow subdomains
}
```

### CSRF Protection

Next.js automatically provides CSRF protection for API routes. For WebSocket connections, we verify JWT on handshake:

```typescript
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});
```

### Rate Limiting

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1m'), // 5 requests per minute
  analytics: true
});

export async function rateLimitAuth(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(
    `auth:${identifier}`
  );

  return {
    success,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  };
}
```

Apply to auth endpoints:
- Login: 5 attempts per minute per IP
- Register: 3 attempts per hour per IP
- Guest creation: 10 per hour per IP

---

## Client-Side Implementation

### Auth Context Provider

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    checkAuth();

    // Set up token refresh interval (every 10 minutes)
    const interval = setInterval(() => {
      refreshAuth();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loginAsGuest() {
    const res = await fetch('/api/auth/guest', {
      method: 'POST',
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Failed to create guest account');

    const data = await res.json();
    setUser(data.user);
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error.message);
    }

    const data = await res.json();
    setUser(data.user);
  }

  async function register(email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error.message);
    }

    const data = await res.json();
    setUser(data.user);
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
  }

  async function refreshAuth() {
    try {
      await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginAsGuest, logout, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Protected Routes

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

---

## Guest Account Cleanup

### Automatic Cleanup Job

```typescript
// jobs/cleanup-guests.ts
import { prisma } from '@/lib/db';

export async function cleanupExpiredGuests() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Delete guest accounts older than 7 days
  const result = await prisma.user.deleteMany({
    where: {
      isGuest: true,
      createdAt: {
        lt: sevenDaysAgo
      }
    }
  });

  console.log(`Cleaned up ${result.count} expired guest accounts`);
}
```

Run as cron job (daily):
```typescript
// Using node-cron
import cron from 'node-cron';

// Run every day at 3 AM
cron.schedule('0 3 * * *', cleanupExpiredGuests);
```

---

## Account Recovery (Registered Users Only)

### Password Reset Flow

1. User clicks "Forgot Password"
2. Enters email
3. Server generates reset token (6-digit code)
4. Server stores token in Redis with 15-min TTL
5. Server sends email with reset code
6. User enters code on reset page
7. Server validates code
8. User sets new password
9. Server updates password and invalidates all existing tokens

```typescript
// app/api/auth/forgot-password/route.ts
export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.isGuest) {
    // Don't reveal if email exists
    return Response.json({ success: true });
  }

  // Generate 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Store in Redis with 15-min expiration
  await redis.setex(`reset:${email}`, 900, resetCode);

  // Send email (using service like Resend or SendGrid)
  await sendPasswordResetEmail(email, resetCode);

  return Response.json({ success: true });
}
```

---

## Session Management

### User Sessions Table (Optional Enhancement)

Track all active sessions for security:

```prisma
model Session {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  token       String   @unique
  deviceInfo  String?  // User agent
  ipAddress   String?
  lastActiveAt DateTime @default(now())
  expiresAt   DateTime

  @@index([userId])
  @@index([token])
}
```

Allows features like:
- "View all active sessions"
- "Log out all other devices"
- Security alerts for new device logins

---

This authentication system provides a seamless experience for casual players while offering full security for registered users.
