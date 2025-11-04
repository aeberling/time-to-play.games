import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateUserToken } from '@/lib/auth/jwt';
import { verifyPassword } from '@/lib/auth/password';
import { setAuthCookies } from '@/lib/auth/cookies';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login
 * Login with email and password
 */
export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        stats: true,
      },
    });

    // User not found or is a guest (guests can't login)
    if (!user || user.isGuest || !user.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT tokens
    const tokens = generateUserToken(user.id, user.displayName);

    // Set HTTP-only cookies
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    // Return user data (exclude password)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          isGuest: user.isGuest,
          themeId: user.themeId,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to login',
      },
      { status: 500 }
    );
  }
}
