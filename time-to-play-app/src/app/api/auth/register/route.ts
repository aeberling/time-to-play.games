import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateUserToken } from '@/lib/auth/jwt';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { setAuthCookies } from '@/lib/auth/cookies';

interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

/**
 * POST /api/auth/register
 * Register a new user account
 */

export async function POST(request: Request) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, displayName } = body;

    // Validate required fields
    if (!email || !password || !displayName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and display name are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Validate display name
    if (displayName.length < 3 || displayName.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Display name must be between 3 and 20 characters',
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        isGuest: false,
        email: email.toLowerCase(),
        passwordHash: hashedPassword, // Use passwordHash instead of password
        displayName,
        themeId: 'ocean-breeze', // Default theme
        stats: {
          create: {
            // Initialize with default values (all stats default to 0 in schema)
          },
        },
      },
      include: {
        stats: true,
      },
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
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
